import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, ImageIcon, Trash2, ExternalLink } from "lucide-react";

const BUCKET = "blog-images";

interface Props {
  value: string;
  onChange: (url: string) => void;
  slug?: string;
}

async function ensureBucket() {
  // Idempotent: try to create the public bucket. If it already exists, the API
  // returns an error we can ignore.
  try {
    await supabase.storage.createBucket(BUCKET, { public: true });
  } catch {
    // Already exists — fine.
  }
}

function safeFilename(slug: string | undefined, originalName: string): string {
  const ext = originalName.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || "jpg";
  const base = (slug || "blog").replace(/[^a-z0-9-]+/gi, "-").slice(0, 50);
  const ts = Math.floor(Date.now() / 1000);
  return `articles/${base}-${ts}.${ext}`;
}

export const BlogImageUpload = ({ value, onChange, slug }: Props) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Not an image", description: "Pick a JPG, PNG, or WEBP file.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Too large", description: "Image must be under 10 MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      await ensureBucket();
      const path = safeFilename(slug, file.name);
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
        cacheControl: "31536000",
      });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
      toast({ title: "Image uploaded", description: "Saved. Don't forget to Save the article." });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Upload failed", description: msg, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or upload below"
          className="text-xs flex-1"
          disabled={uploading}
        />
        {value && (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground"
            title="Open image in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {value && (
          <button
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-destructive"
            title="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        disabled={uploading}
        className={`w-full rounded-lg border-2 border-dashed transition-colors p-4 text-center text-xs ${
          dragOver
            ? "border-primary bg-primary/5 text-primary"
            : "border-border hover:border-primary/40 text-muted-foreground"
        }`}
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" /> Click or drag-drop an image here (JPG / PNG / WEBP, ≤10 MB)
          </span>
        )}
      </button>

      {value ? (
        <img
          src={value}
          alt=""
          className="w-full aspect-video object-cover rounded-lg border border-border"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="w-full aspect-video flex flex-col items-center justify-center bg-muted/30 rounded-lg border border-dashed border-border text-muted-foreground">
          <ImageIcon className="h-6 w-6 mb-1 opacity-50" />
          <p className="text-xs">No featured image yet</p>
        </div>
      )}
    </div>
  );
};

export default BlogImageUpload;
