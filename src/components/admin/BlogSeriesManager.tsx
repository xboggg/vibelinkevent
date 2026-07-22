// Series manager: CRUD for blog_series + reorder posts within a series + move between series.
// Series slugs are the join key on blog_posts.series_slug.
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Loader2, Edit3, Save, X, ArrowUp, ArrowDown,
  ChevronRight, ChevronDown, ExternalLink, Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Series {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  category: string | null;
  post_count: number;
}

interface SeriesPost {
  id: string;
  slug: string;
  title: string;
  series_order: number | null;
  published: boolean;
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function BlogSeriesManager() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [postsBySeries, setPostsBySeries] = useState<Record<string, SeriesPost[]>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Partial<Series>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("blog_series").select("*").order("title");
    if (error) {
      toast({ title: "Failed to load series", description: error.message, variant: "destructive" });
    }
    setSeries(data || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const loadSeriesPosts = async (slug: string) => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, slug, title, series_order, published")
      .eq("series_slug", slug)
      .order("series_order", { ascending: true, nullsFirst: false });
    setPostsBySeries((s) => ({ ...s, [slug]: data || [] }));
  };

  const toggleExpand = async (slug: string) => {
    const isOpen = expanded.has(slug);
    const next = new Set(expanded);
    if (isOpen) next.delete(slug);
    else {
      next.add(slug);
      if (!postsBySeries[slug]) await loadSeriesPosts(slug);
    }
    setExpanded(next);
  };

  const startEdit = (s: Series) => {
    setEditing(s.id);
    setCreating(false);
    setDraft(s);
  };
  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setDraft({ slug: "", title: "", description: "", cover_image: "", category: "", post_count: 0 });
  };
  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
    setDraft({});
  };

  const saveDraft = async () => {
    if (!draft.title?.trim() || !draft.slug?.trim()) {
      toast({ title: "Missing fields", description: "Title and slug are required." });
      return;
    }
    setSaving(true);
    if (creating) {
      const { error } = await supabase.from("blog_series").insert({
        slug: draft.slug!.trim(),
        title: draft.title!.trim(),
        description: draft.description?.trim() || null,
        cover_image: draft.cover_image?.trim() || null,
        category: draft.category?.trim() || null,
      });
      if (error) toast({ title: "Create failed", description: error.message, variant: "destructive" });
      else toast({ title: "Series created" });
    } else if (editing) {
      const { error } = await supabase.from("blog_series").update({
        title: draft.title!.trim(),
        description: draft.description?.trim() || null,
        cover_image: draft.cover_image?.trim() || null,
        category: draft.category?.trim() || null,
      }).eq("id", editing);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
      else toast({ title: "Series updated" });
    }
    cancelEdit();
    load();
    setSaving(false);
  };

  const deleteSeries = async (s: Series) => {
    if (s.post_count > 0) {
      if (!confirm(`"${s.title}" has ${s.post_count} article${s.post_count === 1 ? "" : "s"}. Delete the series wrapper only? Articles keep their series_slug and become orphans until reassigned.`)) return;
    } else if (!confirm(`Delete "${s.title}"?`)) return;
    const { error } = await supabase.from("blog_series").delete().eq("id", s.id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Series deleted" }); load(); }
  };

  const movePost = async (slug: string, postId: string, dir: -1 | 1) => {
    const posts = postsBySeries[slug] || [];
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= posts.length) return;
    const a = posts[idx], b = posts[swap];
    const aOrder = a.series_order ?? idx + 1;
    const bOrder = b.series_order ?? swap + 1;
    // Swap the two order values in the DB
    await Promise.all([
      supabase.from("blog_posts").update({ series_order: bOrder }).eq("id", a.id),
      supabase.from("blog_posts").update({ series_order: aOrder }).eq("id", b.id),
    ]);
    await loadSeriesPosts(slug);
  };

  const detachPost = async (slug: string, postId: string) => {
    if (!confirm("Remove this post from the series?")) return;
    const { error } = await supabase.from("blog_posts").update({ series_slug: null, series_order: null }).eq("id", postId);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Removed from series" }); await loadSeriesPosts(slug); load(); }
  };

  const editingRow = (s?: Series) => (
    <div className="p-4 md:p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Title *</Label>
          <Input
            value={draft.title || ""}
            onChange={(e) => {
              setDraft((d) => ({
                ...d,
                title: e.target.value,
                slug: creating && !d.slug ? slugify(e.target.value) : d.slug,
              }));
            }}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Slug * {!creating && <span className="text-muted-foreground">(immutable)</span>}</Label>
          <Input value={draft.slug || ""} onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))} disabled={!creating} className="mt-1 font-mono text-xs" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Description</Label>
        <Textarea value={draft.description || ""} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} className="mt-1" rows={2} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Cover image URL</Label>
          <Input value={draft.cover_image || ""} onChange={(e) => setDraft((d) => ({ ...d, cover_image: e.target.value }))} className="mt-1" placeholder="/blog/example.jpg" />
        </div>
        <div>
          <Label className="text-xs">Category</Label>
          <Input value={draft.category || ""} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} className="mt-1" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={cancelEdit} disabled={saving}>Cancel</Button>
        <Button size="sm" onClick={saveDraft} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          {creating ? "Create series" : "Save changes"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Series Manager</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading…" : `${series.length} series · click to expand and reorder posts`}
          </p>
        </div>
        <Button onClick={startCreate} disabled={creating || editing !== null} className="gap-2">
          <Plus className="h-4 w-4" /> New Series
        </Button>
      </div>

      {creating && editingRow()}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : series.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed">
          <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm">No series yet. Create your first one.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {series.map((s) => (
            <li key={s.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              {editing === s.id ? (
                <div className="p-3">{editingRow(s)}</div>
              ) : (
                <>
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleExpand(s.slug)}
                  >
                    <button className="text-muted-foreground shrink-0" aria-label="Expand">
                      {expanded.has(s.slug) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    {s.cover_image ? (
                      <img src={s.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "/blog/adinkra-symbols-ghana.jpg"; }} />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {s.post_count} article{s.post_count === 1 ? "" : "s"} · {s.slug}
                        {s.category && ` · ${s.category}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/blog/series/${s.slug}`} target="_blank" rel="noopener" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="View live">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <button onClick={() => startEdit(s)} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteSeries(s)} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {expanded.has(s.slug) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-border overflow-hidden"
                      >
                        <div className="p-3 md:p-4 space-y-2 bg-muted/20">
                          {(postsBySeries[s.slug] || []).length === 0 ? (
                            <p className="text-xs text-muted-foreground py-3 text-center">No posts in this series yet.</p>
                          ) : (
                            (postsBySeries[s.slug] || []).map((p, i, arr) => (
                              <div key={p.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2">
                                <span className="w-6 text-center text-lg font-bold text-primary/70 font-serif shrink-0">{p.series_order ?? i + 1}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{p.title}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {p.published ? "Published" : "Draft"} · {p.slug}
                                  </p>
                                </div>
                                <button
                                  onClick={() => movePost(s.slug, p.id, -1)}
                                  disabled={i === 0}
                                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => movePost(s.slug, p.id, 1)}
                                  disabled={i === arr.length - 1}
                                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                                <Link to={`/blog/${p.slug}`} target="_blank" rel="noopener" className="p-1 rounded text-muted-foreground hover:text-foreground" title="View">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                                <button onClick={() => detachPost(s.slug, p.id)} className="p-1 rounded text-muted-foreground hover:text-rose-600" title="Remove from series">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
