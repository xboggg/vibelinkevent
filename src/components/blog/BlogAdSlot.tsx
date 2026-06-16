import { Zap } from "lucide-react";

interface Props {
  size?: "300x250" | "300x600" | "320x100";
  label?: string;
}

const dims = {
  "300x250": { w: 300, h: 250, name: "300 × 250" },
  "300x600": { w: 300, h: 600, name: "300 × 600" },
  "320x100": { w: 320, h: 100, name: "320 × 100" },
};

/**
 * Ad slot placeholder. Renders a 300x250 medium-rectangle dashed box that's
 * clearly visible (so you know the slot is there). When you have real ad
 * scripts, replace the children with the network's <ins> or iframe and
 * delete the placeholder body.
 */
export const BlogAdSlot = ({ size = "300x250", label = "Advertisement" }: Props) => {
  const d = dims[size];
  return (
    <aside
      aria-label="Advertisement"
      className="bg-card border border-border rounded-2xl p-4"
    >
      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground text-center mb-3">
        — {label} —
      </div>
      <div
        className="border-2 border-dashed border-primary/30 rounded-xl bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/10 flex flex-col items-center justify-center text-center px-4 mx-auto"
        style={{ width: "100%", maxWidth: d.w, height: d.h }}
      >
        <Zap className="h-7 w-7 mb-2 text-primary/60" />
        <p className="text-sm font-semibold text-foreground/70">Your ad could be here</p>
        <p className="text-[11px] text-muted-foreground mt-1">{d.name}</p>
      </div>
    </aside>
  );
};

export default BlogAdSlot;
