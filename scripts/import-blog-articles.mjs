#!/usr/bin/env node
/**
 * Bulk import the 47 markdown blog articles from Downloads into Supabase blog_posts.
 *
 * Usage:
 *   1. Set env vars:
 *        SUPABASE_URL=https://luuztlneysofymmuoxie.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=<service-role-key from Supabase Settings -> API>
 *   2. Dry run first:
 *        node scripts/import-blog-articles.mjs
 *   3. Execute (writes to DB):
 *        node scripts/import-blog-articles.mjs --execute
 *
 * Optional flags:
 *   --execute        Actually insert rows (default is dry-run preview)
 *   --published      Set published=true on insert (default false — review in admin first)
 *   --overwrite      If an article with the same slug exists, update it instead of skipping
 *   --dir <path>     Override source directory (defaults to ~/Downloads)
 *   --pattern <glob> Override filename pattern (defaults to VibeLink_Blog_*.md)
 *   --verbose        Print full HTML body per article
 *
 * Behaviour:
 *   - Parses each .md file (title from first H1, byline from "*By X · Cat · N min read*").
 *   - Converts markdown to HTML via marked.
 *   - Enriches the HTML with visual elements:
 *       drop cap on first paragraph
 *       gradient callout boxes around "What I would say to..." closing sections
 *       pull-quote treatment after the first H2
 *       styled Twi/Pidgin closing phrase
 *       a decorative divider before the final author CTA
 *   - Generates: slug, excerpt, read_time, focus_keyword, meta_description, tags.
 *   - Maps every article to a category hero image (uploads to Supabase Storage on first run).
 *   - Skips articles whose slug already exists unless --overwrite is set.
 */

import { createClient } from "@supabase/supabase-js";
import { marked } from "marked";
import { readdir, readFile } from "node:fs/promises";
import { resolve, join, basename } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync } from "node:fs";

const args = process.argv.slice(2);
const opts = {
  execute: args.includes("--execute"),
  publishedOnInsert: args.includes("--published"),
  overwrite: args.includes("--overwrite"),
  verbose: args.includes("--verbose"),
  dir: argValue("--dir") ?? join(homedir(), "Downloads"),
  pattern: argValue("--pattern") ?? "VibeLink_Blog_",
};
function argValue(flag) {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
}

const SUPABASE_URL = process.env.SUPABASE_URL || "https://luuztlneysofymmuoxie.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (opts.execute && !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY env var is required for --execute mode.");
  console.error("   Get it from Supabase dashboard → Project Settings → API → service_role secret.");
  console.error("   Then run:  SUPABASE_SERVICE_ROLE_KEY=ey... node scripts/import-blog-articles.mjs --execute");
  process.exit(1);
}

const supabase = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

// ─── category → admin-dropdown category mapping ──────────────────────────────
const CATEGORY_MAP = {
  Wedding: "Wedding",
  Funeral: "Funeral & Memorial",
  Outdooring: "Naming Ceremonies",
  Birthday: "Birthdays",
  Anniversary: "Anniversaries",
  Church: "Church",
  Corporate: "Corporate Events",
  Graduation: "Graduations",
};

// ─── per-category hero image filenames (in src/assets/) ──────────────────────
const HERO_IMAGE_FILE = {
  Wedding: "hero-celebration.jpg",
  Funeral: "hero-funeral.jpg",
  Outdooring: "hero-naming.jpg",
  Birthday: "hero-birthday.jpg",
  Anniversary: "hero-celebration.jpg",
  Church: "hero-church.jpg",
  Corporate: "hero-corporate.jpg",
  Graduation: "hero-graduation.jpg",
};

const STORAGE_BUCKET = "blog-images";

// ─── parsing helpers ─────────────────────────────────────────────────────────
function slugify(t) {
  return t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function readTimeFor(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function parseFrontmatter(md, file) {
  const lines = md.split(/\r?\n/);
  let title = "";
  let byline = "";
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!title && line.startsWith("# ")) {
      title = line.slice(2).trim();
      continue;
    }
    if (title && !byline && line.startsWith("*") && line.endsWith("*") && line.includes("·")) {
      byline = line.slice(1, -1).trim();
      bodyStart = i + 1;
      break;
    }
    if (title && line && !line.startsWith("*")) {
      bodyStart = i;
      break;
    }
  }

  if (!title) throw new Error(`No H1 title found in ${file}`);

  const parts = byline.split("·").map((s) => s.trim());
  const authorRaw = parts[0] || "By Edmund A.";
  const author = authorRaw.replace(/^By\s+/i, "").trim() || "Edmund A.";
  const categoryRaw = parts[1] || "Event Planning";
  const readTime = parts[2] || "";

  while (bodyStart < lines.length && lines[bodyStart].trim() === "") bodyStart++;
  const body = lines.slice(bodyStart).join("\n").trim();

  return { title, author, categoryRaw, readTime, body };
}

// ─── HTML enrichment — class-based, styling lives in blog-content.css ────────
function enrichHtml(rawHtml) {
  let html = rawHtml;

  // 1. Promote "<p><strong>Lead.</strong> body</p>" → "<h3>Lead</h3><p>body</p>"
  html = html.replace(
    /<p><strong>([^<]+?)\.<\/strong>\s+([\s\S]+?)<\/p>/g,
    (_m, lead, body) => `<h3>${lead.trim()}</h3>\n<p>${body.trim()}</p>`
  );

  // 2. Drop cap on first paragraph
  html = html.replace(
    /(<p>)([A-Za-z])/,
    (_m, _p, letter) => `<p class="blog-lead"><span class="blog-dropcap">${letter}</span>`
  );

  // 3. Twi/Pidgin closing line → gold callout
  html = html.replace(
    /<p>(<em>[^<]+<\/em>\s*[—-]\s*[^<.]+\.)\s*([^<]*)<\/p>/g,
    (_m, twi, rest) => `<div class="blog-twi">${twi}${rest ? ` ${rest}` : ""}</div>`
  );

  // 4. "What I would say / What I tell" closing-section H2 → .blog-takeaway
  html = html.replace(
    /<h2>(What I (?:would say|tell)[^<]+)<\/h2>/gi,
    (_m, heading) => `<h2 class="blog-takeaway">${heading}</h2>`
  );

  // 5. Pull-quote after 2nd H2
  const h2Positions = [...html.matchAll(/<h2[\s>]/g)].map((m) => m.index);
  if (h2Positions.length >= 2) {
    const after = html.slice(h2Positions[1]);
    const sentenceMatch = after.match(/<p>([^<]{60,180}?\.)\s/);
    if (sentenceMatch) {
      const sentence = sentenceMatch[1].trim();
      const pullQuote = `\n<aside class="blog-pullquote">${sentence}</aside>\n`;
      const insertAfter = html.indexOf(sentenceMatch[0]) + sentenceMatch[0].length;
      const endOfP = html.indexOf("</p>", insertAfter);
      if (endOfP > 0) {
        html = html.slice(0, endOfP + 4) + pullQuote + html.slice(endOfP + 4);
      }
    }
  }

  // 6. Final author CTA card
  html = html.replace(
    /<p>(VibeLink builds[^<]+\.)\s+(If [^<]+\.)\s*<\/p>\s*$/,
    (_m, headline, body) => `
<div class="blog-cta">
  <p class="blog-cta-headline">${headline.trim()}</p>
  <p class="blog-cta-body">${body.trim()}</p>
</div>`
  );

  return html;
}

// ─── excerpt + meta generation ───────────────────────────────────────────────
function buildExcerpt(html) {
  const firstP = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  if (!firstP) return "";
  const text = stripHtml(firstP[1]).replace(/^[A-Z]\s/, (m) => m); // keep first letter
  return text.length > 200 ? text.slice(0, 197).trim() + "..." : text;
}

function buildMetaDescription(excerpt) {
  return excerpt.length > 155 ? excerpt.slice(0, 152).trim() + "..." : excerpt;
}

function buildFocusKeyword(title, categoryRaw) {
  const lower = title.toLowerCase();
  const candidates = [
    "wedding invitation ghana",
    "funeral programme ghana",
    "outdooring ghana",
    "naming ceremony ghana",
    "graduation ghana",
    "corporate event ghana",
    "anniversary ghana",
    "church event ghana",
    "birthday ghana",
    "memorial ghana",
  ];
  for (const c of candidates) {
    const parts = c.split(" ");
    if (parts.every((p) => lower.includes(p) || lower.includes(p.replace(/s$/, "")))) return c;
  }
  return `${categoryRaw.toLowerCase()} ghana`;
}

function buildTags(categoryRaw, title) {
  const t = title.toLowerCase();
  const tags = new Set([categoryRaw, "Ghana"]);
  if (t.includes("diaspora")) tags.add("Diaspora");
  if (t.includes("invitation")) tags.add("Invitations");
  if (t.includes("digital")) tags.add("Digital");
  if (t.includes("cost") || t.includes("price")) tags.add("Pricing");
  if (t.includes("checklist") || t.includes("guide") || t.includes("planning")) tags.add("Planning");
  if (t.includes("etiquette")) tags.add("Etiquette");
  return [...tags];
}

// ─── hero image upload ──────────────────────────────────────────────────────
async function ensureHeroImage(category) {
  const filename = HERO_IMAGE_FILE[category] || "hero-celebration.jpg";
  const storagePath = `blog-heros/${filename}`;
  const { data: existing } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  // Check if file exists in bucket
  const { data: list } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list("blog-heros", { search: filename });
  if (list?.some((f) => f.name === filename)) {
    return existing.publicUrl;
  }
  // Upload
  const localPath = resolve(__dirname, "..", "src", "assets", filename);
  if (!existsSync(localPath)) {
    console.warn(`  ⚠️  hero image not found locally: ${localPath} — using fallback URL`);
    return existing.publicUrl;
  }
  const fileBytes = readFileSync(localPath);
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, fileBytes, { contentType: "image/jpeg", upsert: true });
  if (error) {
    console.warn(`  ⚠️  upload failed for ${filename}: ${error.message}`);
  } else {
    console.log(`  ✓  uploaded ${filename} to Storage`);
  }
  return existing.publicUrl;
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === STORAGE_BUCKET)) {
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
    if (error && !error.message.includes("already exists")) {
      console.warn(`  ⚠️  could not create bucket: ${error.message}`);
    } else {
      console.log(`  ✓  created storage bucket "${STORAGE_BUCKET}"`);
    }
  }
}

// ─── main ────────────────────────────────────────────────────────────────────
const __dirname = (() => {
  try {
    return resolve(fileURLToPath(import.meta.url), "..");
  } catch {
    return process.cwd();
  }
})();

async function main() {
  console.log("\n📚 VibeLink Blog Bulk Importer");
  console.log("─".repeat(60));
  console.log(`Source folder: ${opts.dir}`);
  console.log(`Mode:          ${opts.execute ? "EXECUTE (will write to DB)" : "DRY RUN (preview only)"}`);
  console.log(`Published:     ${opts.publishedOnInsert ? "true" : "false (review in admin first)"}`);
  console.log(`Overwrite:     ${opts.overwrite}`);
  console.log("─".repeat(60));

  let files;
  try {
    const entries = await readdir(opts.dir);
    files = entries.filter((f) => f.startsWith(opts.pattern) && f.endsWith(".md")).sort();
  } catch (e) {
    console.error(`❌ Could not read ${opts.dir}: ${e.message}`);
    process.exit(1);
  }

  if (!files.length) {
    console.error(`❌ No markdown files matching "${opts.pattern}*.md" found in ${opts.dir}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} markdown files.\n`);

  if (opts.execute) {
    console.log("📦 Ensuring storage bucket + hero images...");
    await ensureBucket();
  }

  const heroUrlCache = {};
  let inserted = 0, skipped = 0, updated = 0, failed = 0;

  for (const file of files) {
    const fullPath = join(opts.dir, file);
    try {
      const md = await readFile(fullPath, "utf8");
      const { title, author, categoryRaw, readTime, body } = parseFrontmatter(md, file);
      const slug = slugify(title);
      const category = CATEGORY_MAP[categoryRaw] || categoryRaw;
      const rawHtml = marked.parse(body);
      const html = enrichHtml(rawHtml, title);
      const plainText = stripHtml(html);
      const excerpt = buildExcerpt(html);
      const meta = buildMetaDescription(excerpt);
      const focusKeyword = buildFocusKeyword(title, categoryRaw);
      const tags = buildTags(categoryRaw, title);
      const computedReadTime = readTime || readTimeFor(plainText);

      let imageUrl = heroUrlCache[categoryRaw];
      if (!imageUrl) {
        imageUrl = opts.execute ? await ensureHeroImage(categoryRaw) : `<would-upload:${HERO_IMAGE_FILE[categoryRaw]}>`;
        heroUrlCache[categoryRaw] = imageUrl;
      }

      const record = {
        title,
        slug,
        excerpt,
        content: html,
        category,
        image_url: imageUrl,
        read_time: computedReadTime,
        author_name: author,
        published: opts.publishedOnInsert,
        published_at: opts.publishedOnInsert ? new Date().toISOString() : null,
        meta_description: meta,
        focus_keyword: focusKeyword,
        tags,
        featured: false,
      };

      console.log(`\n→ ${file}`);
      console.log(`  title:      ${title}`);
      console.log(`  category:   ${categoryRaw} → ${category}`);
      console.log(`  slug:       ${slug}`);
      console.log(`  read_time:  ${computedReadTime}`);
      console.log(`  tags:       ${tags.join(", ")}`);
      console.log(`  excerpt:    ${excerpt.slice(0, 100)}${excerpt.length > 100 ? "..." : ""}`);
      if (opts.verbose) {
        console.log(`  --- HTML (first 800 chars) ---\n${html.slice(0, 800)}\n  --- end ---`);
      }

      if (!opts.execute) {
        skipped++;
        continue;
      }

      const { data: existing } = await supabase
        .from("blog_posts")
        .select("id, slug")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) {
        if (opts.overwrite) {
          const { error } = await supabase.from("blog_posts").update(record).eq("id", existing.id);
          if (error) { console.error(`  ✗ update failed: ${error.message}`); failed++; }
          else { console.log(`  ✓ updated existing post`); updated++; }
        } else {
          console.log(`  ↷ skipping (slug exists; use --overwrite to update)`);
          skipped++;
        }
      } else {
        const { error } = await supabase.from("blog_posts").insert(record);
        if (error) { console.error(`  ✗ insert failed: ${error.message}`); failed++; }
        else { console.log(`  ✓ inserted`); inserted++; }
      }
    } catch (e) {
      console.error(`  ✗ ${file} → ${e.message}`);
      failed++;
    }
  }

  console.log("\n" + "─".repeat(60));
  console.log(`Done. Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`);
  if (!opts.execute) {
    console.log("This was a DRY RUN. Re-run with --execute to actually write to the database.");
  } else {
    console.log("Go to /admin → Content → Blog to review and publish each article when ready.");
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
