# VibeLink Event — Operations

## Deploying

**Auto-deploy:** push to `main` triggers
`.github/workflows/deploy.yml`. The workflow:

1. `npm ci --legacy-peer-deps` (some Radix peer deps need this)
2. `npm run build` (vite → dist/)
3. Tars `dist/` only
4. SCPs tarball to server 38 via locked deploy key
5. Runs `/usr/local/bin/vibelinkevent-install`, which:
   - Stages the tarball
   - **Additive rsync** dist contents → webroot (NO --delete, so
     prerendered routes, events/*, portfolio/docs/*, and any other
     server-managed content are preserved)
   - Sets perms (www-data:www-data, dirs 755, files 644)
   - `nginx -t && systemctl reload nginx`

**Docs-only commits skip the deploy** — workflow uses
`paths-ignore: ['**.md', 'DOCS/**']`.

Watch a deploy: https://github.com/xboggg/vibelinkevent/actions

**Manual deploy (server SSH):**
```bash
# On a workstation
cd ~/vibelink
npm ci --legacy-peer-deps
npm run build
tar -czf /tmp/vlb.tar.gz dist
scp /tmp/vlb.tar.gz root@38.242.195.0:/tmp/vibelinkevent-new.tar.gz
ssh root@38.242.195.0 /usr/local/bin/vibelinkevent-install
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

Each major event also runs from a sibling subdomain
(e.g. `charlestaylor.vibelinkevent.com` → `/var/www/charlestaylor.vibelinkevent.com/`).
**These are NOT updated by the main deploy.** Update them with rsync:

```bash
ssh root@38.242.195.0
rsync -a /var/www/vibelinkevent.com/events/charlestaylor/ \
        /var/www/charlestaylor.vibelinkevent.com/
chown -R www-data:www-data /var/www/charlestaylor.vibelinkevent.com/
```

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
