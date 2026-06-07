// Post-build prerender. Spins up vite preview, drives Puppeteer through each
// public marketing route, captures the rendered HTML, writes it back into dist.
// Result: bots / link previews see per-route titles and OG tags from index.html
// instead of the SPA shell's one default title.
import puppeteer from "puppeteer";
import { preview } from "vite";
import fs from "node:fs";
import path from "node:path";

const ROUTES = [
  "/",
  "/about",
  "/services",
  "/pricing",
  "/portfolio",
  "/contact",
  "/blog",
  "/faq",
  "/how-it-works",
  "/get-started",
  "/book-consultation",
  "/referral",
  "/wedding-invitations",
  "/funeral-programs",
  "/naming-ceremony",
  "/church-events",
  "/corporate-events",
  "/graduation",
  "/birthday",
  "/privacy-policy",
  "/terms-of-service",
  "/refund-policy",
  "/cookie-policy",
];

const PORT = 4173;
const DIST = path.resolve("dist");

async function run() {
  const server = await preview({
    preview: { port: PORT },
    build: { outDir: DIST },
  });
  const baseURL = `http://localhost:${PORT}`;
  console.log(`Preview server: ${baseURL}`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let ok = 0;
  let failed = 0;

  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      await page.goto(`${baseURL}${route}`, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });
      // Give react-helmet an extra moment to apply head tags
      await new Promise((r) => setTimeout(r, 400));

      const html = await page.content();
      const outDir = route === "/" ? DIST : path.join(DIST, route);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html);
      const title = await page.title();
      console.log(`  ${route.padEnd(28)} → ${title.slice(0, 70)}`);
      ok++;
    } catch (err) {
      console.error(`  ${route.padEnd(28)} FAILED: ${err.message}`);
      failed++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.httpServer.close();

  console.log(`\nPrerendered ${ok}/${ROUTES.length} routes (${failed} failed)`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
