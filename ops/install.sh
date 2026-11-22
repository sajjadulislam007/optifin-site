#!/usr/bin/env bash
# Installs the website's deployment on the Contabo server. Run as the deploy user,
# after the app's ops/contabo/jenkins/install-ci.sh has been run once (it creates
# the shared folders this script fills):
#
#   git clone https://github.com/sajjadulislam007/optifin-site.git /opt/optifin/site-repo   (first time)
#   bash /opt/optifin/site-repo/ops/install.sh
#
# Re-run it after any change in ops/. Then restart Caddy and Jenkins (printed below).
set -euo pipefail

if [[ $EUID -eq 0 ]]; then
  echo "Run this as the deploy user, not root." >&2
  exit 1
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN=/opt/optifin/bin/site
SITES=/opt/optifin/sites
JOBS=/opt/optifin/jenkins-jobs

for d in /opt/optifin/bin/ci-run.sh "$SITES" "$JOBS"; do
  [[ -e "$d" ]] || { echo "Missing $d. Run the app's ops/contabo/jenkins/install-ci.sh first." >&2; exit 1; }
done

mkdir -p "$BIN"
install -m 755 "$HERE/ci-run.sh" "$BIN/ci-run.sh"
install -m 644 "$HERE/Dockerfile" "$HERE/Caddyfile" "$HERE/compose.yml" "$BIN/"
install -m 644 "$HERE/optifin-site.caddy" "$SITES/optifin-site.caddy"
install -m 644 "$HERE/jenkins-jobs.groovy" "$JOBS/extra-jobs.groovy"

echo
echo "Website deployment installed."
echo
echo "Now (once, or after changing ops/):"
echo "  cd /opt/optifin/repo/ops/contabo/stack"
echo "  APP_VERSION=\$(git rev-parse HEAD) docker compose restart caddy"
echo "  APP_VERSION=\$(git rev-parse HEAD) docker compose --profile ci up -d --build jenkins"
