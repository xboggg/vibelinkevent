import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Images, Upload, Loader2, CheckCircle2, AlertCircle, Search, X, Sparkles, ImageIcon,
} from "lucide-react";

const BUCKET = "blog-images";

interface MiniPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  image_url: string | null;
  published: boolean;
}

interface UploadStatus {
  state: "idle" | "uploading" | "success" | "error";
  message?: string;
}

async function ensureBucket() {
  try {
    await supabase.storage.createBucket(BUCKET, { public: true });
  } catch {
    // exists
  }
}

function safePath(slug: string, originalName: string): string {
  const ext = originalName.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || "jpg";
  const base = slug.replace(/[^a-z0-9-]+/gi, "-").slice(0, 60);
  const ts = Math.floor(Date.now() / 1000);
  return `articles/${base}-${ts}.${ext}`;
}

// ─── one card per article ────────────────────────────────────────────────────
const ArticleImageCard = ({
  post,
  status,
  onFile,
}: {
  post: MiniPost;
  status: UploadStatus;
  onFile: (file: File) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  const isSuccess = status.state === "success";
  const isUploading = status.state === "uploading";
  const isError = status.state === "error";

  return (
    <div
      className={`border rounded-xl overflow-hidden bg-card transition-all ${
        dragOver ? "border-primary shadow-lg ring-2 ring-primary/40" : "border-border"
      } ${isSuccess ? "ring-2 ring-green-500/50" : ""} ${isError ? "ring-2 ring-red-500/50" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="aspect-[16/9] bg-muted/40 relative">
        {post.image_url ? (
          <img
            src={post.image_url}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 opacity-40" />
            <p className="text-xs mt-1">No image</p>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-xs mt-1">Uploading...</p>
          </div>
        )}
        {isSuccess && (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}
        {isError && (
          <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1" title={status.message}>
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">{post.category}</p>
        <p className="text-sm font-medium line-clamp-2 leading-tight mt-0.5">{post.title}</p>
        <div className="flex gap-1.5 mt-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 flex-1"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-3 w-3 mr-1" />
            {post.image_url ? "Replace" : "Upload"}
          </Button>
        </div>
        {status.message && !isError && (
          <p className="text-[10px] text-muted-foreground mt-1 truncate">{status.message}</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </div>
  );
};

// ─── main component ─────────────────────────────────────────────────────────
export const BlogBulkImageManager = ({ onComplete }: { onComplete?: () => void }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<MiniPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, UploadStatus>>({});
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [imageFilter, setImageFilter] = useState<"all" | "missing" | "has">("all");

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("id, slug, title, category, image_url, published")
      .order("category", { ascending: true })
      .order("title", { ascending: true });
    setPosts((data ?? []) as MiniPost[]);
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchPosts();
  }, [open]);

  const setStatus = (postId: string, s: UploadStatus) => {
    setStatuses((prev) => ({ ...prev, [postId]: s }));
  };

  const handleFile = async (post: MiniPost, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setStatus(post.id, { state: "error", message: "Too large (max 10 MB)" });
      return;
    }
    setStatus(post.id, { state: "uploading" });
    try {
      await ensureBucket();
      const path = safePath(post.slug, file.name);
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false, cacheControl: "31536000" });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const newUrl = pub.publicUrl;

      const { error: updateErr } = await supabase
        .from("blog_posts")
        .update({ image_url: newUrl })
        .eq("id", post.id);
      if (updateErr) throw updateErr;

      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, image_url: newUrl } : p)));
      setStatus(post.id, { state: "success", message: file.name });
    } catch (e) {
      setStatus(post.id, { state: "error", message: e instanceof Error ? e.message : "Failed" });
      toast({
        title: `Upload failed for "${post.title.slice(0, 40)}..."`,
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const categoryCounts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const categories = Object.keys(categoryCounts).sort();

  const filtered = posts.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (imageFilter === "missing" && p.image_url) return false;
    if (imageFilter === "has" && !p.image_url) return false;
    if (search.trim() && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const summary = {
    total: posts.length,
    withImages: posts.filter((p) => p.image_url).length,
    uploaded: Object.values(statuses).filter((s) => s.state === "success").length,
    failed: Object.values(statuses).filter((s) => s.state === "error").length,
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
        <Images className="h-4 w-4" /> Bulk Manage Images
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v && summary.uploaded > 0 && onComplete) onComplete();
        }}
      >
        <DialogContent className="max-w-6xl w-[95vw] max-h-[92vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-3 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Images className="h-5 w-5" /> Bulk Manage Featured Images
            </DialogTitle>
            <DialogDescription>
              Drag an image onto any article card to upload — auto-saves image_url. Or click Upload / Replace on each card.
            </DialogDescription>
            <div className="flex items-center gap-4 text-xs pt-2 flex-wrap">
              <span className="font-semibold">Summary:</span>
              <span>{summary.total} articles</span>
              <span className="text-primary">{summary.withImages} with images</span>
              <span className="text-muted-foreground">{summary.total - summary.withImages} missing</span>
              {summary.uploaded > 0 && <span className="text-green-600">↑ {summary.uploaded} this session</span>}
              {summary.failed > 0 && <span className="text-red-600">⚠ {summary.failed} failed</span>}
            </div>
          </DialogHeader>

          <div className="px-6 py-3 border-b flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search titles..."
                className="pl-9 h-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories ({posts.length})</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c} ({categoryCounts[c]})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={imageFilter} onValueChange={(v) => setImageFilter(v as typeof imageFilter)}>
              <SelectTrigger className="w-full md:w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All images</SelectItem>
                <SelectItem value="missing">Missing only ({summary.total - summary.withImages})</SelectItem>
                <SelectItem value="has">Has image only ({summary.withImages})</SelectItem>
              </SelectContent>
            </Select>
            {(search || categoryFilter !== "all" || imageFilter !== "all") && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setSearch(""); setCategoryFilter("all"); setImageFilter("all"); }}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No articles match your filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((post) => (
                  <ArticleImageCard
                    key={post.id}
                    post={post}
                    status={statuses[post.id] ?? { state: "idle" }}
                    onFile={(file) => handleFile(post, file)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Uploads save automatically to Supabase Storage + update image_url. No manual save needed.
            </p>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BlogBulkImageManager;
