import { useState, useRef } from "react";
import { marked } from "marked";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";

// ─── category mappings ───────────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  Wedding: "Wedding",
  Funeral: "Funeral & Memorial",
  Outdooring: "Naming Ceremonies",
  Birthday: "Birthdays",
  Anniversary: "Anniversaries",
  Church: "Church",
  Corporate: "Corporate Events",
  Graduation: "Graduations",
};

const HERO_URL: Record<string, string> = {
  Wedding: "/blog-heros/celebration.jpg",
  Funeral: "/blog-heros/funeral.jpg",
  Outdooring: "/blog-heros/naming.jpg",
  Birthday: "/blog-heros/birthday.jpg",
  Anniversary: "/blog-heros/celebration.jpg",
  Church: "/blog-heros/church.jpg",
  Corporate: "/blog-heros/corporate.jpg",
  Graduation: "/blog-heros/graduation.jpg",
};

// ─── parsing helpers ─────────────────────────────────────────────────────────
function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function readTimeFor(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

interface Parsed {
  title: string;
  author: string;
  categoryRaw: string;
  readTime: string;
  body: string;
}

function parseMarkdown(md: string, file: string): Parsed {
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
  if (!title) throw new Error(`No H1 in ${file}`);
  const parts = byline.split("·").map((s) => s.trim());
  const author = (parts[0] || "By Edmund A.").replace(/^By\s+/i, "").trim() || "Edmund A.";
  const categoryRaw = parts[1] || "Event Planning";
  const readTime = parts[2] || "";
  while (bodyStart < lines.length && lines[bodyStart].trim() === "") bodyStart++;
  return { title, author, categoryRaw, readTime, body: lines.slice(bodyStart).join("\n").trim() };
}

// ─── HTML enrichment ─────────────────────────────────────────────────────────
// All styling is class-based — actual CSS lives in src/styles/blog-content.css.
// This function only does SEMANTIC transformations:
//   1. Promotes "**Bold lead.** explanation" patterns to real <h3> + <p> pairs
//      so the visual hierarchy is clean and SEO-friendly
//   2. Wraps the first paragraph in .blog-lead + drop-cap span
//   3. Tags the Twi/Pidgin closing line as .blog-twi
//   4. Tags "What I would say to..." H2s as .blog-takeaway
//   5. Injects a pull-quote (.blog-pullquote) after the 2nd H2
//   6. Wraps the final author CTA in .blog-cta
function enrichHtml(rawHtml: string): string {
  let html = rawHtml;

  // 1. Promote "<p><strong>Lead.</strong> body...</p>" → "<h3>Lead</h3><p>body...</p>"
  //    Catches the bold-led paragraph pattern used throughout the articles.
  html = html.replace(
    /<p><strong>([^<]+?)\.<\/strong>\s+([\s\S]+?)<\/p>/g,
    (_m, lead, body) => `<h3>${lead.trim()}</h3>\n<p>${body.trim()}</p>`
  );

  // 2. Drop cap on first paragraph (after step 1 — must still be a <p> not an <h3>)
  html = html.replace(
    /(<p>)([A-Za-z])/,
    (_m, _p, letter) =>
      `<p class="blog-lead"><span class="blog-dropcap">${letter}</span>`
  );

  // 3. Twi/Pidgin closing line → gold callout
  html = html.replace(
    /<p>(<em>[^<]+<\/em>\s*[—-]\s*[^<.]+\.)\s*([^<]*)<\/p>/g,
    (_m, twi, rest) =>
      `<div class="blog-twi">${twi}${rest ? ` ${rest}` : ""}</div>`
  );

  // 4. "What I would say / What I tell" closing-section H2 → .blog-takeaway
  html = html.replace(
    /<h2>(What I (?:would say|tell)[^<]+)<\/h2>/gi,
    (_m, heading) => `<h2 class="blog-takeaway">${heading}</h2>`
  );

  // 5. Pull-quote after the 2nd H2 — finds the first short, declarative sentence
  const h2Positions = [...html.matchAll(/<h2[\s>]/g)].map((m) => m.index ?? 0);
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

  // 6. Final author CTA card — recognises "VibeLink builds ... If ..." closing pattern
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

function buildExcerpt(html: string): string {
  const firstP = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  if (!firstP) return "";
  const text = stripHtml(firstP[1]);
  return text.length > 200 ? text.slice(0, 197).trim() + "..." : text;
}

function buildFocusKeyword(title: string, categoryRaw: string): string {
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

function buildTags(categoryRaw: string, title: string): string[] {
  const t = title.toLowerCase();
  const tags = new Set<string>([categoryRaw, "Ghana"]);
  if (t.includes("diaspora")) tags.add("Diaspora");
  if (t.includes("invitation")) tags.add("Invitations");
  if (t.includes("digital")) tags.add("Digital");
  if (t.includes("cost") || t.includes("price")) tags.add("Pricing");
  if (t.includes("checklist") || t.includes("guide") || t.includes("planning")) tags.add("Planning");
  if (t.includes("etiquette")) tags.add("Etiquette");
  return [...tags];
}

// ─── component ───────────────────────────────────────────────────────────────
interface ImportPreview {
  file: string;
  title: string;
  slug: string;
  category: string;
  categoryRaw: string;
  readTime: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  author: string;
  tags: string[];
  focusKeyword: string;
  metaDescription: string;
  status: "pending" | "exists" | "inserted" | "updated" | "skipped" | "failed";
  errorMessage?: string;
}

export const BlogBulkImport = ({ onComplete }: { onComplete?: () => void }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [previews, setPreviews] = useState<ImportPreview[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [publishedOnInsert, setPublishedOnInsert] = useState(false);
  const [overwrite, setOverwrite] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setParsing(true);
    setPreviews([]);
    const results: ImportPreview[] = [];

    for (const file of Array.from(files)) {
      if (!file.name.endsWith(".md")) continue;
      try {
        const md = await file.text();
        const { title, author, categoryRaw, readTime, body } = parseMarkdown(md, file.name);
        const slug = slugify(title);
        const category = CATEGORY_MAP[categoryRaw] || categoryRaw;
        const rawHtml = marked.parse(body) as string;
        const html = enrichHtml(rawHtml);
        const plainText = stripHtml(html);
        const excerpt = buildExcerpt(html);
        const meta = excerpt.length > 155 ? excerpt.slice(0, 152).trim() + "..." : excerpt;
        const focusKeyword = buildFocusKeyword(title, categoryRaw);
        const tags = buildTags(categoryRaw, title);
        const computedReadTime = readTime || readTimeFor(plainText);
        const imageUrl = HERO_URL[categoryRaw] || HERO_URL.Wedding;

        // Check if slug exists
        const { data: existing } = await supabase
          .from("blog_posts")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        results.push({
          file: file.name,
          title,
          slug,
          category,
          categoryRaw,
          readTime: computedReadTime,
          excerpt,
          content: html,
          imageUrl,
          author,
          tags,
          focusKeyword,
          metaDescription: meta,
          status: existing ? "exists" : "pending",
        });
      } catch (e) {
        results.push({
          file: file.name,
          title: "(failed to parse)",
          slug: "",
          category: "",
          categoryRaw: "",
          readTime: "",
          excerpt: "",
          content: "",
          imageUrl: "",
          author: "",
          tags: [],
          focusKeyword: "",
          metaDescription: "",
          status: "failed",
          errorMessage: e instanceof Error ? e.message : String(e),
        });
      }
    }
    setPreviews(results.sort((a, b) => a.file.localeCompare(b.file)));
    setParsing(false);
    setOpen(true);
  };

  const runImport = async () => {
    setImporting(true);
    const updated: ImportPreview[] = [...previews];

    for (let i = 0; i < updated.length; i++) {
      const p = updated[i];
      if (p.status === "failed") continue;
      if (p.status === "exists" && !overwrite) {
        updated[i] = { ...p, status: "skipped" };
        setPreviews([...updated]);
        continue;
      }

      const record = {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        image_url: p.imageUrl,
        read_time: p.readTime,
        author_name: p.author,
        published: publishedOnInsert,
        published_at: publishedOnInsert ? new Date().toISOString() : null,
        meta_description: p.metaDescription,
        focus_keyword: p.focusKeyword,
        tags: p.tags,
        featured: false,
      };

      try {
        if (p.status === "exists" && overwrite) {
          const { error } = await supabase
            .from("blog_posts")
            .update(record)
            .eq("slug", p.slug);
          if (error) throw error;
          updated[i] = { ...p, status: "updated" };
        } else {
          const { error } = await supabase.from("blog_posts").insert(record);
          if (error) throw error;
          updated[i] = { ...p, status: "inserted" };
        }
      } catch (e) {
        updated[i] = {
          ...p,
          status: "failed",
          errorMessage: e instanceof Error ? e.message : String(e),
        };
      }
      setPreviews([...updated]);
    }

    setImporting(false);
    const insertedCount = updated.filter((p) => p.status === "inserted").length;
    const updatedCount = updated.filter((p) => p.status === "updated").length;
    const skippedCount = updated.filter((p) => p.status === "skipped").length;
    const failedCount = updated.filter((p) => p.status === "failed").length;

    toast({
      title: "Import complete",
      description: `${insertedCount} inserted, ${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed.`,
    });

    if (onComplete) onComplete();
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  const counts = {
    total: previews.length,
    pending: previews.filter((p) => p.status === "pending").length,
    exists: previews.filter((p) => p.status === "exists").length,
    inserted: previews.filter((p) => p.status === "inserted").length,
    updated: previews.filter((p) => p.status === "updated").length,
    skipped: previews.filter((p) => p.status === "skipped").length,
    failed: previews.filter((p) => p.status === "failed").length,
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".md"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button onClick={triggerFilePicker} variant="outline" disabled={parsing}>
        {parsing ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Parsing...</>
        ) : (
          <><Upload className="h-4 w-4 mr-2" /> Bulk Import Markdown</>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Bulk Import {counts.total} Article{counts.total !== 1 ? "s" : ""}</DialogTitle>
            <DialogDescription>
              Review what will be imported. Each article is parsed, converted to HTML, enriched with
              visual elements (drop caps, pull-quotes, callouts, gradient CTA), and prepared for
              insert. Nothing is written until you click Import.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 text-sm flex-wrap py-3 border-y">
            <span className="font-semibold">Summary:</span>
            <span className="text-blue-600">Pending: {counts.pending}</span>
            <span className="text-amber-600">Exists: {counts.exists}</span>
            <span className="text-green-600">Inserted: {counts.inserted}</span>
            <span className="text-purple-600">Updated: {counts.updated}</span>
            <span className="text-zinc-500">Skipped: {counts.skipped}</span>
            <span className="text-red-600">Failed: {counts.failed}</span>
          </div>

          <div className="flex items-center gap-6 py-2 text-sm">
            <div className="flex items-center gap-2">
              <Checkbox
                id="bulk-published"
                checked={publishedOnInsert}
                onCheckedChange={(v) => setPublishedOnInsert(!!v)}
                disabled={importing}
              />
              <Label htmlFor="bulk-published" className="cursor-pointer">
                Publish immediately (otherwise inserted as drafts)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="bulk-overwrite"
                checked={overwrite}
                onCheckedChange={(v) => setOverwrite(!!v)}
                disabled={importing}
              />
              <Label htmlFor="bulk-overwrite" className="cursor-pointer">
                Overwrite existing slugs (otherwise skip)
              </Label>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground sticky top-0">
                <tr>
                  <th className="text-left p-2 font-semibold">Status</th>
                  <th className="text-left p-2 font-semibold">Title</th>
                  <th className="text-left p-2 font-semibold">Category</th>
                  <th className="text-left p-2 font-semibold">Read</th>
                </tr>
              </thead>
              <tbody>
                {previews.map((p) => (
                  <tr key={p.file} className="border-t">
                    <td className="p-2 align-top">
                      {p.status === "pending" && <span className="text-blue-600">●</span>}
                      {p.status === "exists" && <span className="text-amber-600" title="slug exists">⚠</span>}
                      {p.status === "inserted" && <CheckCircle2 className="h-4 w-4 text-green-600 inline" />}
                      {p.status === "updated" && <CheckCircle2 className="h-4 w-4 text-purple-600 inline" />}
                      {p.status === "skipped" && <X className="h-4 w-4 text-zinc-400 inline" />}
                      {p.status === "failed" && <AlertCircle className="h-4 w-4 text-red-600 inline" title={p.errorMessage} />}
                    </td>
                    <td className="p-2 align-top">
                      <div className="font-medium leading-tight">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.file} · {p.slug}</div>
                      {p.errorMessage && (
                        <div className="text-xs text-red-600 mt-1">{p.errorMessage}</div>
                      )}
                    </td>
                    <td className="p-2 align-top text-xs">{p.category}</td>
                    <td className="p-2 align-top text-xs whitespace-nowrap">{p.readTime}</td>
                  </tr>
                ))}
                {previews.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No files selected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>
              Close
            </Button>
            <Button
              onClick={runImport}
              disabled={importing || previews.length === 0 || counts.pending + (overwrite ? counts.exists : 0) === 0}
            >
              {importing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing...</>
              ) : (
                <>Import {counts.pending + (overwrite ? counts.exists : 0)} article{counts.pending + (overwrite ? counts.exists : 0) !== 1 ? "s" : ""}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlogBulkImport;
