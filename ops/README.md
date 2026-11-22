# Website deployment (Contabo server)

Two environments, both built from this repository by Jenkins:

| Environment | Address | Notes |
|---|---|---|
| development | https://dev.optifin.app | not indexed by search engines; check changes here first |
| live | https://www.optifin.app (optifin.app redirects to it) | main branch only |

```
push a branch -> Jenkins > optifin-site > Build with Parameters
  -> BRANCH + ENVIRONMENT (development / live) -> Build
```

## How it works

- The site is built inside Docker (`Dockerfile`, Astro build) into a small Caddy web
  server image (`Caddyfile`). Nothing is installed on the server. The package install
  layer is cached until `package-lock.json` changes.
- `compose.yml` runs the two containers `optifin-site-dev` and `optifin-site-live`
  on the app stack's `edge` network. The server's main Caddy
  (`optifin-site.caddy`) gives them HTTPS and the domain names.
- Jenkins can only run `ci-run.sh` (through the app's restricted SSH command, which
  hands `site ...` to it): `build|development|live <40-character commit>`.
- The newest three images are kept for rollback; older ones are removed.
- The Jenkins job is `jenkins-jobs.groovy`; its pipeline is `Jenkinsfile`, always
  read from `main`.

## One-time setup on the server (as the deploy user)

1. The app's `ops/contabo/jenkins/install-ci.sh` must have been run (it creates the
   shared folders and the restricted command). Pull the latest app repo first.
2. DNS (Namecheap): A record `dev` -> 80.190.77.92.
3. `git clone https://github.com/sajjadulislam007/optifin-site.git /opt/optifin/site-repo`
   then `bash /opt/optifin/site-repo/ops/install.sh`.
4. Run the three commands it prints (restart Caddy, rebuild Jenkins).
5. Jenkins > optifin-site > Build with Parameters: `origin/main`, `development`.
6. Open https://dev.optifin.app.

## Going live (moving optifin.app from DigitalOcean)

1. Run the `live` build and check it is healthy (`docker ps` shows `optifin-site-live`).
2. In Namecheap, change the `@` and `www` records to 80.190.77.92 (keep the old
   DigitalOcean site until the new one answers).
3. Caddy issues the HTTPS certificates by itself once DNS points to the server.

## Everyday use

1. Push your branch. 2. Build `development`, check https://dev.optifin.app.
3. Merge to `main`, build `live`.
