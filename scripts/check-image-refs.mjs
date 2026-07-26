#!/usr/bin/env node
// Fails the build if any local image path referenced in src/ is missing from public/.
// Root-cause fix for the recurring "silently broken image" bug where nginx's SPA
// fallback used to serve index.html in place of missing images. Now those images
// return real 404s — and this script catches them at build time before deploy.
//
// Add expected exceptions to KNOWN_MISSING with a reason; anything else fails.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";
import process from "node:process";

const SRC = "src";
const PUBLIC = "public";
const IMG_EXT = /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp)/i;
// Match quoted strings that look like local image paths (start with /, no external URL).
// Optional ?query suffix (e.g. ?v=2) is tolerated.
const PATH_RE = /['"](\/[^'"\s]+\.(?:png|jpe?g|gif|webp|avif|svg|ico|bmp))(\?[^'"]+)?['"]/gi;

// Paths that are known-broken today but tracked as a separate content task.
// Delete an entry once the asset ships so a regression will trip this check again.
const KNOWN_MISSING = new Map([
  ["/blog/example.jpg", "admin BlogSeriesManager placeholder — never rendered in prod"],
  ["/templates-img/cathedral-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/chapter-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/cinema-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/familytree-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/field-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/garden-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/hourglass-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/kente-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/lastdrum-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/letter-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/marketplace-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/river-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/stainedglass-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/tides-thumb.jpg", "template thumbs — 15-file content set never produced"],
  ["/templates-img/vinyl-thumb.jpg", "template thumbs — 15-file content set never produced"],
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const refs = new Map();
for (const file of walk(SRC)) {
  if (![".ts", ".tsx", ".js", ".jsx", ".md"].includes(extname(file))) continue;
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(PATH_RE)) {
    const path = m[1];
    if (!refs.has(path)) refs.set(path, new Set());
    refs.get(path).add(relative(".", file));
  }
}

const missing = [];
for (const [path, referrers] of refs) {
  const disk = join(PUBLIC, path);
  if (existsSync(disk)) continue;
  if (KNOWN_MISSING.has(path)) continue;
  missing.push({ path, referrers: [...referrers] });
}

if (missing.length === 0) {
  console.log(`✓ image-refs: ${refs.size} local image paths, all resolve in public/`);
  process.exit(0);
}

console.error(`✗ image-refs: ${missing.length} referenced image(s) missing from public/`);
for (const { path, referrers } of missing) {
  console.error(`  ${path}`);
  for (const r of referrers) console.error(`    referenced by: ${r}`);
}
console.error(``);
console.error(`Add the file to public/ — OR add it to KNOWN_MISSING in scripts/check-image-refs.mjs`);
console.error(`with a reason if it's an intentional/tracked gap.`);
process.exit(1);
