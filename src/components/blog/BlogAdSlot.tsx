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
 * Ad slot placeholder, styled to read as a real-but-quiet ad unit rather than
 * a heavy placeholder card. Spec-compliant medium rectangle by default.
 * When you have a real ad network, replace the inner placeholder block with
 * the network's <ins> tag — the surrounding label + sizing stays.
 */
export const BlogAdSlot = ({ size = "300x250", label = "Advertisement" }: Props) => {
  const d = dims[size];
  return (
    <aside aria-label="Advertisement" className="w-full">
      <p className="text-[9px] font-semibold tracking-[0.25em] uppercase text-muted-foreground/80 text-center mb-1.5">
        {label}
      </p>
      <div
        className="mx-auto rounded-xl border border-border bg-gradient-to-br from-muted/40 via-background to-muted/20 flex flex-col items-center justify-center text-center"
        style={{ width: "100%", maxWidth: d.w, height: d.h }}
      >
        <p className="text-sm font-medium text-muted-foreground">Your ad could be here</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">{d.name}</p>
      </div>
    </aside>
  );
};

export default BlogAdSlot;
