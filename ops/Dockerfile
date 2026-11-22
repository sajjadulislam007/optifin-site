# Builds the Optifin website (Astro) into a tiny web server image.
# The build context is a clean checkout of the optifin-site repository; ci-run.sh
# copies Caddyfile into it as .optifin-site.Caddyfile before building.
#
# The package install layer is cached until package.json or package-lock.json change,
# so a content-only change rebuilds in about a minute.
FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY .optifin-site.Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
