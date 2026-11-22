#!/usr/bin/env bash
# The only thing Jenkins can run for the website. The app's restricted command
# (optifin repo, ops/contabo/ci/ci-run.sh) hands every "site ..." request to this
# script, so only these forms are accepted:
#
#   build <commit>         check that the site builds, deploy nothing
#   development <commit>   build and start https://dev.optifin.app
#   live <commit>          build and start https://optifin.app
#
# <commit> must be a full 40-character hash of this repository. The site is built
# inside Docker (nothing is installed on the server). Installed by ops/install.sh
# to /opt/optifin/bin/site/ci-run.sh together with Dockerfile, Caddyfile and compose.yml.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_REPO="${OPTIFIN_SITE_REPO:-/opt/optifin/site-repo}"
SITE_GIT="${OPTIFIN_SITE_GIT:-https://github.com/sajjadulislam007/optifin-site.git}"
WORK_ROOT="${OPTIFIN_CI_WORK:-/opt/optifin}"
LOCK="${OPTIFIN_CI_LOCK:-/tmp/optifin-ci.lock}"

target="${1:-}"
sha="${2:-}"
extra="${3:-}"

fail() { echo "site ci-run: $1" >&2; exit 2; }
[[ "$target" == "build" || "$target" == "development" || "$target" == "live" ]] \
  || fail "target must be build, development or live"
[[ "$sha" =~ ^[0-9a-f]{40}$ && -z "$extra" ]] || fail "usage: <build|development|live> <40-character commit>"

if [[ "${CI_DRY_RUN:-0}" == "1" ]]; then
  echo "dry-run: site target=${target} sha=${sha}"
  exit 0
fi

# One job at a time on this server (shared with the app's builds and deploys).
if command -v flock >/dev/null 2>&1; then
  exec 9>"$LOCK"
  flock -w 3600 9 || fail "another job has been running for over an hour"
fi

if [[ ! -d "$SITE_REPO/.git" ]]; then
  git clone --quiet "$SITE_GIT" "$SITE_REPO"
fi
git -C "$SITE_REPO" fetch --quiet origin '+refs/heads/*:refs/remotes/origin/*'
git -C "$SITE_REPO" cat-file -e "${sha}^{commit}" 2>/dev/null || fail "commit ${sha:0:8} is not in the repository"

work="$(mktemp -d "$WORK_ROOT/ci-work.XXXXXX")"
tag="optifin-site:${sha:0:12}"
keep=0
cleanup() {
  [[ "$keep" == "1" ]] || docker rmi "$tag" >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT

git -C "$SITE_REPO" archive "$sha" | tar -x -C "$work"
cp "$HERE/Caddyfile" "$work/.optifin-site.Caddyfile"
echo "Building the website ${sha:0:8} (packages come from cache when package-lock.json is unchanged)"
docker build --progress=plain -f "$HERE/Dockerfile" -t "$tag" "$work"

if [[ "$target" == "build" ]]; then
  echo "The website ${sha:0:8} builds. Nothing was deployed."
  exit 0
fi

keep=1
if [[ "$target" == "live" ]]; then
  service="site-live"; container="optifin-site-live"; var="LIVE_TAG"
else
  service="site-dev"; container="optifin-site-dev"; var="DEV_TAG"
fi
export "$var=${sha:0:12}"
docker compose -f "$HERE/compose.yml" up -d "$service"

echo "Waiting for ${container} to become healthy..."
for _ in $(seq 1 30); do
  state="$(docker inspect --format '{{.State.Health.Status}}' "$container" 2>/dev/null || true)"
  if [[ "$state" == "healthy" ]]; then
    echo "Website ${sha:0:8} is running on ${target}."
    # Keep the newest three images (enough to roll back); running ones are never removed.
    docker images optifin-site --format '{{.Repository}}:{{.Tag}}' | tail -n +4 \
      | xargs -r docker rmi >/dev/null 2>&1 || true
    docker image prune -f >/dev/null 2>&1 || true
    exit 0
  fi
  sleep 2
done
docker logs --tail 40 "$container" >&2 || true
fail "${container} did not become healthy"
