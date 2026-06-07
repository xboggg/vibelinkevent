# VibeLink Event — Disaster Recovery

## Inventory

| Component                        | Source of truth                                            |
| -------------------------------- | ---------------------------------------------------------- |
| Source code                      | `github.com/xboggg/vibelinkevent`                          |
| Per-event PHP endpoints          | repo `events/<event>/api/*.php` (no secrets in repo)       |
| Per-event API `.env` (Resend keys, etc.) | only on server, captured in daily configs-tarball     |
| Webroot (incl. portfolio docs)   | `gdrive:38-master/daily/vibelinkevent-DATE.tar.gz`         |
| Supabase Postgres (vibelink schema) | `gdrive:databases/38-master/DATE/supabase-DATE.dump`    |
| nginx vhost configs              | `gdrive:38-master/daily/server-configs-DATE.tar.gz`        |
| SSL cert (Let's Encrypt)         | re-issued by certbot on first deploy                       |
| Portfolio Basic Auth credentials | `gdrive:38-master/daily/server-configs-DATE.tar.gz`        |
| Deploy gate scripts              | `gdrive:38-master/daily/vibelinkevent-deploy-scripts-*.tar.gz` |
| Deploy key (server side)         | regenerate; update GitHub secret `DEPLOY_SSH_KEY`           |

## Rolling back a bad deploy

Because the install script is additive, "rollback" means restoring
files the deploy overwrote. The simplest path:

```bash
ssh root@38.242.195.0
DATE=$(date -d 'yesterday' +%F)
rclone copy gdrive:38-master/daily/vibelinkevent-$DATE.tar.gz /tmp/
tar -xzf /tmp/vibelinkevent-$DATE.tar.gz -C /tmp/
rsync -a --delete /tmp/var/www/vibelinkevent.com/ /var/www/vibelinkevent.com/
chown -R www-data:www-data /var/www/vibelinkevent.com
systemctl reload nginx
```

## Lost a single event mini-site

If `events/<event>/` got wiped:

```bash
# Pull yesterday's archive
DATE=$(date -d 'yesterday' +%F)
rclone copy gdrive:38-master/daily/vibelinkevent-$DATE.tar.gz /tmp/

# Extract just the missing event folder
tar -xzf /tmp/vibelinkevent-$DATE.tar.gz \
  --strip-components=4 \
  -C /var/www/vibelinkevent.com/events/ \
  var/www/vibelinkevent.com/events/<event>/

chown -R www-data:www-data /var/www/vibelinkevent.com/events/<event>/
```

## Supabase data loss (vibelink schema)

```bash
# 1. Stop reads to the schema
docker exec -it supabase-db psql -U postgres -d postgres \
  -c "REVOKE ALL ON SCHEMA vibelink FROM PUBLIC, anon, authenticated;"

# 2. Pull yesterday's dump
DATE=$(date -d 'yesterday' +%F)
rclone copy gdrive:databases/38-master/$DATE/supabase-$DATE.dump /tmp/

# 3. Restore the vibelink schema
docker cp /tmp/supabase-$DATE.dump supabase-db:/tmp/
docker exec -it supabase-db pg_restore -U postgres -d postgres \
  --clean --if-exists --schema=vibelink /tmp/supabase-$DATE.dump

# 4. Re-grant
docker exec -it supabase-db psql -U postgres -d postgres \
  -c "GRANT USAGE ON SCHEMA vibelink TO anon, authenticated;"
```

## Rebuild on a fresh server (server 38 replacement)

```bash
# ── On the NEW server ────────────────────────────────────────────────

# 1. Base packages
apt-get update && apt-get install -y nginx php8.3-fpm php8.3-curl php8.3-json \
  certbot python3-certbot-nginx rclone git nodejs npm rsync

# 2. Configure rclone with the same Google Drive remote (paste the gdrive
#    block from the configs tarball)
mkdir -p /root/.config/rclone
rclone copy gdrive:38-master/daily/server-configs-LATEST.tar.gz /tmp/
tar -xzf /tmp/server-configs-LATEST.tar.gz -C /

# 3. Restore webroot
mkdir -p /var/www/vibelinkevent.com
rclone copy gdrive:38-master/daily/vibelinkevent-LATEST.tar.gz /tmp/
tar -xzf /tmp/vibelinkevent-LATEST.tar.gz -C /
chown -R www-data:www-data /var/www/vibelinkevent.com

# 4. Spin up Supabase (Docker — same setup as on 38)
#    See /root/cyberabofra/DOCS/DISASTER_RECOVERY.md for the Supabase
#    bring-up steps (same self-hosted Postgres pattern).
#    Then restore the vibelink schema from yesterday's dump.

# 5. nginx vhosts
ln -s /etc/nginx/sites-available/vibelinkevent.com /etc/nginx/sites-enabled/
for e in attapanyin babyadjoa babykwame charlestaylor coleman drmensah \
         kwekuefua mamaakosua nana60 nanayaw nortey osupresec70 \
         pastormensah sarahjohn wo1deku evmin; do
  ln -s /etc/nginx/sites-available/$e.vibelinkevent.com /etc/nginx/sites-enabled/ 2>/dev/null
done
nginx -t && systemctl reload nginx

# 6. Re-issue SSL certs
certbot --nginx -d vibelinkevent.com -d www.vibelinkevent.com
# Repeat for each event subdomain

# 7. Restore deploy gate scripts
rclone copy gdrive:38-master/daily/vibelinkevent-deploy-scripts-LATEST.tar.gz /tmp/
tar -xzf /tmp/vibelinkevent-deploy-scripts-LATEST.tar.gz -C /usr/local/bin/
chmod +x /usr/local/bin/vibelinkevent-{deploy,install}

# 8. Re-issue the deploy key (see below)
```

## Re-issuing the deploy key

```bash
# On any workstation
ssh-keygen -t ed25519 -f /tmp/vl_key -N '' \
  -C 'vibelinkevent-github-actions@xboggg'

gh -R xboggg/vibelinkevent secret set DEPLOY_SSH_KEY < /tmp/vl_key

# On 38
sed -i '/vibelinkevent-github-actions@xboggg/d' /root/.ssh/authorized_keys
PUBKEY=$(cat /tmp/vl_key.pub)
echo "command=\"/usr/local/bin/vibelinkevent-deploy\",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty,restrict $PUBKEY" \
  >> /root/.ssh/authorized_keys
```

## What is NOT covered by automated backup

- DNS / Cloudflare zones — manage via Cloudflare dashboard
- Google Drive itself (the backup destination) — second-tier copies
  could be made to S3 or another provider if needed
- Resend account state and email templates — recreate from the dashboard
- Subdomain SSL certs that have been renewed but not yet redeployed
