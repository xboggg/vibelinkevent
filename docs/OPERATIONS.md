# VibeLink Event — Operations

## Deploying

**Auto-deploy:** push to `main` triggers
`.github/workflows/deploy.yml`. The workflow:

1. Tars SOURCE (excluding `node_modules`, `dist`, `events/`, `audio/`,
   `backup_jan23/`, `docs/`, `.env`) — ~5MB bundle
2. SCPs the source tarball to **server 144** (relay) via locked deploy key
3. Runs `/usr/local/bin/vibelinkevent-forward` on 144, which:
   - scp's the tarball onward to server 38 (fast — ~12s)
   - ssh's 38 to run `/usr/local/bin/vibelinkevent-install`
4. On 38, the install script:
   - Stages source in `/opt/vibelinkevent-build/`
   - Runs `npm ci --legacy-peer-deps` only if `package*.json` changed
     (`node_modules/` is reused across deploys for speed)
   - `npm run build` (vite → dist/)
   - **Additive rsync** `dist/*` → `/var/www/vibelinkevent.com/`
     (NO --delete — so prerendered HTML routes, portfolio/docs/,
     legacy folders, etc. survive)
   - chown www-data, fix perms, `nginx -t && systemctl reload nginx`

**Why the relay through 144?** Direct GH-runner → server-38 scp drops at
exactly 120s every attempt (something in that network path doesn't
tolerate long-running SSH). The 144→38 hop completes in seconds, so we
relay through it.

**Docs-only commits skip the deploy** — workflow uses
`paths-ignore: ['**.md', 'docs/**', 'DOCS/**']`.

Watch a deploy: https://github.com/xboggg/vibelinkevent/actions

**Manual deploy (from your workstation):**
```bash
cd ~/vibelink
tar --exclude='./node_modules' --exclude='./dist' --exclude='./events' \
    --exclude='./audio' --exclude='./.env' \
    -czf /tmp/vlb.tar.gz .
scp /tmp/vlb.tar.gz root@144.91.71.106:/tmp/vibelinkevent-fwd.tar.gz
ssh root@144.91.71.106 /usr/local/bin/vibelinkevent-forward
```

**Re-running prerender for SEO:**
```bash
# On the server (puppeteer required — pre-installed in CI but not on prod)
ssh root@38.242.195.0
cd /tmp && git clone https://github.com/xboggg/vibelinkevent && cd vibelinkevent
npm ci --legacy-peer-deps
npm run build
node prerender.js
# then copy the freshly-prerendered HTML routes into webroot:
rsync -a dist/about/ /var/www/vibelinkevent.com/about/
rsync -a dist/pricing/ /var/www/vibelinkevent.com/pricing/
# ... etc. for each route in prerender.js
```

## Subdomain mirrors

Each major event has its OWN subdomain and webroot
(e.g. `charlestaylor.vibelinkevent.com` → `/var/www/charlestaylor.vibelinkevent.com/`).
**These are NOT updated by the main deploy.** The main vhost has no
`/events/<event>/` mirror — that URL just falls through to the SPA.
Always link users to the subdomain.

To update an event mini-site from your local source, rsync from the
local `events/<event>/` source folder to its subdomain webroot:

```bash
# From your local vibelink checkout
rsync -a --delete events/charlestaylor/ \
      root@38.242.195.0:/var/www/charlestaylor.vibelinkevent.com/
ssh root@38.242.195.0 'chown -R www-data:www-data /var/www/charlestaylor.vibelinkevent.com/'
```

Subdomain → folder map (verify in `/etc/nginx/sites-enabled/` before
pushing — naming isn't always one-for-one with the source folder):

| Local source            | Subdomain                          |
| ----------------------- | ---------------------------------- |
| `events/charlestaylor/` | `charlestaylor.vibelinkevent.com`  |
| `events/atta-panyin/`   | `attapanin.vibelinkevent.com`      |
| `events/baby-adjoa/`    | `babyadjoa.vibelinkevent.com`      |
| `events/baby-kwame/`    | `babykwame.vibelinkevent.com`      |
| `events/coleman/`       | `coleman.vibelinkevent.com`        |
| `events/dr-mensah/`     | `drmensah.vibelinkevent.com`       |
| `events/kweku-efua/`    | `kwekuefua.vibelinkevent.com`      |
| `events/mama-akosua/`   | `mamaakosua.vibelinkevent.com`     |
| `events/nana60/`        | `nana60.vibelinkevent.com`         |
| `events/nanayaw/`       | `nanayaw.vibelinkevent.com`        |

## nginx

Vhosts: `/etc/nginx/sites-enabled/vibelinkevent.com` plus one per event
subdomain. After changes:

```bash
nginx -t
systemctl reload nginx
```

The main vhost has IP-restricted `/deploy-webhook` and
`/deploy-now` endpoints, both legacy and harmless (they proxy to port
9000 which is no longer running). Safe to leave or remove.

## Secrets

Browser-side (build-time, inlined in dist):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- (set in `.env` locally; GitHub Actions reads from repo secrets if you
  push these later)

Server-side (used by PHP endpoints under events/<event>/api/):
- Each event's `api/.env` holds Resend keys, captcha secrets, etc.
  These are NOT in git and live only on the server.

## PHP endpoints

Per-event PHP files (`events/<event>/api/condolences.php`, etc.) are
served by `php-fpm` (PHP 8). Restart php-fpm if it gets stuck:

```bash
systemctl status php8.3-fpm
systemctl reload php8.3-fpm
tail -f /var/log/php8.3-fpm.log
```

## Portfolio docs wiki

`/portfolio/docs/` is gated with HTTP Basic Auth. Credentials are in
the nginx `auth_basic_user_file` (server-managed, not in repo).
Adding a new portfolio doc:

```bash
# On server
htpasswd /etc/nginx/.htpasswd-portfolio NEW_USER  # only to add a viewer
cp my-portfolio.html /var/www/vibelinkevent.com/portfolio/docs/portfolios/
chown www-data:www-data /var/www/vibelinkevent.com/portfolio/docs/portfolios/my-portfolio.html
```

## Backups

Daily at 02:00 UTC, `/opt/trendimovies/backup/backup.sh` on 144 +
`/opt/vibelink/backup.sh` on 38 upload to Google Drive:

- `gdrive:38-master/daily/vibelinkevent-DATE.tar.gz` — webroot snapshot
- `gdrive:databases/38-master/DATE/supabase-vibelink-DATE.dump` — Supabase
- `gdrive:38-master/daily/vibelinkevent-deploy-scripts-DATE.tar.gz` — install + gate

## Monitoring

```bash
# nginx access + error logs
tail -f /var/log/nginx/vibelinkevent.com.access.log
tail -f /var/log/nginx/error.log

# Deploy gate rejections
journalctl -t vibelinkevent-deploy --since "1 day ago"

# php-fpm slow queries
tail -f /var/log/php8.3-fpm-slow.log 2>/dev/null
```
