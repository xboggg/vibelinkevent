// vibelinkevent.com prerender + sitemap + RSS generator.
// Runs at deploy time, walks every published route with Puppeteer, and also
// emits blog/rss.xml and sitemap.xml so search engines and RSS readers have
// current metadata every time we deploy.

import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const BASE = 'https://vibelinkevent.com';
const OUT = '/tmp/prerendered';
const WEBROOT = '/var/www/vibelinkevent.com';

// The crawler must render every page from the CURRENT Vite shell. The live URL serves the previously
// published prerendered copy (nginx picks <route>/index.html first), so loading it would copy that page's
// old <script src="/assets/index-XXXX.js"> forward forever. Found 2026-10-25: 74 pages were frozen on the
// 2026-10-19 bundle, so no front-end change after that day reached visitors on those routes.
const SHELL_HTML = fs.readFileSync(path.join(WEBROOT, 'index.html'), 'utf8');

const STATIC_ROUTES = [
  '/',
  '/about', '/services', '/pricing', '/portfolio', '/contact', '/blog',
  '/faq', '/how-it-works', '/get-started', '/book-consultation', '/designs', '/templates', '/referral',
  '/wedding-invitations', '/engagement-invitations', '/funeral-programs', '/naming-ceremony',
  '/church-events', '/corporate-events', '/graduation', '/birthday', '/anniversary-invitations',
  '/privacy-policy', '/terms-of-service', '/refund-policy', '/cookie-policy',
];

const SUPABASE_URL = 'https://luuztlneysofymmuoxie.supabase.co/rest/v1';
const ANON = process.env.SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1dXp0bG5leXNvZnltbXVveGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NTAwMTcsImV4cCI6MjA4NDUyNjAxN30.jGzvfkZI-vLdyDwL6PpYonzahluL6GnvmxFfOHEfNE0';

// Fetch live published blog articles (slugs + metadata used for RSS/sitemap).
async function fetchPublishedPosts() {
  const nowIso = new Date().toISOString();
  const url = SUPABASE_URL + '/blog_posts'
    + '?published=eq.true'
    + '&published_at=lte.' + encodeURIComponent(nowIso)
    + '&select=slug,title,excerpt,category,tags,image_url,published_at,updated_at,author_name'
    + '&order=published_at.desc';
  try {
    const res = await fetch(url, { headers: { apikey: ANON, Authorization: 'Bearer ' + ANON } });
    if (!res.ok) { console.warn('Supabase fetch failed:', res.status); return []; }
    return await res.json();
  } catch (e) {
    console.warn('Supabase fetch error:', e.message);
    return [];
  }
}

// Small XML escape helper — sitemap and RSS both need this.
function xmlEscape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Build blog/rss.xml — an RSS 2.0 feed with content:encoded namespace.
function buildRss(posts) {
  const now = new Date().toUTCString();
  const items = posts.slice(0, 50).map((p) => {
    const link = BASE + '/blog/' + p.slug;
    const pubDate = p.published_at ? new Date(p.published_at).toUTCString() : now;
    const enclosure = p.image_url
      ? (p.image_url.startsWith('http') ? p.image_url : BASE + (p.image_url.startsWith('/') ? '' : '/') + p.image_url)
      : '';
    const catXml = (p.tags || []).slice(0, 5).map((t) => '<category>' + xmlEscape(t) + '</category>').join('');
    return [
      '  <item>',
      '    <title>' + xmlEscape(p.title) + '</title>',
      '    <link>' + xmlEscape(link) + '</link>',
      '    <guid isPermaLink="true">' + xmlEscape(link) + '</guid>',
      '    <pubDate>' + pubDate + '</pubDate>',
      '    <description>' + xmlEscape(p.excerpt || '') + '</description>',
      '    <dc:creator>' + xmlEscape(p.author_name || 'Edmund Adjekum') + '</dc:creator>',
      p.category ? '    <category>' + xmlEscape(p.category) + '</category>' : '',
      catXml,
      enclosure ? '    <enclosure url="' + xmlEscape(enclosure) + '" type="image/jpeg" length="0" />' : '',
      '  </item>',
    ].filter(Boolean).join('\n');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    '  <title>VibeLink Event Blog</title>',
    '  <link>' + BASE + '/blog</link>',
    '  <atom:link href="' + BASE + '/blog/rss.xml" rel="self" type="application/rss+xml" />',
    '  <description>Event planning guides, invitation ideas, and Ghanaian tradition — from the VibeLink Event team.</description>',
    '  <language>en-gh</language>',
    '  <lastBuildDate>' + now + '</lastBuildDate>',
    '  <image>',
    '    <url>' + BASE + '/vibelink-logo.png</url>',
    '    <title>VibeLink Event</title>',
    '    <link>' + BASE + '</link>',
    '  </image>',
    items,
    '</channel>',
    '</rss>',
  ].join('\n');
}

// Build sitemap.xml — static routes + all blog posts. Search engines pick it
// up from robots.txt and refresh listings whenever we redeploy.
function buildSitemap(posts) {
  const now = new Date().toISOString();
  const urlEntry = (loc, lastmod, priority, changefreq) => [
    '  <url>',
    '    <loc>' + xmlEscape(loc) + '</loc>',
    '    <lastmod>' + lastmod + '</lastmod>',
    changefreq ? '    <changefreq>' + changefreq + '</changefreq>' : '',
    priority ? '    <priority>' + priority + '</priority>' : '',
    '  </url>',
  ].filter(Boolean).join('\n');

  const staticUrls = STATIC_ROUTES.map((route) => {
    const priority =
      route === '/' ? '1.0' :
      ['/services', '/portfolio', '/pricing', '/designs'].includes(route) ? '0.9' :
      route === '/blog' ? '0.85' :
      route.startsWith('/wedding') || route.startsWith('/funeral') || route.startsWith('/engagement') || route.startsWith('/naming') || route.startsWith('/anniversary') || route.startsWith('/graduation') || route.startsWith('/birthday') || route.startsWith('/church') || route.startsWith('/corporate') ? '0.85' :
      '0.6';
    return urlEntry(BASE + route, now, priority, 'weekly');
  });

  const postUrls = posts.map((p) => {
    const lastmod = p.updated_at || p.published_at || now;
    return urlEntry(BASE + '/blog/' + p.slug, lastmod, '0.75', 'monthly');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticUrls,
    ...postUrls,
    '</urlset>',
  ].join('\n');
}

// ─── Fetch posts + emit RSS + sitemap FIRST ─────────────────────────
console.log('Fetching published posts from Supabase for sitemap/RSS…');
const posts = await fetchPublishedPosts();
console.log('  fetched ' + posts.length + ' published posts');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, 'blog'), { recursive: true });

fs.writeFileSync(path.join(OUT, 'blog', 'rss.xml'), buildRss(posts));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), buildSitemap(posts));
console.log('  wrote blog/rss.xml (' + posts.length + ' items)');
console.log('  wrote sitemap.xml (' + (STATIC_ROUTES.length + posts.length) + ' URLs)');

// Also copy these to webroot right now so they're live even if prerender fails
try {
  fs.mkdirSync(path.join(WEBROOT, 'blog'), { recursive: true });
  fs.copyFileSync(path.join(OUT, 'blog', 'rss.xml'), path.join(WEBROOT, 'blog', 'rss.xml'));
  fs.copyFileSync(path.join(OUT, 'sitemap.xml'), path.join(WEBROOT, 'sitemap.xml'));
  console.log('  copied to webroot');
} catch (e) {
  console.warn('  could not copy to webroot (probably permission):', e.message);
}

// ─── Now walk the routes with Puppeteer ─────────────────────────────
const blogRoutes = posts.map((p) => '/blog/' + p.slug);
const ROUTES = [...STATIC_ROUTES, ...blogRoutes];
console.log('Crawling ' + STATIC_ROUTES.length + ' static + ' + blogRoutes.length + ' blog routes = ' + ROUTES.length + ' total');

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

let ok = 0, failed = 0;
for (const route of ROUTES) {
  const page = await browser.newPage();
  // Serve the fresh shell for this route's document request (everything else loads from the live site).
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.isNavigationRequest() && req.resourceType() === 'document' && req.url() === BASE + route) {
      req.respond({ status: 200, contentType: 'text/html; charset=utf-8', body: SHELL_HTML });
    } else {
      req.continue();
    }
  });
  try {
    await page.setUserAgent('Mozilla/5.0 (compatible; VibeLinkPrerender/1.0; +https://vibelinkevent.com)');
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 45000 });
    await page.waitForSelector('h1, h2, article, main', { timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1200));
    const html = await page.content();
    const title = await page.title();
    const dir = route === '/' ? OUT : path.join(OUT, route);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    console.log(route.padEnd(48) + ' -> ' + title.slice(0, 60));
    ok++;
  } catch (e) {
    console.error(route.padEnd(48) + ' FAILED: ' + e.message);
    failed++;
  } finally {
    await page.close();
  }
}
await browser.close();
console.log('\nPrerendered ' + ok + '/' + ROUTES.length + ' (' + failed + ' failed)');

// ─── Publish prerendered HTML to the webroot ─────────────────────────
//
// Everything above writes to OUT (/tmp/prerendered) only. Without this
// step the crawl runs, reports success, and the HTML is never served —
// which is why crawlers kept seeing the bare SPA shell with no per-page
// title or og:image.
//
// Each route is published as <webroot>/<route>/index.html. nginx's
// `try_files $uri $uri/ /index.html` picks these up automatically: a
// request for /wedding-invitations matches the directory and serves its
// index.html, while real browsers still get the same file and hydrate
// over it. No nginx change is required.
//
// The SPA shell at <webroot>/index.html is deliberately NOT overwritten
// by the prerendered "/" page here — see PUBLISH_ROOT below.

const PUBLISH_ROOT = false; // keep the Vite-built shell as the "/" entry

let published = 0;
let publishFailed = 0;

function publishDir(srcDir, destDir) {
  const src = path.join(srcDir, 'index.html');
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, path.join(destDir, 'index.html'));
  published++;
}

try {
  for (const route of ROUTES) {
    if (route === '/') {
      // The homepage shell must stay exactly as Vite built it, so publish the
      // prerendered copy alongside it as index.crawler.html. nginx serves that
      // file only to link-preview bots (see the social-crawler block in the
      // site config); real browsers keep getting the untouched SPA shell.
      const rootSrc = path.join(OUT, 'index.html');
      if (fs.existsSync(rootSrc)) {
        fs.copyFileSync(rootSrc, path.join(WEBROOT, 'index.crawler.html'));
        published++;
      }
      continue;
    }
    try {
      publishDir(path.join(OUT, route), path.join(WEBROOT, route));
    } catch (e) {
      console.warn('  publish failed ' + route + ': ' + e.message);
      publishFailed++;
    }
  }

  // nginx serves as www-data; files copied by root need ownership fixing or
  // they 403. Done here rather than in the deploy script so a manual run of
  // this script is also complete on its own. execFileSync (no shell) keeps
  // this free of any quoting/injection concern.
  try {
    execFileSync('chown', ['-R', 'www-data:www-data', WEBROOT], { stdio: 'pipe' });
  } catch (e) {
    console.warn('  chown skipped: ' + e.message);
  }

  console.log('Published ' + published + ' prerendered pages to webroot'
    + (publishFailed ? ' (' + publishFailed + ' failed)' : ''));
} catch (e) {
  console.error('Publish step failed: ' + e.message);
}
process.exit(failed > 0 && failed === ROUTES.length ? 1 : 0);
