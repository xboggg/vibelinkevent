// AI Blog Writer — calls the Node service at /api/ai/blog-draft on the same domain.
// Auth: Supabase JWT (admin-gated server-side).
// Rate limit: 10 gens/hour/IP (enforced server-side).
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, X, Wand2, Copy, Save, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Wedding", "Funeral & Memorial", "Anniversaries", "Church",
  "Community", "Ghanaian Culture", "Event Planning",
  "Naming Ceremonies", "Inspirations", "Tips & Guides",
  "Birthdays", "Graduations", "Corporate Events",
];

interface Series {
  slug: string;
  title: string;
}

interface Props {
  onDraftReady: (markdown: string, meta: { title: string; excerpt: string; category: string }) => void;
  onClose: () => void;
}

// Rough markdown → HTML for the tiptap editor to accept the draft.
// The MagazineArticle renderer parses markdown directly, so this is only for the editor's initial content.
function mdToHtml(md: string): string {
  let html = md
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$2</h2>".replace("$2", "$1"))
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^> \*\*\[(Pro Tip|Tradition|Mistake)\]\*\*(.*)$/gm, "<blockquote><strong>[$1]</strong>$2</blockquote>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n\n+/g, "</p><p>")
    .replace(/^([^<\n].+)$/gm, (line) => (line.startsWith("<") ? line : line));
  return `<p>${html}</p>`.replace(/<p>(<h[123]>.+<\/h[123]>)<\/p>/g, "$1").replace(/<p>(<blockquote>.+<\/blockquote>)<\/p>/g, "$1");
}

// Extract # H1 as title and second-paragraph excerpt from generated markdown.
function extractMeta(md: string): { title: string; excerpt: string } {
  const lines = md.split("\n");
  const h1 = lines.find((l) => l.startsWith("# "));
  const title = h1 ? h1.replace(/^# /, "").trim() : "Untitled";
  // First paragraph after the H1
  let excerpt = "";
  let afterH1 = false;
  for (const l of lines) {
    if (l.startsWith("# ")) { afterH1 = true; continue; }
    if (!afterH1) continue;
    const t = l.trim();
    if (!t || t.startsWith("#") || t.startsWith(">") || t.startsWith("*")) continue;
    excerpt = t.replace(/[*_[\]]/g, "").slice(0, 280);
    break;
  }
  return { title, excerpt };
}

export function BlogAIWriter({ onDraftReady, onClose }: Props) {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("Event Planning");
  const [series, setSeries] = useState<Series[]>([]);
  const [seriesSlug, setSeriesSlug] = useState("");
  const [tone, setTone] = useState("");
  const [targetWords, setTargetWords] = useState(1200);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<string>("");
  const [meta, setMeta] = useState<{ title: string; excerpt: string } | null>(null);
  const { toast } = useToast();

  // Load series list once
  useState(() => {
    (async () => {
      const { data } = await supabase.from("blog_series").select("slug, title").order("title");
      setSeries(data || []);
    })();
  });

  const generate = async () => {
    if (topic.trim().length < 8) {
      toast({ title: "Topic too short", description: "Give the AI at least a sentence to work with." });
      return;
    }
    setBusy(true);
    setDraft("");
    setMeta(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Not signed in — refresh /admin and log back in.");

      const seriesTitle = seriesSlug ? series.find((s) => s.slug === seriesSlug)?.title : undefined;
      const res = await fetch("/api/ai/blog-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          topic: topic.trim(),
          category,
          series: seriesTitle,
          tone: tone.trim() || undefined,
          target_words: targetWords,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }
      const markdown = String(json.markdown || "");
      const m = extractMeta(markdown);
      setDraft(markdown);
      setMeta(m);
      toast({
        title: "Draft ready ✨",
        description: `${markdown.split(/\s+/).length} words · ${json.usage?.output_tokens} output tokens`,
      });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e?.message || "Try again in a moment", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const copyToEditor = () => {
    if (!draft || !meta) return;
    onDraftReady(draft, { title: meta.title, excerpt: meta.excerpt, category });
    toast({ title: "Copied to editor", description: "Review, add images, then save." });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Blog Writer</h3>
              <p className="text-xs text-muted-foreground">Claude Opus 4.8 · Ghanaian editorial voice</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6 space-y-5">
          {!draft ? (
            <>
              <div>
                <Label>Article topic or angle</Label>
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Why Ghanaian couples in the diaspora struggle with wedding traditions — and how to bridge the two worlds without picking a side."
                  className="mt-1.5 min-h-[90px]"
                />
                <p className="text-xs text-muted-foreground mt-1">Be specific. A rich prompt makes a rich article.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 border border-border rounded-xl bg-background text-sm outline-none focus:border-primary"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Series (optional)</Label>
                  <select
                    value={seriesSlug}
                    onChange={(e) => setSeriesSlug(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2.5 border border-border rounded-xl bg-background text-sm outline-none focus:border-primary"
                  >
                    <option value="">Standalone article</option>
                    {series.map((s) => (
                      <option key={s.slug} value={s.slug}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Target length: {targetWords} words</Label>
                  <input
                    type="range"
                    min={500}
                    max={2500}
                    step={100}
                    value={targetWords}
                    onChange={(e) => setTargetWords(Number(e.target.value))}
                    className="w-full mt-2 accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>500 (quick)</span>
                    <span>1200 (default)</span>
                    <span>2500 (deep)</span>
                  </div>
                </div>
                <div>
                  <Label>Tone note (optional)</Label>
                  <Input
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="e.g. warm and reflective; skip listicles"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/80">
                <p className="font-semibold text-primary mb-1 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4" /> What Claude will produce
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Full markdown article with # title and ## chapter sections</li>
                  <li>Ghanaian voice — natural refs to kente, adinkra, cities, Twi phrases</li>
                  <li>Callout boxes: <code>[Tradition]</code>, <code>[Pro Tip]</code>, <code>[Mistake]</code></li>
                  <li>Pull quotes ready for the MagazineArticle renderer</li>
                  <li>Closing sign-off from The VibeLink Editors</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Draft preview */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
                  <div>
                    <p className="text-sm font-semibold">{meta?.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {draft.split(/\s+/).length} words · {category}
                    </p>
                  </div>
                  <button
                    onClick={() => { setDraft(""); setMeta(null); }}
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Discard & retry
                  </button>
                </div>
                <div className="p-4 max-h-[50vh] overflow-auto bg-background">
                  <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-foreground/85">
                    {draft.slice(0, 3000)}{draft.length > 3000 ? "\n\n… (truncated preview — full text will paste into editor)" : ""}
                  </pre>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Excerpt (auto-extracted): <em>{meta?.excerpt}</em>
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground hidden sm:block">
            {draft ? "Review the draft, then paste into the editor to add images and publish." : "10 generations per hour · draft not saved until you paste."}
          </p>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
            {!draft ? (
              <Button onClick={generate} disabled={busy} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2">
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate draft</>}
              </Button>
            ) : (
              <Button onClick={copyToEditor} className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2">
                <Save className="w-4 h-4" /> Paste into editor
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
