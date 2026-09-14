# Attar Dienstleistungen

Astro 5, server output, Tailwind. Contact and application forms post to
`/api/contact` and `/api/apply`, which send mail through Gmail
(`GMAIL_USER`, `GMAIL_APP_PASSWORD`).

## Running it

    npm install
    npm run dev        # http://localhost:4321
    npm run build      # dist/ — dist/server/entry.mjs is a standalone HTTP server
    HOST=127.0.0.1 PORT=3001 node dist/server/entry.mjs

## Server

Deployed on the same VPS as Avero, as its own user, service and nginx block.
The site was on Vercel; the Vercel adapter, `vercel.json` and the Vercel
analytics/speed-insights packages are gone. What `vercel.json` did is now
done by nginx: security headers, and the maintenance redirect.

- `attar-deploy` — pull `master`, `npm ci`, build, restart, health-check.
- `attar-maintenance on|off` — everything except `/maintenance` redirects
  there (503 + Retry-After) while it is on.
- `site-domain attar <host> [<host> …]` — bind a hostname with a Let's
  Encrypt certificate, HTTP → HTTPS, HSTS. Names must resolve to the box.

Env lives in `/srv/attar/app/.env` (git-ignored, survives deploys):
`GMAIL_USER`, `GMAIL_APP_PASSWORD`.
