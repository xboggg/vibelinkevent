import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Loader2, Shuffle } from "lucide-react";

interface MiniPost {
  id: string;
  title: string;
  category: string;
  slug: string;
  published: boolean;
  published_at: string | null;
}

interface Props {
  posts: MiniPost[];
  onComplete: () => void;
}

type OrderMode = "category-rotation" | "alphabetical" | "current-order";

export const BlogBulkSchedule = ({ posts, onComplete }: Props) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [timeOfDay, setTimeOfDay] = useState("09:00");
  const [cadenceDays, setCadenceDays] = useState(3);
  const [orderMode, setOrderMode] = useState<OrderMode>("category-rotation");
  const [scope, setScope] = useState<"drafts-only" | "all">("drafts-only");
  const [running, setRunning] = useState(false);

  const targets = useMemo(() => {
    return scope === "drafts-only"
      ? posts.filter((p) => !p.published)
      : posts.slice();
  }, [posts, scope]);

  const orderedTargets = useMemo(() => {
    if (orderMode === "alphabetical") {
      return [...targets].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (orderMode === "category-rotation") {
      // Bucket by category, then round-robin through buckets so consecutive
      // articles never share a category. Better SEO variety + reader retention.
      const buckets: Record<string, MiniPost[]> = {};
      for (const p of targets) {
        (buckets[p.category] = buckets[p.category] || []).push(p);
      }
      // Sort each bucket by title for stability
      Object.values(buckets).forEach((b) => b.sort((a, b) => a.title.localeCompare(b.title)));
      const categories = Object.keys(buckets).sort();
      const result: MiniPost[] = [];
      let added = 1;
      while (added > 0) {
        added = 0;
        for (const cat of categories) {
          const next = buckets[cat].shift();
          if (next) { result.push(next); added++; }
        }
      }
      return result;
    }
    return targets;
  }, [targets, orderMode]);

  const previewDates = useMemo(() => {
    if (!orderedTargets.length) return [];
    const [hh, mm] = timeOfDay.split(":").map(Number);
    const base = new Date(startDate + "T00:00:00");
    base.setHours(hh, mm, 0, 0);
    return orderedTargets.map((p, i) => {
      const d = new Date(base);
      d.setDate(d.getDate() + i * cadenceDays);
      return { post: p, date: d };
    });
  }, [orderedTargets, startDate, timeOfDay, cadenceDays]);

  const lastDate = previewDates[previewDates.length - 1]?.date;

  const apply = async () => {
    setRunning(true);
    let success = 0, failed = 0;
    for (const { post, date } of previewDates) {
      try {
        const { error } = await supabase
          .from("blog_posts")
          .update({
            published: true,
            published_at: date.toISOString(),
            scheduled_publish_at: date.toISOString(),
          })
          .eq("id", post.id);
        if (error) throw error;
        success++;
      } catch (e) {
        failed++;
        console.error(`Schedule failed for ${post.slug}:`, e);
      }
    }
    setRunning(false);
    toast({
      title: "Scheduling complete",
      description: `${success} scheduled, ${failed} failed.`,
    });
    onComplete();
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
        <Calendar className="h-4 w-4" /> Bulk Schedule
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Auto-Schedule Articles</DialogTitle>
            <DialogDescription>
              Set release dates for {targets.length} article{targets.length !== 1 ? "s" : ""}. Each
              one becomes <code className="text-xs bg-muted px-1 py-0.5 rounded">published=true</code> but
              stays hidden on the public blog until its release time arrives. No cron job needed —
              the public page filters by release date automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-date">Start date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={running}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time-of-day">Release time (Ghana time)</Label>
              <Input
                id="time-of-day"
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                disabled={running}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cadence">Days between releases</Label>
              <Input
                id="cadence"
                type="number"
                min={1}
                max={30}
                value={cadenceDays}
                onChange={(e) => setCadenceDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 3)))}
                disabled={running}
              />
              <p className="text-xs text-muted-foreground">
                {cadenceDays === 1 ? "Daily" : cadenceDays === 7 ? "Weekly" : `Every ${cadenceDays} days`}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scope">Apply to</Label>
              <Select value={scope} onValueChange={(v) => setScope(v as typeof scope)} disabled={running}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="drafts-only">Drafts only ({posts.filter((p) => !p.published).length})</SelectItem>
                  <SelectItem value="all">All articles ({posts.length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="order">Order</Label>
              <Select value={orderMode} onValueChange={(v) => setOrderMode(v as OrderMode)} disabled={running}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="category-rotation">
                    <div className="flex items-center gap-2"><Shuffle className="h-3 w-3" /> Category rotation (mix topics)</div>
                  </SelectItem>
                  <SelectItem value="alphabetical">Alphabetical by title</SelectItem>
                  <SelectItem value="current-order">Current order in admin (newest first)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-3">
            <p className="text-sm font-semibold mb-2">Schedule summary</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <div>Articles:</div><div className="text-right text-foreground">{orderedTargets.length}</div>
              <div>First release:</div><div className="text-right text-foreground">{previewDates[0]?.date.toLocaleString() ?? "—"}</div>
              <div>Last release:</div><div className="text-right text-foreground">{lastDate?.toLocaleString() ?? "—"}</div>
              <div>Total duration:</div><div className="text-right text-foreground">{(orderedTargets.length - 1) * cadenceDays} days ({Math.round((orderedTargets.length - 1) * cadenceDays / 30 * 10) / 10} months)</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto border rounded-md mt-2">
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground sticky top-0">
                <tr>
                  <th className="text-left p-2 font-semibold w-12">#</th>
                  <th className="text-left p-2 font-semibold">Release</th>
                  <th className="text-left p-2 font-semibold">Title</th>
                  <th className="text-left p-2 font-semibold w-32">Category</th>
                </tr>
              </thead>
              <tbody>
                {previewDates.map((row, i) => (
                  <tr key={row.post.id} className="border-t hover:bg-muted/40">
                    <td className="p-2 text-muted-foreground">{i + 1}</td>
                    <td className="p-2 whitespace-nowrap">{row.date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</td>
                    <td className="p-2 truncate max-w-[300px]">{row.post.title}</td>
                    <td className="p-2 text-muted-foreground">{row.post.category}</td>
                  </tr>
                ))}
                {!previewDates.length && (
                  <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No articles match your filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={running}>Cancel</Button>
            <Button onClick={apply} disabled={running || !previewDates.length}>
              {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scheduling...</> : <>Schedule {previewDates.length} article{previewDates.length !== 1 ? "s" : ""}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlogBulkSchedule;
