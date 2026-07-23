#!/usr/bin/env node
/**
 * Generate public/sitemap.xml from live Supabase blog_posts + hardcoded static
 * routes. Run whenever you publish new articles (or wire it into `npm run build`).
 *
 * Usage:
 *   node scripts/generate-sitemap.mjs
 *
 * Output: writes public/sitemap.xml. Only includes blog posts whose
 * published=true AND published_at <= now (scheduled future posts stay out).
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SUPABASE_URL = "https://luuztlneysofymmuoxie.supabase.co";
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1dXp0bG5leXNvZnltbXVveGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NTAwMTcsImV4cCI6MjA4NDUyNjAxN30.jGzvfkZI-vLdyDwL6PpYonzahluL6GnvmxFfOHEfNE0";
const SITE = "https://vibelinkevent.com";

// ─── Static routes with priorities & change frequencies ──────────────────────
const STATIC_ROUTES = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/services", priority: 0.9, changefreq: "monthly" },
  { path: "/portfolio", priority: 0.9, changefreq: "weekly" },
  { path: "/pricing", priority: 0.9, changefreq: "monthly" },
  { path: "/get-started", priority: 0.95, changefreq: "monthly" },
  { path: "/wedding-invitations", priority: 0.9, changefreq: "monthly" },
  { path: "/engagement-invitations", priority: 0.9, changefreq: "monthly" },
  { path: "/funeral-programs", priority: 0.9, changefreq: "monthly" },
  { path: "/naming-ceremony", priority: 0.9, changefreq: "monthly" },
  { path: "/church-events", priority: 0.85, changefreq: "monthly" },
  { path: "/corporate-events", priority: 0.85, changefreq: "monthly" },
  { path: "/graduation", priority: 0.85, changefreq: "monthly" },
  { path: "/birthday", priority: 0.85, changefreq: "monthly" },
  { path: "/milestone-birthday", priority: 0.85, changefreq: "monthly" },
  { path: "/anniversary-invitations", priority: 0.85, changefreq: "monthly" },
  { path: "/how-it-works", priority: 0.8, changefreq: "monthly" },
  { path: "/blog", priority: 0.85, changefreq: "daily" },
  { path: "/about", priority: 0.7, changefreq: "monthly" },
  { path: "/contact", priority: 0.7, changefreq: "monthly" },
  { path: "/faq", priority: 0.7, changefreq: "monthly" },
  { path: "/book-consultation", priority: 0.75, changefreq: "monthly" },
  { path: "/referral", priority: 0.5, changefreq: "monthly" },
  { path: "/privacy-policy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms-of-service", priority: 0.3, changefreq: "yearly" },
  { path: "/refund-policy", priority: 0.3, changefreq: "yearly" },
  { path: "/cookie-policy", priority: 0.3, changefreq: "yearly" },
];

// ─── Fetch published blog articles ───────────────────────────────────────────
async function fetchPublishedArticles() {
  const now = new Date().toISOString();
  const url = `${SUPABASE_URL}/rest/v1/blog_posts?published=eq.true&published_at=lte.${encodeURIComponent(now)}&select=slug,updated_at,published_at,category&order=published_at.desc`;
  const res = await fetch(url, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  if (!res.ok) {
    console.warn(`⚠️  Supabase fetch failed (${res.status}). Sitemap will only include static routes.`);
    return [];
  }
  return await res.json();
}

// ─── Build the XML ───────────────────────────────────────────────────────────
function urlEntry(loc, lastmod, changefreq, priority) {
  const d = new Date(lastmod);
  const date = isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10);
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(2)}</priority>
  </url>`;
}

async function main() {
  const articles = await fetchPublishedArticles();
  console.log(`Found ${articles.length} published articles.`);

  const today = new Date().toISOString().slice(0, 10);

  const entries = [];

  // Static routes
  for (const r of STATIC_ROUTES) {
    entries.push(urlEntry(`${SITE}${r.path}`, today, r.changefreq, r.priority));
  }

  // Blog articles (priority scales with recency; newest = 0.7, oldest = 0.5)
  articles.forEach((a, i) => {
    const priority = Math.max(0.5, 0.7 - i * 0.005);
    entries.push(
      urlEntry(
        `${SITE}/blog/${a.slug}`,
        a.updated_at || a.published_at || today,
        "weekly",
        priority
      )
    );
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(__dirname, "..", "public", "sitemap.xml");
  writeFileSync(outPath, xml);
  console.log(`✓  Wrote ${outPath}`);
  console.log(`   ${STATIC_ROUTES.length} static routes + ${articles.length} blog articles = ${entries.length} URLs`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
