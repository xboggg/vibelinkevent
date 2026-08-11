# Portfolio Demo Playbook

Recipe for creating a sanitised demo clone of a real client invitation so the design
can safely live on `/portfolio` without exposing real client + guest personal data.

**First demo built with this recipe:** `demo-atta.vibelinkevent.com` (2026-08-11) —
sanitised clone of the Atta Panin memorial.

## Locked rules (apply to every demo)

- **Universal number:** `0244000000` for every phone / WhatsApp / MoMo on the demo
- **RSVP forms:** UI visible, submissions write to a demo-only DB (never touches the real one)
- **Wishes / tributes / comments:** keep the message text (that's the emotional weight);
  replace real names with generic Ghanaian first-name + initial (Kwame A., Ama S., etc.)
- **Coordinator / RSVP-contact panels:** replace real names with generic titles
  (Uncle Kwame, Auntie Ama, Sister Adwoa) + `0244000000`
- **Client's own identity stays:** their name, photos, event date, venue, story
- **Design untouched:** colours, layout, animations, music
- **Gallery:** audit case-by-case, keep only portraits of the celebrated person / core family;
  remove crowd shots and images of guests who didn't commission the piece
- **Demo URL naming:** `demo-<slug>.vibelinkevent.com` (auto-resolves via wildcard DNS)
- **Real invitation subdomain:** untouched, stays live for family/guests
- **Admin panel:** removed entirely from the demo (attack-surface reduction)
- **noindex header:** every demo subdomain returns `X-Robots-Tag: noindex, nofollow`

## The recipe (repeat per client)

Substitute the client slug throughout. Example uses `atta` (short form).

### 0. Pre-flight

```bash
# SSH into srv 38
ssh root@38.242.195.0

# Confirm the real invitation folder exists and note its structure
ls -la /var/www/<real-slug>.vibelinkevent.com/

# Detect tech: PHP+MySQL, static HTML, Node, etc — sanitising differs by stack
find /var/www/<real-slug>.vibelinkevent.com/ -maxdepth 2 -type f \
  \( -name '*.php' -o -name '*.html' -o -name 'package.json' \) | head -20
```

### 1. Clone the folder

```bash
cp -a /var/www/<real-slug>.vibelinkevent.com /var/www/demo-<short>.vibelinkevent.com
```

### 2. Create a fresh isolated demo DB (if backend is PHP+MySQL)

```bash
DEMO_DB_PASS="Dem0_$(openssl rand -hex 6)"
mysql -e "
CREATE DATABASE demo_<short>_memorial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'demo_<short>_user'@'localhost' IDENTIFIED BY '$DEMO_DB_PASS';
GRANT ALL PRIVILEGES ON demo_<short>_memorial.* TO 'demo_<short>_user'@'localhost';
FLUSH PRIVILEGES;
"

# Import schema + relevant tables from real DB. Skip admin_sessions.
# Import condolences/tributes so we can anonymise them; skip real RSVPs.
mysqldump <real-db> --no-data --skip-comments > /tmp/schema.sql
mysqldump <real-db> condolences --no-create-info --skip-comments > /tmp/data.sql
mysql demo_<short>_memorial < /tmp/schema.sql
mysql demo_<short>_memorial < /tmp/data.sql
rm /tmp/schema.sql /tmp/data.sql
```

### 3. Wire demo config to demo DB

```bash
cd /var/www/demo-<short>.vibelinkevent.com/api
sed -i "s/define('DB_NAME', '<real-db>');/define('DB_NAME', 'demo_<short>_memorial');/" config.php
sed -i "s/define('DB_USER', '<real-user>');/define('DB_USER', 'demo_<short>_user');/" config.php
sed -i "s|define('DB_PASS', '.*');|define('DB_PASS', '$DEMO_DB_PASS');|" config.php
```

### 4. Delete admin surface

```bash
rm -rf /var/www/demo-<short>.vibelinkevent.com/admin
rm -f /var/www/demo-<short>.vibelinkevent.com/api/setup.php
```

### 5. Anonymise wishes/tributes/comments

Get the list:
```bash
mysql demo_<short>_memorial -e 'SELECT id, name, relation FROM condolences;'
```

Then UPDATE each row swapping `name` → generic Ghanaian pattern and `relation` → generic label.
Message text stays. Example:
```sql
UPDATE condolences SET name='Kwame A.', relation='Family Friend' WHERE id=1;
UPDATE condolences SET name='Auntie Ama',  relation='Extended Family' WHERE id=2;
-- ...one line per row
```

### 6. Sed-replace real phone numbers → `0244000000`

Identify them:
```bash
cd /var/www/demo-<short>.vibelinkevent.com
grep -rhoE '(\+?233|0)[0-9]{8,10}' index.html api/*.php *.html 2>/dev/null | sort -u
```

Replace across all HTML/PHP/JS/JSON (both +233 prefix and local 0-prefix forms):
```bash
for num in '+233XXXXXXXXX' '233XXXXXXXXX' '0XXXXXXXXX'; do
  find . -type f \( -name '*.html' -o -name '*.php' -o -name '*.js' -o -name '*.json' \) \
    -exec sed -i "s/$num/0244000000/g" {} \;
done
```

Verify — should return nothing:
```bash
grep -rE '(\+?233)?(REAL_NUMBER_HERE)' --include='*.html' --include='*.php' .
```

### 7. Replace payment / MoMo QR with a placeholder

Move the real QR out of the web-served folder first, THEN generate a placeholder:
```bash
mv payment-qr.jpeg /root/<slug>-real-qr.backup.jpeg   # OUT of web root
convert -size 500x500 xc:white \
  -fill '#0a0a0a' -draw 'rectangle 30,30 470,470' \
  -fill white -draw 'rectangle 60,60 440,440' \
  -fill '#0a0a0a' \
  -font DejaVu-Sans-Bold -pointsize 42 -gravity center \
  -annotate +0,-30 'SAMPLE QR' \
  -pointsize 18 -annotate +0,20 'Demo placeholder' \
  -pointsize 14 -annotate +0,55 'Real invitations show a live MoMo QR' \
  payment-qr.jpeg
```

### 8. Move dev artefacts + backup files OUT of the demo folder

Anything named `*.backup*`, `compare-*`, `preview-option-*`, `tribute-preview-*` etc.
would be publicly served if left in the folder. Stash them in `/root/`:

```bash
mkdir -p /root/<slug>-demo-devartefacts
mv /var/www/demo-<short>.vibelinkevent.com/index.html.backup_* /root/<slug>-demo-devartefacts/
mv /var/www/demo-<short>.vibelinkevent.com/compare-*.html /root/<slug>-demo-devartefacts/
mv /var/www/demo-<short>.vibelinkevent.com/preview-*.html /root/<slug>-demo-devartefacts/
mv /var/www/demo-<short>.vibelinkevent.com/tribute-preview-*.html /root/<slug>-demo-devartefacts/
# List what's left — should only be user-facing pages:
ls /var/www/demo-<short>.vibelinkevent.com/
```

### 9. Gallery pass (last, requires user review)

Generate a contact sheet:
```bash
cd /var/www/demo-<short>.vibelinkevent.com
montage gallery/g[0-9][0-9].jpeg -tile 10x -geometry 160x160+4+4 \
  -background '#0e0e0e' -bordercolor '#2a2a2a' -border 1 \
  -label '%f' -font DejaVu-Sans -pointsize 10 -fill '#ddd' \
  /tmp/<slug>-contactsheet.jpg
```

Download it, review with Edmund, get the KEEP list back, then:

```bash
# Delete non-kept files
KEEP='g01 g02 g05 g27 ...'
cd /var/www/demo-<short>.vibelinkevent.com/gallery
for f in *.jpeg *.jpg; do
  base=$(basename "$f" .jpeg); base=$(basename "$base" .jpg)
  match=0
  for k in $KEEP; do if [ "$base" = "$k" ]; then match=1; break; fi; done
  [ $match -eq 0 ] && rm -f "$f"
done
```

If the invitation hardcodes gallery photo references in `index.html` (many do), also:
- Remove the corresponding `<div class="gallery-item">` HTML blocks
- Renumber `openGallery(N)` indices to run 0..N-1 sequentially
- Rewrite any `.expandable-gallery :nth-child(N)` CSS to pick from the remaining items

For Atta Panin this was done with `scratchpad/gallery_surgery.py` — reuse or adapt.

### 10. Nginx server block (issue cert BEFORE full config)

**Step A — temporary HTTP-only config for cert issuance:**
```bash
cat > /etc/nginx/sites-available/demo-<short>.vibelinkevent.com <<'EOF'
server {
    listen 80;
    server_name demo-<short>.vibelinkevent.com www.demo-<short>.vibelinkevent.com;
    root /var/www/demo-<short>.vibelinkevent.com;
    index index.html;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { try_files $uri $uri/ /index.html; }
}
EOF
ln -sf /etc/nginx/sites-available/demo-<short>.vibelinkevent.com \
       /etc/nginx/sites-enabled/demo-<short>.vibelinkevent.com
nginx -t && systemctl reload nginx
```

**Step B — issue cert:**
```bash
certbot certonly --nginx \
  -d demo-<short>.vibelinkevent.com \
  -d www.demo-<short>.vibelinkevent.com \
  --non-interactive --agree-tos --email xboggg@gmail.com
```

**Step C — swap to full HTTPS config** (see `demo-atta.vibelinkevent.com` for the canonical
template — includes noindex header, admin-blocking rules, cache headers, HTTP→HTTPS redirect).

### 11. Smoke test

```bash
UA="Mozilla/5.0 ..."   # any real UA — nginx blocks curl/
# main page
curl -sI -A "$UA" https://demo-<short>.vibelinkevent.com/ | grep -iE 'HTTP|x-robots'
# admin blocked
curl -o /dev/null -w '%{http_code}\n' https://demo-<short>.vibelinkevent.com/admin/
# config blocked
curl -o /dev/null -w '%{http_code}\n' https://demo-<short>.vibelinkevent.com/api/config.php
# kept gallery photo
curl -o /dev/null -w '%{http_code}\n' https://demo-<short>.vibelinkevent.com/gallery/<kept>.jpeg
# API returns anonymised data
curl -s https://demo-<short>.vibelinkevent.com/api/condolences.php?filter=recent | head -c 300
# real invitation still up (control test)
curl -o /dev/null -w '%{http_code}\n' https://<real-slug>.vibelinkevent.com/
```

All must return HTTP 200 (or 404 for blocked routes), and the condolences JSON must show generic names.

### 12. Publish on `/portfolio`

Edit `src/data/portfolioItems.ts`:
- Change `demoUrl` from `https://<real-slug>.vibelinkevent.com/` to `https://demo-<short>.vibelinkevent.com/`
- Change `demoLabel` from `"Open Invitation"` / `"Open Memorial"` to `"Open Demo"`
- Remove `hidden: true` if it was there

Edit `src/pages/PortfolioDetail.tsx`:
- Same URL swap for the matching entry in the `portfolioData` map
- Same `demoLabel` change
- Remove slug from `HIDDEN_SLUGS` if it was there

Build + push:
```bash
npm run build && git add -A && git commit -m "Portfolio: swap <slug> for sanitised demo" && git push
```

GitHub Actions auto-deploys in ~90s.

## What NEVER to touch

- The real invitation folder (`/var/www/<real-slug>.vibelinkevent.com/`)
- The real invitation DB
- The real subdomain's DNS or nginx config
- The real invitation's SSL cert

If you catch yourself editing anything at a `<real-slug>` path, stop and restart.

## ⚠ Hard-won lessons (first demo — attapanin — sanitisation was superficial and had to be redone)

**Sed alone is not sanitisation.** The first attapanin pass only touched
UNSPACED phone numbers (`0244372290`). The real invitation had them formatted
with spaces (`0244 372 290`) in the RSVP contact panel, which sed's regex
missed entirely. Grep verification also passed because I was grepping the
wrong pattern. Numbers must be checked in EVERY format: unspaced,
space-formatted (`024 400 0000` / `024 4000000`), international (`+233 …`),
URL-encoded (`%20` between groups), and inside JSON blobs.

**More than one gallery.** Memorial invitations (Atta Panin type) can have
2+ separate gallery sections in `index.html` PLUS additional gallery-adjacent
pages (`laying-to-rest.html`, `burial/` folder with 100+ photos, downloadable
PDF programme). The first surgery pass only handled the main `<div class="gallery-item">`
blocks. Do a full audit of every gallery-adjacent surface before declaring done.

**Memorial invitations often have supporting pages that must be nuked wholesale.**
Attapanin had `tributes.html` (92 named individuals from extended family in tribute
cards — impossible to credibly anonymise), `laying-to-rest.html` (burial photos),
`order-of-service.html`, `funeral-order-of-service.html`, `funeral-programme.pdf`
(5MB PDF with the whole real programme). None of these were on the original
sanitisation checklist. **For memorials, plan to `rm -rf` these entirely** as part
of the demo build — don't try to sanitise them piecewise. Also `rm` the
`burial/` and `tributes/` image folders whose FILENAMES themselves are PII
(`tribute-brenda-krofah.jpeg`, `KROFAH(100).jpg` etc.).

**Deceased's / celebrant's real formal name has many variants.** For attapanin:
`Wilson Atta Krofah`, `WILSON ATTA KROFAH`, `Mr. Wilson Atta Krofah`,
`Mr. Krofah`, `Mr Krofah`, `Atta Krofah`, `Krofah` alone (surname), plus
`Atta Kakra` (twin sibling reference). Every family name variant needs a
listed replacement — a single `Krofah` → `""` catch-all works but can create
weird artefacts (empty parens, double spaces).

**Bank + payment identifiers.** `Absa Bank`, `Powered by <bank>`, USSD short codes
like `*447*4251#`, MoMo QR PNG images — all are PII and financial-identity leaks.
Not covered by phone-number sanitisation. Add these to the checklist.

**Meta/OG/Twitter/keywords tags leak too.** The invitation shell has multiple
`<meta name="description">`, `<meta property="og:*">`, `<meta name="twitter:*">`
tags containing the deceased's formal name, geographic identifiers, family
lineage terms. All must be checked separately from the visible page content.

**WhatsApp share links contain URL-encoded PII.** The "Share on WhatsApp" button
typically has an `href="https://wa.me/?text=…"` where the text is URL-encoded.
Sed on plain text leaves the URL-encoded copy intact. Must run replacements on
BOTH plain and %20-encoded forms.

**OG image itself is a leak.** The default `og-image.jpg` was often built from
a photo of the funeral invitation card with the deceased's face + real name
printed on it. WhatsApp/Twitter previews would show the real name even though
nothing on the sanitised page mentions it. Regenerate the OG image as a
generic branded card (`convert -size 1200x630 gradient:...` with generic text).

**"Gallery counter" text.** The "View Full Gallery (85 Photos)" button text
is hard-coded, not derived from actual count. If you delete 72 photos, the
counter still says 85 unless you edit that specific string too.

**Geographic + church + kinship identifiers.** Beyond names/phones/banks, memorial
pages contain:
- Home village / town / traditional district (Akyem Begoro, Fanteakwa North District, Bosuso)
- Specific church name of the funeral service (The Ghana Police Church, Trinity Congregation Dansor)
- Parents' names in the biography ("son of Lawrence Sakyiama and Lydia Korowaa")
- Traditional titles (Abusuapanin, Begorohene, Fanteakwahene, Regent, Widow)
- Educational history ("Adisadel College", "CEM@N.Legon")
- Event dates ("Friday 1st May 2026 at ...")

All are identifying. Add to the sanitisation checklist as separate categories.

**The proper verification is grep the LIVE curl'd HTML, not the local file.**
The first-pass verification greped the source file for numbers without spaces
and reported "clean" — but the LIVE page had 4 spaced numbers rendered exactly
as the client saw them. Always `curl -A "Mozilla/... UA" <demo-url>` and run
the audit against that response body. Also use a comprehensive flag list
(30+ terms) not a targeted grep.

**Take a screenshot at the end.** Even after grep passes, open the demo in a
real browser and eyeball it section-by-section. Grep can miss things layout
puts side-by-side (like `Sister Brenda` next to `024 400 0000` reading fine
in a static grep but looking wrong in the actual card layout). Look with eyes.

## Files stashed outside web root per demo

For each demo you build, these files end up at `/root/`:
- `<slug>-real-qr.backup.jpeg` — the original MoMo QR (kept out of web root as safety)
- `<slug>-demo-devartefacts/` — folder with dev/preview/backup HTML files that shouldn't be publicly served
- `<slug>-demo-index.pre-gallery-cull.html` — pre-surgery snapshot (rollback safety)

These are NOT publicly served — nginx has no server block pointing to `/root/`. Kept just for
rollback if we need to reconstruct the pre-sanitised state.

## Demos already built

| Slug | Real subdomain | Demo subdomain | DB | Built |
|---|---|---|---|---|
| atta-panyin-memorial | attapanin.vibelinkevent.com | demo-atta.vibelinkevent.com | demo_atta_memorial | 2026-08-11 |

## Demos pending (8)

Round 1 — test-mechanic (low-risk):
- [ ] PRESEC-OSU 70th Anniversary (institutional, minimal PII)

Round 2 — children (naming/christening):
- [ ] Baby Boy Coleman
- [ ] Baby Nortey

Round 3 — memorials (bereavement):
- [ ] Ex-WO1 Deku
- [ ] Charles Nii Aryertey Taylor

Round 4 — weddings/engagements (upcoming events, extra care):
- [ ] Eric & Sherita (Nov 2026)
- [ ] Frank & Hannah (Apr 2027)

Round 5 — anniversary:
- [ ] Evans & Mina
