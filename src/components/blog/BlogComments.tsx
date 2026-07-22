// Comments section for the article page.
// - Renders approved comments in reverse-chronological order
// - Lets any reader post a new comment; it lands as `approved = false`
//   and only appears once an admin approves it via the admin panel
// - Rate-limited by localStorage cooldown so a single reader can't spam
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Comment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

interface Props {
  postId: string;
}

const COOLDOWN_MS = 60_000;                   // one comment per minute per browser

export function BlogComments({ postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blog_comments")
        .select("id, author_name, body, created_at")
        .eq("post_id", postId)
        .eq("approved", true)
        .order("created_at", { ascending: false });
      setComments(data || []);
      setLoading(false);
    };
    load();
  }, [postId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (name.trim().length < 1) return setError("Please add your name.");
    if (body.trim().length < 3) return setError("Comment is too short.");
    if (body.trim().length > 2000) return setError("Comment is too long (max 2000 chars).");

    // Cooldown: one comment per minute
    const lastPost = Number(localStorage.getItem("bl:lastComment") || 0);
    if (Date.now() - lastPost < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (Date.now() - lastPost)) / 1000);
      return setError(`Please wait ${wait}s before posting another comment.`);
    }

    setSubmitting(true);
    const { error: insErr } = await supabase.from("blog_comments").insert({
      post_id: postId,
      author_name: name.trim().slice(0, 80),
      author_email: email.trim().slice(0, 120) || null,
      body: body.trim(),
      approved: false,
    });
    setSubmitting(false);

    if (insErr) {
      console.error(insErr);
      setError("Something went wrong. Please try again.");
      return;
    }

    localStorage.setItem("bl:lastComment", String(Date.now()));
    setJustSubmitted(true);
    setName("");
    setEmail("");
    setBody("");
  };

  return (
    <section className="py-14 md:py-16 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">
            {loading ? "Comments" : `${comments.length} Comment${comments.length === 1 ? "" : "s"}`}
          </h2>
        </div>

        {/* Existing comments */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm mb-10 border border-dashed border-border rounded-2xl">
            Be the first to add a thought.
          </div>
        ) : (
          <ul className="space-y-4 mb-12">
            {comments.map((c) => {
              const initials = c.author_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl bg-card border border-border p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{c.author_name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {format(new Date(c.created_at), "d MMM yyyy")}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{c.body}</p>
                </motion.li>
              );
            })}
          </ul>
        )}

        {/* Comment form */}
        {justSubmitted ? (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 text-sm mb-1">Thanks for adding your thoughts.</p>
              <p className="text-xs text-emerald-800/80">
                Your comment is waiting for review. It&apos;ll show up here once our team approves it.
              </p>
            </div>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="rounded-2xl bg-card border border-border p-6 space-y-4"
          >
            <div>
              <p className="font-semibold text-foreground mb-1">Add a comment</p>
              <p className="text-xs text-muted-foreground">
                Comments are reviewed by our team before appearing.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Your name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                type="email"
                placeholder="Email (optional — never shown)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={120}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <textarea
              placeholder="Your comment *"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={2000}
              required
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"
            />

            {error && (
              <p className="text-xs text-rose-600 font-semibold">{error}</p>
            )}

            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] text-muted-foreground">
                {body.length}/2000 characters
              </p>
              <Button type="submit" size="sm" disabled={submitting} className="gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Posting…
                  </>
                ) : (
                  <>
                    Post comment <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
