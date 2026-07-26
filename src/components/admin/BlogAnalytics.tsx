// Blog analytics: total views, top articles, per-post view trend (last 30 days).
//
// Reads from blog_post_views — a pre-aggregated view (not a raw events
// table) with columns: post_id (FK -> blog_posts.id), day (date), view_count.
//
// Historical bug (fixed 2026-07-26): earlier version queried post_slug and
// viewed_at, neither of which exist on blog_post_views. That threw a 400
// on every load and the whole panel read 0. The real columns are post_id
// and day; the FK to blog_posts is joined via PostgREST embed to resolve
// slug/title/category in a single round-trip.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, Eye, Calendar, ArrowUp, ArrowDown, Minus, ExternalLink } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";

// Row shape after the embed. `blog_posts` is null when a view row somehow
// references a deleted post — we filter those out defensively.
interface ViewRow {
  post_id: string;
  day: string;         // ISO date, e.g. "2026-07-25"
  view_count: number;
  blog_posts: { slug: string; title: string; category: string; published: boolean } | null;
}

interface PostSummary {
  slug: string;
  title: string;
  category: string;
  total: number;
  last7: number;
  prev7: number;
  trend: "up" | "down" | "flat";
  daily: { date: string; views: number }[];
}

const DAYS = 30;

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

// Build a 30-day-aligned buckets array. Rows carry a `day` field (already
// ISO date) and a `view_count`. Since the source is pre-aggregated by
// (post_id, day), each row contributes its view_count to its day bucket.
function buildDailyBuckets(rows: ViewRow[]): Record<string, number> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const buckets: Record<string, number> = {};
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    buckets[toISO(d)] = 0;
  }
  for (const r of rows) {
    // `day` may be a full timestamp or a plain date; normalize either way.
    const key = (r.day || "").slice(0, 10);
    if (key in buckets) buckets[key] += r.view_count || 0;
  }
  return buckets;
}

export function BlogAnalytics() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [totalViews30d, setTotalViews30d] = useState(0);
  const [dailyTotal, setDailyTotal] = useState<{ date: string; views: number }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const since = new Date();
        since.setUTCDate(since.getUTCDate() - DAYS);
        since.setUTCHours(0, 0, 0, 0);
        const sinceIso = toISO(since);
        const [viewsResp, postsResp] = await Promise.all([
          // Embed blog_posts via the FK on post_id so we get slug/title/category
          // in one round-trip. day is filtered as ISO date.
          supabase
            .from("blog_post_views")
            .select("post_id, day, view_count, blog_posts(slug, title, category, published)")
            .gte("day", sinceIso)
            .limit(50000),
          // Second fetch: every published post, so unread articles still
          // appear in the "All articles" list with 0 views.
          supabase.from("blog_posts").select("slug, title, category").eq("published", true),
        ]);
        if (viewsResp.error) throw viewsResp.error;
        if (postsResp.error) throw postsResp.error;

        // Cast to our row shape (Supabase's generated types don't know about
        // the blog_post_views view yet).
        const views = ((viewsResp.data || []) as unknown) as ViewRow[];
        const postsMeta = postsResp.data || [];

        // Bucket rows by slug (via the embedded blog_posts.slug).
        const bySlug = new Map<string, ViewRow[]>();
        for (const v of views) {
          const slug = v.blog_posts?.slug;
          if (!slug) continue; // orphaned view row (post deleted) — skip
          if (!bySlug.has(slug)) bySlug.set(slug, []);
          bySlug.get(slug)!.push(v);
        }

        // Site-wide daily totals — sum view_count across all rows.
        const siteBuckets = buildDailyBuckets(views);
        setDailyTotal(Object.entries(siteBuckets).map(([date, v]) => ({ date, views: v })));
        setTotalViews30d(views.reduce((s, r) => s + (r.view_count || 0), 0));

        const summaries: PostSummary[] = [];
        for (const meta of postsMeta) {
          const rows = bySlug.get(meta.slug) || [];
          const buckets = buildDailyBuckets(rows);
          const daily = Object.entries(buckets).map(([date, views]) => ({ date, views }));
          const total = rows.reduce((s, r) => s + (r.view_count || 0), 0);
          const last7 = daily.slice(-7).reduce((s, d) => s + d.views, 0);
          const prev7 = daily.slice(-14, -7).reduce((s, d) => s + d.views, 0);
          const trend: PostSummary["trend"] =
            last7 > prev7 * 1.15 ? "up" : last7 < prev7 * 0.85 ? "down" : "flat";
          summaries.push({
            slug: meta.slug,
            title: meta.title,
            category: meta.category,
            total,
            last7,
            prev7,
            trend,
            daily,
          });
        }
        summaries.sort((a, b) => b.total - a.total);
        setPosts(summaries);
      } catch (e: any) {
        toast({ title: "Analytics load failed", description: e?.message || String(e), variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const top10 = useMemo(() => posts.slice(0, 10), [posts]);
  const peakDay = useMemo(() => {
    if (!dailyTotal.length) return null;
    return dailyTotal.reduce((peak, d) => (d.views > peak.views ? d : peak), dailyTotal[0]);
  }, [dailyTotal]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Blog Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Last {DAYS} days · {totalViews30d.toLocaleString()} total views · {posts.filter((p) => p.total > 0).length} articles with traffic
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Total views</div>
          <div className="text-2xl font-bold text-primary mt-1">{totalViews30d.toLocaleString()}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Peak day</div>
          <div className="text-2xl font-bold text-foreground mt-1">{peakDay ? peakDay.views : 0}</div>
          <div className="text-[10px] text-muted-foreground">{peakDay ? new Date(peakDay.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Daily avg</div>
          <div className="text-2xl font-bold text-foreground mt-1">{Math.round(totalViews30d / DAYS)}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Articles with views</div>
          <div className="text-2xl font-bold text-foreground mt-1">{posts.filter((p) => p.total > 0).length}</div>
          <div className="text-[10px] text-muted-foreground">of {posts.length} published</div>
        </div>
      </div>

      {/* Site-wide trend */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <h3 className="text-sm font-bold text-foreground mb-3 inline-flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-primary" /> Site-wide daily views
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTotal}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                labelFormatter={(v) => new Date(v as string).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
              />
              <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <h3 className="text-sm font-bold text-foreground mb-3 inline-flex items-center gap-1.5">
          <Eye className="h-4 w-4 text-primary" /> Top 10 articles by views ({DAYS}d)
        </h3>
        {top10.length === 0 || top10.every((p) => p.total === 0) ? (
          <p className="text-sm text-muted-foreground py-4">No view data yet. Check back after readers arrive.</p>
        ) : (
          <ul className="space-y-2">
            {top10.map((p, i) => (
              <motion.li
                key={p.slug}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/40 transition-colors"
              >
                <span className="w-8 text-center text-lg font-black text-primary/70 font-serif shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.category}</div>
                </div>
                {/* Sparkline */}
                <div className="w-24 h-8 shrink-0 hidden sm:block">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={p.daily}>
                      <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col items-end shrink-0 min-w-[100px]">
                  <div className="text-base font-bold text-foreground">{p.total.toLocaleString()}</div>
                  <div className="text-[10px] flex items-center gap-1">
                    {p.trend === "up" && <ArrowUp className="h-3 w-3 text-emerald-600" />}
                    {p.trend === "down" && <ArrowDown className="h-3 w-3 text-rose-600" />}
                    {p.trend === "flat" && <Minus className="h-3 w-3 text-muted-foreground" />}
                    <span className={p.trend === "up" ? "text-emerald-600" : p.trend === "down" ? "text-rose-600" : "text-muted-foreground"}>
                      7d: {p.last7} (was {p.prev7})
                    </span>
                  </div>
                </div>
                <Link to={`/blog/${p.slug}`} target="_blank" rel="noopener" className="p-1.5 rounded text-muted-foreground hover:text-foreground shrink-0">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* All articles table */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <h3 className="text-sm font-bold text-foreground mb-3 inline-flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-primary" /> All articles
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-medium text-muted-foreground uppercase border-b border-border">
                <th className="text-left py-2 px-2">Article</th>
                <th className="text-right py-2 px-2">30d total</th>
                <th className="text-right py-2 px-2 hidden md:table-cell">Last 7d</th>
                <th className="text-right py-2 px-2 hidden md:table-cell">Prev 7d</th>
                <th className="text-right py-2 px-2">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {posts.map((p) => (
                <tr key={p.slug} className="text-sm">
                  <td className="py-2 px-2">
                    <Link to={`/blog/${p.slug}`} target="_blank" rel="noopener" className="hover:text-primary line-clamp-1 max-w-md inline-block">
                      {p.title}
                    </Link>
                    <div className="text-[10px] text-muted-foreground">{p.category}</div>
                  </td>
                  <td className="text-right py-2 px-2 font-bold">{p.total}</td>
                  <td className="text-right py-2 px-2 hidden md:table-cell">{p.last7}</td>
                  <td className="text-right py-2 px-2 hidden md:table-cell text-muted-foreground">{p.prev7}</td>
                  <td className="text-right py-2 px-2">
                    {p.trend === "up" && <ArrowUp className="h-3.5 w-3.5 text-emerald-600 inline" />}
                    {p.trend === "down" && <ArrowDown className="h-3.5 w-3.5 text-rose-600 inline" />}
                    {p.trend === "flat" && <Minus className="h-3.5 w-3.5 text-muted-foreground inline" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
