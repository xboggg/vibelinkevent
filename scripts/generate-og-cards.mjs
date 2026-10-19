#!/usr/bin/env node
/**
 * Generate branded 1200x630 Open Graph cards for pages that have no suitable
 * photograph of their own.
 *
 * Usage:
 *   node scripts/generate-og-cards.mjs          # write any missing cards
 *   node scripts/generate-og-cards.mjs --force  # rebuild every card
 *
 * Output: public/og/<slug>.png
 *
 * Requires ImageMagick (`convert`) on PATH — already present on the build box
 * and on srv 38. No npm dependency is added for this.
 *
 * Pages that DO have real photography (portfolio, event pages, blog posts)
 * point at those images directly in their <SEO ogImage=...> prop instead;
 * this script is only the fallback half of that split.
 */

import { writeFileSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = resolve(ROOT, "public/og");

const FORCE = process.argv.includes("--force");

// Brand palette — mirrors src/index.css (--primary 262 83% 58%, --secondary 38 92% 50%)
const PURPLE_DEEP = "#1a0b2e";
const PURPLE = "#7C3AED";
const GOLD = "#F59E0B";
const INK = "#0a0414";

/**
 * Cards to generate. `eyebrow` is the small uppercase kicker, `title` the
 * headline. Keep titles short — anything past ~42 chars starts to crowd the
 * card at WhatsApp's preview size.
 */
const CARDS = [
  { slug: "home",            eyebrow: "VibeLink Event",     title: "Digital Invitations for Ghanaian Celebrations" },
  { slug: "about",           eyebrow: "About Us",           title: "The People Behind VibeLink Event" },
  { slug: "blog",            eyebrow: "Journal",            title: "Stories, Guides & Ideas for Your Event" },
  { slug: "blog-series",     eyebrow: "Journal",            title: "Article Series" },
  { slug: "contact",         eyebrow: "Get in Touch",       title: "Talk to Us About Your Event" },
  { slug: "designs",         eyebrow: "Browse Designs",     title: "Invitation Designs for Every Occasion" },
  { slug: "faq",             eyebrow: "Questions",          title: "Everything You Wanted to Ask" },
  { slug: "get-started",     eyebrow: "Start Here",         title: "Create Your Invitation" },
  { slug: "how-it-works",    eyebrow: "How It Works",       title: "From Your Idea to Every Guest's Phone" },
  { slug: "templates",       eyebrow: "Templates",          title: "Ready-Made Designs You Can Make Yours" },
  { slug: "template-detail", eyebrow: "Template",           title: "A Design Built for Your Celebration" },
  { slug: "consultation",    eyebrow: "Book a Call",        title: "Let's Plan Your Invitation Together" },
  { slug: "legal",           eyebrow: "VibeLink Event",     title: "Policies & Terms" },

  // These three pages referenced /og-services.jpg, /og-pricing.jpg and
  // /og-portfolio.jpg, none of which were ever added to public/ — so their
  // link previews 404'd instead of falling back to the site-wide image.
  { slug: "services",        eyebrow: "What We Do",         title: "Invitations, RSVPs & Everything After" },
  { slug: "pricing",         eyebrow: "Pricing",            title: "Simple Packages, No Surprises" },
  { slug: "portfolio",       eyebrow: "Our Work",           title: "Celebrations We've Helped Create" },
];

/** Escape text for safe inclusion in SVG markup. */
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Wrap a headline onto at most 3 lines. Rough width metric (0.58em average per
 * glyph at the chosen size) is good enough for a fixed-size card and avoids
 * pulling in a font-measuring dependency.
 */
function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const candidate = line ? `${line} ${w}` : w;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function buildSvg({ eyebrow, title }) {
  const fontSize = title.length > 34 ? 66 : 78;
  const lines = wrap(title, title.length > 34 ? 26 : 22);
  const lineHeight = Math.round(fontSize * 1.18);
  // Vertically centre the headline block within the lower two-thirds.
  const blockHeight = lines.length * lineHeight;
  const startY = 330 - blockHeight / 2 + fontSize;

  const tspans = lines
    .map((l, i) => `<tspan x="90" y="${startY + i * lineHeight}">${esc(l)}</tspan>`)
    .join("");

  // NOTE: the background gradient and glows are composited by ImageMagick
  // (see renderCard) rather than declared as SVG <defs>. ImageMagick's SVG
  // renderer silently drops gradient fills referenced via url(#id), which
  // produced flat-black cards. Everything here is solid-fill only.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- gold rule under the eyebrow -->
  <rect x="90" y="196" width="76" height="4" rx="2" fill="${GOLD}"/>

  <text x="90" y="170"
        font-family="DejaVu Serif, Georgia, serif"
        font-size="26" letter-spacing="7"
        fill="${GOLD}">${esc(eyebrow.toUpperCase())}</text>

  <text font-family="DejaVu Serif, Georgia, serif"
        font-size="${fontSize}" font-weight="bold"
        fill="#ffffff">${tspans}</text>

  <text x="90" y="560"
        font-family="DejaVu Serif, Georgia, serif"
        font-size="30" fill="#ffffff" fill-opacity="0.72">vibelinkevent.com</text>

  <!-- corner accent -->
  <rect x="1060" y="520" width="50" height="50" rx="8"
        fill="none" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="3"/>
</svg>`;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  let made = 0;
  let skipped = 0;

  for (const card of CARDS) {
    const png = resolve(OUT_DIR, `${card.slug}.png`);
    if (existsSync(png) && !FORCE) {
      skipped++;
      continue;
    }

    const tmpSvg = resolve(OUT_DIR, `.${card.slug}.tmp.svg`);
    const tmpTextPng = resolve(OUT_DIR, `.${card.slug}.tmp.png`);
    writeFileSync(tmpSvg, buildSvg(card), "utf8");

    try {
      // Rasterise the text layer with rsvg-convert directly, at explicit
      // pixel dimensions. ImageMagick shells out to rsvg-convert anyway, but
      // without -w/-h it renders at 0.75 scale (96dpi assumption) and crops
      // to 900x472 — which silently chopped the right-hand side off every
      // headline. Passing the size explicitly is the only reliable fix.
      execFileSync("rsvg-convert", [
        "-w", "1200", "-h", "630",
        "-o", tmpTextPng,
        tmpSvg,
      ], { stdio: "pipe" });

      // Build the card in three composited stages so we never rely on SVG
      // gradient support:
      //   1. diagonal base gradient (ink -> deep purple)
      //   2. two soft radial glows (purple top-right, gold bottom-left)
      //   3. the text/rule SVG laid over the top
      execFileSync("convert", [
        // 1. base: vertical gradient, deep purple at the top fading to ink.
        //    No rotation — rotating the canvas leaves bare corners.
        "-size", "1200x630",
        `gradient:${PURPLE_DEEP}-${INK}`,

        // 2. purple bloom, top right. Kept fully inside the frame.
        "(", "-size", "900x900",
        `radial-gradient:${PURPLE}-black`,
        "-evaluate", "multiply", "0.40",
        ")",
        "-geometry", "+560-300", "-compose", "screen", "-composite",

        // 3. gold bloom, bottom left — subtler, just warms the corner.
        "(", "-size", "700x700",
        `radial-gradient:${GOLD}-black`,
        "-evaluate", "multiply", "0.16",
        ")",
        "-geometry", "-220+260", "-compose", "screen", "-composite",

        // 4. text layer (already rasterised to exactly 1200x630 above)
        tmpTextPng,
        "-gravity", "northwest", "-compose", "over", "-composite",

        // Flatten + palette-reduce: these cards are flat colour and text, so
        // 256 colours is visually lossless and keeps them well under the
        // ~300KB that WhatsApp needs to render a preview reliably.
        "-background", INK, "-alpha", "remove", "-alpha", "off",
        "-colors", "256",
        png,
      ], { stdio: "pipe" });
      made++;
      console.log(`  made  public/og/${card.slug}.png`);
    } catch (err) {
      console.error(`  FAIL  ${card.slug}: ${err.message}`);
      process.exitCode = 1;
    } finally {
      if (existsSync(tmpSvg)) unlinkSync(tmpSvg);
      if (existsSync(tmpTextPng)) unlinkSync(tmpTextPng);
    }
  }

  console.log(`\nOG cards: ${made} generated, ${skipped} already present.`);
  if (skipped && !FORCE) console.log("Re-run with --force to rebuild existing cards.");
}

main();
