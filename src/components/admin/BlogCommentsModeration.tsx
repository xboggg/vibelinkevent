// Comments moderation panel. Loads unapproved rows from blog_comments,
// lets admin approve or reject. Auto-refresh every 60s.
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, MessageSquare, ExternalLink, Clock, Filter } from "lucide-react";
import { Link } from "react-router-dom";

interface Comment {
  id: string;
  post_slug: string;
  author_name: string;
  author_email: string | null;
  body: string;
  approved: boolean;
  created_at: string;
  // joined post title (optional)
  post_title?: string;
}

type Tab = "pending" | "approved" | "all";

const RELATIVE = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
};

export function BlogCommentsModeration() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [actioning, setActioning] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    const { data: comms, error } = await supabase
      .from("blog_comments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast({ title: "Load failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    // Hydrate with post titles for context
    const slugs = [...new Set((comms || []).map((c: any) => c.post_slug))];
    let titles: Record<string, string> = {};
    if (slugs.length) {
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("slug, title")
        .in("slug", slugs);
      titles = Object.fromEntries((posts || []).map((p: any) => [p.slug, p.title]));
    }
    setComments((comms || []).map((c: any) => ({ ...c, post_title: titles[c.post_slug] })));
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    load();
    const iv = window.setInterval(load, 60000);
    return () => window.clearInterval(iv);
  }, [load]);

  const filtered = useMemo(() => {
    if (tab === "pending") return comments.filter((c) => !c.approved);
    if (tab === "approved") return comments.filter((c) => c.approved);
    return comments;
  }, [comments, tab]);

  const pendingCount = comments.filter((c) => !c.approved).length;
  const approvedCount = comments.filter((c) => c.approved).length;

  const approve = async (id: string) => {
    setActioning(id);
    const { error } = await supabase
      .from("blog_comments")
      .update({ approved: true })
      .eq("id", id);
    if (error) {
      toast({ title: "Approve failed", description: error.message, variant: "destructive" });
    } else {
      setComments((c) => c.map((x) => (x.id === id ? { ...x, approved: true } : x)));
      toast({ title: "Approved ✓", description: "Now visible on the article." });
    }
    setActioning(null);
  };

  const reject = async (id: string) => {
    if (!confirm("Delete this comment? This can't be undone.")) return;
    setActioning(id);
    const { error } = await supabase.from("blog_comments").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      setComments((c) => c.filter((x) => x.id !== id));
      toast({ title: "Deleted", description: "Comment removed." });
    }
    setActioning(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Comments</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading…" : `${pendingCount} pending · ${approvedCount} approved`}
          </p>
        </div>
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted">
          {(["pending", "approved", "all"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t} {t === "pending" && pendingCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground mb-1">
            {tab === "pending" ? "No comments waiting for review" : `No ${tab} comments`}
          </p>
          <p className="text-xs text-muted-foreground">
            {tab === "pending" ? "You're all caught up. Refreshes every minute." : "Nothing to show."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((c) => (
              <motion.li
                key={c.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl border p-4 md:p-5 ${
                  c.approved ? "bg-card border-border" : "bg-amber-50/30 dark:bg-amber-950/10 border-amber-200/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{c.author_name}</span>
                      {c.author_email && (
                        <span className="text-xs text-muted-foreground">{c.author_email}</span>
                      )}
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {RELATIVE(c.created_at)}
                      </span>
                      {!c.approved && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/blog/${c.post_slug}`}
                      target="_blank"
                      rel="noopener"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      on: {c.post_title || c.post_slug} <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mb-3">{c.body}</p>
                <div className="flex items-center gap-2">
                  {!c.approved && (
                    <Button
                      size="sm"
                      onClick={() => approve(c.id)}
                      disabled={actioning === c.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    >
                      {actioning === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      Approve
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => reject(c.id)}
                    disabled={actioning === c.id}
                    className="text-rose-600 hover:bg-rose-50 border-rose-200 gap-1.5"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
