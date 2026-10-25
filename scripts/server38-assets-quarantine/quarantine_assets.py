#!/usr/bin/env python3
"""
Quarantine old, unused build files from /var/www/vibelinkevent.com/assets on server 38.

SAFE BY DESIGN
  * Default is a DRY RUN: it only reports. Nothing moves unless you pass --apply.
  * --apply MOVES files into a quarantine folder OUTSIDE the web root (never deletes them).
  * A file is only a candidate if ALL of these are true:
      - it is in assets/ and has a Vite-style hashed name (name-XXXXXXXX.ext)
      - NOTHING references it: every .html under the web root (shell, prerendered pages, crawler copy,
        mini-sites) is scanned, and every referenced .js/.css/.json is scanned recursively for more references
      - it is older than --days (default 14), so visitors with a tab left open on a recent build can still load
        its lazy chunks
  * After --apply it re-scans and checks that every file the live site references still exists.
  * --restore <quarantine-folder> moves everything back.

USAGE (on server 38, as root)
  python3 quarantine_assets.py                      # dry run (read-only)
  python3 quarantine_assets.py --days 30            # dry run with a longer safety margin
  python3 quarantine_assets.py --apply              # move candidates to the quarantine folder
  python3 quarantine_assets.py --restore /var/www/vibelinkevent.com.assets-quarantine-YYYYmmdd-HHMMSS
Delete a quarantine folder yourself only after you have run the site for a while (suggest 30 days) with no problems.
"""
import argparse, os, re, shutil, subprocess, sys, time

W = "/var/www/vibelinkevent.com"
A = os.path.join(W, "assets")
HASHED = re.compile(r".+-[A-Za-z0-9_\-]{8}\.[A-Za-z0-9]+$")
NAME_RE = re.compile(r"[A-Za-z0-9_.\-]+\.(?:js|css|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|avif|ico|mp4|webm|json|map)")


def list_assets():
    out = {}
    for n in os.listdir(A):
        p = os.path.join(A, n)
        if os.path.isfile(p):
            st = os.stat(p)
            out[n] = (st.st_size, st.st_mtime)
    return out


def html_roots():
    roots = []
    ab = os.path.abspath(A)
    for d, dirs, fs_ in os.walk(W):
        if os.path.abspath(d).startswith(ab):
            dirs[:] = []
            continue
        for f in fs_:
            if f.endswith(".html"):
                roots.append(os.path.join(d, f))
    return roots


def referenced(files):
    needed, queue = set(), []

    def add(text):
        for m in NAME_RE.finditer(text):
            nm = m.group(0)
            if nm in files and nm not in needed:
                needed.add(nm)
                queue.append(nm)

    for r in html_roots():
        try:
            add(open(r, encoding="utf-8", errors="ignore").read())
        except Exception:
            pass
    while queue:
        nm = queue.pop()
        if nm.endswith((".js", ".css", ".json", ".map")):
            try:
                add(open(os.path.join(A, nm), encoding="utf-8", errors="ignore").read())
            except Exception:
                pass
    return needed


def mb(n):
    return "%.1f MB" % (n / 1048576)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=14)
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--restore", metavar="DIR")
    a = ap.parse_args()

    if a.restore:
        d = a.restore
        man = os.path.join(d, "MANIFEST.txt")
        if not os.path.isfile(man):
            sys.exit("no MANIFEST.txt in %s - refusing" % d)
        n = 0
        for line in open(man):
            name = line.split("\t")[0].strip()
            if not name or name.startswith("#"):
                continue
            src = os.path.join(d, name)
            dst = os.path.join(A, name)
            if os.path.exists(src) and not os.path.exists(dst):
                shutil.move(src, dst)
                n += 1
        print("restored %d files into %s" % (n, A))
        subprocess.run(["chown", "-R", "www-data:www-data", A], check=False)
        return

    files = list_assets()
    needed = referenced(files)
    cutoff = time.time() - a.days * 86400
    unref = [n for n in files if n not in needed]
    cands = sorted(n for n in unref if HASHED.match(n) and files[n][1] < cutoff)
    kept_recent = [n for n in unref if HASHED.match(n) and files[n][1] >= cutoff]
    odd = [n for n in unref if not HASHED.match(n)]

    print("assets/ files: %d (%s)" % (len(files), mb(sum(v[0] for v in files.values()))))
    print("referenced by the live site (always kept): %d" % len(needed))
    print("unreferenced: %d" % len(unref))
    print("  - younger than %d days (kept for safety): %d" % (a.days, len(kept_recent)))
    print("  - not hashed-looking (never touched): %d %s" % (len(odd), odd[:5]))
    print("  - CANDIDATES to quarantine: %d (%s)" % (len(cands), mb(sum(files[n][0] for n in cands))))

    # hard safety: no candidate may be referenced
    assert not (set(cands) & needed), "BUG: a candidate is referenced - aborting"

    if not a.apply:
        print("\nDRY RUN - nothing moved. Re-run with --apply to move the candidates to a quarantine folder.")
        return

    ts = time.strftime("%Y%m%d-%H%M%S")
    q = "/var/www/vibelinkevent.com.assets-quarantine-%s" % ts
    os.makedirs(q, exist_ok=False)
    with open(os.path.join(q, "MANIFEST.txt"), "w") as m:
        m.write("# name\tsize\tmtime\n")
        for n in cands:
            m.write("%s\t%d\t%s\n" % (n, files[n][0], time.strftime("%Y-%m-%d %H:%M", time.localtime(files[n][1]))))
    for n in cands:
        shutil.move(os.path.join(A, n), os.path.join(q, n))
    print("moved %d files to %s" % (len(cands), q))

    # post-check: every .js/.css the live HTML points at must still exist on disk
    missing = []
    for r in html_roots():
        try:
            txt = open(r, encoding="utf-8", errors="ignore").read()
        except Exception:
            continue
        for mm in re.finditer(r"/assets/([A-Za-z0-9_.\-]+\.(?:js|css))", txt):
            if not os.path.exists(os.path.join(A, mm.group(1))):
                missing.append(mm.group(1))
    print("post-check: referenced files missing on disk: %d %s" % (len(set(missing)), sorted(set(missing))[:5]))
    if missing:
        print("PROBLEM - restore with: python3 %s --restore %s" % (sys.argv[0], q))
        sys.exit(2)
    print("OK. To undo: python3 %s --restore %s" % (sys.argv[0], q))


if __name__ == "__main__":
    main()
