import { useState, useEffect } from "react";
import { Share2, Twitter, Facebook, Linkedin, Mail, Link as LinkIcon, Bookmark, BookmarkCheck, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  url: string;
  title: string;
  slug: string;
  excerpt?: string;
  compact?: boolean;
}

const SAVED_KEY = "vibelink_saved_articles";

function getSaved(): string[] {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; }
}
function setSaved(arr: string[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(arr));
}

export const BlogSocialToolbar = ({ url, title, slug, excerpt, compact }: Props) => {
  const { toast } = useToast();
  const [saved, setSavedState] = useState(false);

  useEffect(() => {
    setSavedState(getSaved().includes(slug));
  }, [slug]);

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  const encTitle = encodeURIComponent(title);
  const encUrl = encodeURIComponent(fullUrl);
  const encExcerpt = encodeURIComponent(excerpt || "");

  const handlers = {
    twitter: () => window.open(`https://twitter.com/intent/tweet?url=${encUrl}&text=${encTitle}`, "_blank", "noopener,width=600,height=500"),
    facebook: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`, "_blank", "noopener,width=600,height=500"),
    linkedin: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`, "_blank", "noopener,width=600,height=500"),
    whatsapp: () => window.open(`https://wa.me/?text=${encTitle}%20${encUrl}`, "_blank", "noopener"),
    email: () => { window.location.href = `mailto:?subject=${encTitle}&body=${encExcerpt}%0A%0A${encUrl}`; },
    copy: async () => {
      try {
        await navigator.clipboard.writeText(fullUrl);
        toast({ title: "Link copied", description: "Article URL is on your clipboard." });
      } catch {
        toast({ title: "Couldn't copy", variant: "destructive" });
      }
    },
    save: () => {
      const current = getSaved();
      let next;
      if (current.includes(slug)) {
        next = current.filter(s => s !== slug);
        setSaved(next);
        setSavedState(false);
        toast({ title: "Removed from saved" });
      } else {
        next = [slug, ...current];
        setSaved(next);
        setSavedState(true);
        toast({ title: "Saved for later", description: "Find it under Saved Articles." });
      }
    },
  };

  const btn = "inline-flex items-center justify-center rounded-full transition-all";
  const iconBtn = compact
    ? `${btn} w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-muted`
    : `${btn} w-10 h-10 bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary hover:shadow-md`;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${compact ? "" : "py-3"}`}>
      {!compact && (
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-2 inline-flex items-center gap-1.5">
          <Share2 className="h-3.5 w-3.5" /> Share
        </span>
      )}
      <button onClick={handlers.twitter} className={iconBtn} aria-label="Share on Twitter" title="Twitter / X"><Twitter className="h-4 w-4" /></button>
      <button onClick={handlers.facebook} className={iconBtn} aria-label="Share on Facebook" title="Facebook"><Facebook className="h-4 w-4" /></button>
      <button onClick={handlers.linkedin} className={iconBtn} aria-label="Share on LinkedIn" title="LinkedIn"><Linkedin className="h-4 w-4" /></button>
      <button onClick={handlers.whatsapp} className={iconBtn} aria-label="Share on WhatsApp" title="WhatsApp"><MessageCircle className="h-4 w-4" /></button>
      <button onClick={handlers.email} className={iconBtn} aria-label="Share via Email" title="Email"><Mail className="h-4 w-4" /></button>
      <button onClick={handlers.copy} className={iconBtn} aria-label="Copy link" title="Copy link"><LinkIcon className="h-4 w-4" /></button>
      <div className={`${compact ? "ml-1" : "mx-1 w-px h-6 bg-border"}`} />
      <button
        onClick={handlers.save}
        className={`${btn} ${compact ? "h-9 px-3" : "h-10 px-4"} ${saved ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary"} text-sm font-medium gap-1.5`}
        title={saved ? "Remove from saved" : "Save for later"}
      >
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {saved ? "Saved" : "Save for later"}
      </button>
    </div>
  );
};

export default BlogSocialToolbar;
