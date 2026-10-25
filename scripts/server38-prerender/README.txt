Copy of /opt/prerender/build-time-prerender.mjs from server 38 (the crawler that vibelinkevent-install runs
after every deploy). The SERVER copy is the one that runs; keep this copy in step when you change it.

Change made 2026-10-25: the crawler now serves the current webroot index.html as the document for every
route it renders. Before, it loaded the live URL, which nginx answers with the previously published
prerendered page, so each page kept its old <script src="/assets/index-XXXX.js"> forever (74 pages were
frozen on the 2026-10-19 bundle; no front-end change after that day reached visitors on those routes).

Backups on the server (undo): /opt/prerender/build-time-prerender.mjs.bak-before-shell-fix-20261025-105858
and /root/vl-prerender-backup-20261025-105858.tgz (the 76 saved pages as they were).
To undo: copy the .bak file back over build-time-prerender.mjs and re-run
  cd /opt/prerender && node build-time-prerender.mjs
(note: that would bring the stale-bundle problem back).

How to check it still works after any deploy (run on server 38):
  grep -rhoE 'src="/assets/index-[A-Za-z0-9_-]+\.js"' /var/www/vibelinkevent.com --include=index.html | sort | uniq -c
  -> every line must show the SAME single bundle (the one in /var/www/vibelinkevent.com/index.html).
