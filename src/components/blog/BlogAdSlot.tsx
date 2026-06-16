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
 * Ad slot placeholder. Renders a dashed-border box matching common ad unit
 * sizes (defaults to 300x250 medium rectangle). When you have real ad scripts
 * to drop in, replace the children with the script's <ins> or iframe.
 *
 * To wire AdSense or another network later:
 *   - Pass a `slot` prop with the network's slot ID
 *   - Replace the placeholder children with the network's <ins> tag
 */
export const BlogAdSlot = ({ size = "300x250", label = "Advertisement" }: Props) => {
  const d = dims[size];
  return (
    <aside aria-label="Advertisement" className="ad-slot">
      <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground/70 text-center mb-2">
        {label}
      </div>
      <div
        className="border-2 border-dashed border-border/60 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 flex flex-col items-center justify-center text-center text-muted-foreground/60 px-4"
        style={{ width: "100%", maxWidth: d.w, height: d.h, marginInline: "auto" }}
      >
        <Zap className="h-5 w-5 mb-2 opacity-50" />
        <p className="text-xs font-medium">Your ad could be here</p>
        <p className="text-[10px] opacity-70 mt-0.5">{d.name}</p>
      </div>
    </aside>
  );
};

export default BlogAdSlot;
