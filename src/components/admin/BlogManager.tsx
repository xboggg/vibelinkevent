import { useState, useEffect, useCallback } from "react";
import { BlogBulkImport } from "./BlogBulkImport";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Code, Link as LinkIcon,
  Image as ImageIcon, Heading1, Heading2, Heading3,
  Highlighter, Undo, Redo, Eye, EyeOff, Save,
  PlusCircle, Pencil, Trash2, Search, Globe, Clock,
  Star, Loader2, FileText, X, ExternalLink, CheckCircle2, AlertCircle
} from "lucide-react";

const CATEGORIES = [
  "Wedding", "Funeral & Memorial", "Anniversaries", "Church",
  "Community", "Ghanaian Culture", "Event Planning",
  "Naming Ceremonies", "Inspirations", "Tips & Guides",
  "Birthdays", "Graduations", "Corporate Events"
];

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string;
  read_time: string;
  featured: boolean;
  published: boolean;
  author_name: string;
  published_at: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  tags: string[];
  created_at: string;
}

const emptyPost = (): Partial<BlogPost> => ({
  title: "", slug: "", excerpt: "", content: "",
  category: "Event Planning", image_url: "",
  read_time: "5 min read", featured: false, published: false,
  author_name: "VibeLink Editorial", meta_description: "", focus_keyword: "", tags: [],
});

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function estimateReadTime(html: string) {
  const words = html.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

const TB = ({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
  <button onMouseDown={e => { e.preventDefault(); onClick(); }} title={title}
    className={`p-1.5 rounded text-sm transition-colors ${active ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
    {children}
  </button>
);
const Sep = () => <div className="w-px h-6 bg-border mx-1" />;

function insertCallout(editor: ReturnType<typeof useEditor>, type: "purple" | "gold" | "quote" | "hr") {
  if (!editor) return;
  const html: Record<string, string> = {
    purple: `<div style="background:linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%);color:white;padding:1.2em 1.5em;border-radius:10px;margin:1.5em 0;font-size:1.05em;"><strong>Key Fact:</strong> Add your key fact here.</div>`,
    gold: `<div style="background:#fffbeb;border-left:4px solid #d97706;padding:1em 1.5em;margin:1.5em 0;border-radius:0 8px 8px 0;"><strong>Tip:</strong> Add your practical tip here.</div>`,
    quote: `<blockquote style="border-left:4px solid #7c3aed;padding:1em 1.5em;margin:1.5em 0;background:#f5f3ff;border-radius:0 8px 8px 0;font-style:italic;">Add your quote or proverb here.</blockquote>`,
    hr: `<hr style="border:none;height:2px;background:linear-gradient(to right,#7c3aed,#d97706,#7c3aed);margin:2em 0;">`,
  };
  editor.commands.insertContent(html[type]);
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [showImg, setShowImg] = useState(false);
  if (!editor) return null;
  return (
    <div className="border-b border-border bg-muted/30 p-2 flex flex-wrap gap-0.5 items-center sticky top-0 z-10">
      <TB onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="h-4 w-4" /></TB>
      <Sep />
      <TB onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="H1"><Heading1 className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2"><Heading2 className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3"><Heading3 className="h-4 w-4" /></TB>
      <Sep />
      <TB onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><UnderlineIcon className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strike"><Strikethrough className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Highlight"><Highlighter className="h-4 w-4" /></TB>
      <Sep />
      <TB onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Left"><AlignLeft className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Center"><AlignCenter className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Right"><AlignRight className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify"><AlignJustify className="h-4 w-4" /></TB>
      <Sep />
      <TB onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullets"><List className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered"><ListOrdered className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><Quote className="h-4 w-4" /></TB>
      <TB onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code"><Code className="h-4 w-4" /></TB>
      <Sep />
      <div className="relative">
        <TB onClick={() => setShowLink(p => !p)} active={editor.isActive("link")} title="Link"><LinkIcon className="h-4 w-4" /></TB>
        {showLink && (
          <div className="absolute top-8 left-0 z-20 flex gap-1 bg-background border border-border rounded-lg p-2 shadow-lg w-64">
            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className="flex-1 text-xs border border-border rounded px-2 py-1 outline-none focus:border-primary" onKeyDown={e => { if (e.key === "Enter") { editor.chain().focus().setLink({ href: linkUrl }).run(); setLinkUrl(""); setShowLink(false); }}} />
            <button onClick={() => { editor.chain().focus().setLink({ href: linkUrl }).run(); setLinkUrl(""); setShowLink(false); }} className="text-xs bg-primary text-white px-2 rounded">Add</button>
          </div>
        )}
      </div>
      <div className="relative">
        <TB onClick={() => setShowImg(p => !p)} title="Image"><ImageIcon className="h-4 w-4" /></TB>
        {showImg && (
          <div className="absolute top-8 left-0 z-20 flex gap-1 bg-background border border-border rounded-lg p-2 shadow-lg w-72">
            <input value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="Image URL..." className="flex-1 text-xs border border-border rounded px-2 py-1 outline-none focus:border-primary" onKeyDown={e => { if (e.key === "Enter") { editor.chain().focus().setImage({ src: imgUrl }).run(); setImgUrl(""); setShowImg(false); }}} />
            <button onClick={() => { editor.chain().focus().setImage({ src: imgUrl }).run(); setImgUrl(""); setShowImg(false); }} className="text-xs bg-primary text-white px-2 rounded">Add</button>
          </div>
        )}
      </div>
      <Sep />
      <TB onClick={() => insertCallout(editor, "purple")} title="Purple Key Fact Box">
        <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded">KEY</span>
      </TB>
      <TB onClick={() => insertCallout(editor, "gold")} title="Gold Tip Box">
        <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">TIP</span>
      </TB>
      <TB onClick={() => insertCallout(editor, "quote")} title="Quote / Proverb Block">
        <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">"Q"</span>
      </TB>
      <TB onClick={() => insertCallout(editor, "hr")} title="Gradient Divider">
        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">──</span>
      </TB>
    </div>
  );
}

function PostForm({ post, onSave, onCancel }: { post: Partial<BlogPost>; onSave: (p: Partial<BlogPost>) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<Partial<BlogPost>>(post);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit, Underline, Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: "Start writing your article here..." }),
      CharacterCount,
    ],
    content: form.content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setForm(f => ({ ...f, content: html, read_time: estimateReadTime(html) }));
    },
  });

  const set = (k: keyof BlogPost, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (publish = false) => {
    if (!form.title || !form.content) {
      toast({ title: "Title and content required", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      await onSave({ ...form, published: publish, published_at: publish ? new Date().toISOString() : form.published_at });
      toast({ title: publish ? "Published!" : "Draft saved" });
    } catch (e: unknown) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !(form.tags || []).includes(t)) set("tags", [...(form.tags || []), t]);
    setTagInput("");
  };

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      {/* Editor */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto pr-2">
        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))}
          placeholder="Article title..." className="w-full text-2xl font-bold border-none outline-none bg-transparent placeholder:text-muted-foreground/40 py-2" />
        <div className="h-px bg-border" />
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">vibelinkevent.com/blog/</span>
          <input value={form.slug} onChange={e => set("slug", slugify(e.target.value))}
            className="flex-1 border border-border rounded px-2 py-1 outline-none focus:border-primary bg-background" />
        </div>
        <div className="border border-border rounded-xl overflow-hidden flex flex-col min-h-[500px]">
          {!preview ? (
            <>
              <Toolbar editor={editor} />
              <EditorContent editor={editor} className="flex-1 p-6 prose prose-sm max-w-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]" />
              {editor && (
                <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground flex justify-between bg-muted/20">
                  <span>{editor.storage.characterCount?.words()} words · {form.read_time}</span>
                  <button onClick={() => setPreview(true)} className="flex items-center gap-1 hover:text-foreground"><Eye className="h-3.5 w-3.5" /> Preview</button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between px-6 py-3 border-b border-border bg-muted/20">
                <span className="text-sm font-medium">Preview</span>
                <button onClick={() => setPreview(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><EyeOff className="h-3.5 w-3.5" /> Edit</button>
              </div>
              <div className="p-6 prose prose-sm max-w-none overflow-y-auto" dangerouslySetInnerHTML={{ __html: form.content || "" }} />
            </>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
        {/* Publish */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Publish</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${form.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{form.published ? "LIVE" : "DRAFT"}</span>
          </div>
          <Button onClick={() => handleSave(false)} variant="outline" size="sm" className="w-full" disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Save className="h-3.5 w-3.5 mr-2" />}Save Draft
          </Button>
          <Button onClick={() => handleSave(true)} size="sm" className="w-full" disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Globe className="h-3.5 w-3.5 mr-2" />}
            {form.published ? "Update Live" : "Publish Now"}
          </Button>
          <Button onClick={onCancel} variant="ghost" size="sm" className="w-full text-muted-foreground">Cancel</Button>
        </div>

        {/* Details */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold">Details</h3>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Category</Label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:border-primary">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Author</Label>
            <Input value={form.author_name} onChange={e => set("author_name", e.target.value)} className="text-sm" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Read Time</Label>
            <Input value={form.read_time} onChange={e => set("read_time", e.target.value)} className="text-sm" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Featured</Label>
            <button onClick={() => set("featured", !form.featured)} className={`w-10 h-5 rounded-full relative transition-colors ${form.featured ? "bg-primary" : "bg-muted-foreground/30"}`}>
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold">Featured Image</h3>
          <Input value={form.image_url} onChange={e => set("image_url", e.target.value)} placeholder="https://images.unsplash.com/..." className="text-xs" />
          {form.image_url && <img src={form.image_url} alt="" className="w-full aspect-video object-cover rounded-lg border border-border" />}
        </div>

        {/* Excerpt */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold">Excerpt</h3>
          <Textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)} placeholder="2-sentence summary..." className="text-sm resize-none" rows={3} maxLength={200} />
          <p className="text-xs text-muted-foreground text-right">{(form.excerpt || "").length}/200</p>
        </div>

        {/* Tags */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold">Tags</h3>
          <div className="flex gap-1.5">
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}} placeholder="Add tag + Enter" className="flex-1 text-xs border border-border rounded px-2 py-1.5 outline-none focus:border-primary bg-background" />
            <button onClick={addTag} className="px-2 py-1.5 bg-primary text-white text-xs rounded">+</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(form.tags || []).map(t => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary/15 text-secondary text-xs rounded-full">
                #{t}<button onClick={() => set("tags", (form.tags || []).filter(x => x !== t))}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold">SEO</h3>
          <Textarea value={form.meta_description || ""} onChange={e => set("meta_description", e.target.value)} placeholder="Meta description (max 160)..." className="text-xs resize-none" rows={2} maxLength={160} />
          <p className="text-xs text-muted-foreground text-right">{(form.meta_description || "").length}/160</p>
          <Input value={form.focus_keyword || ""} onChange={e => set("focus_keyword", e.target.value)} placeholder="Focus keyword..." className="text-xs" />
        </div>
      </div>
    </div>
  );
}

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editPost, setEditPost] = useState<Partial<BlogPost> | null>(null);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const savePost = async (p: Partial<BlogPost>) => {
    const now = new Date().toISOString();
    if (p.id) {
      const { error } = await supabase.from("blog_posts").update({ ...p, updated_at: now }).eq("id", p.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("blog_posts").insert([{ ...p, created_at: now, updated_at: now }]);
      if (error) throw error;
    }
    await fetchPosts();
    setView("list");
  };

  const deletePost = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchPosts(); }
    setDeleting(null);
  };

  const togglePublish = async (post: BlogPost) => {
    await supabase.from("blog_posts").update({ published: !post.published, published_at: !post.published ? new Date().toISOString() : post.published_at }).eq("id", post.id);
    fetchPosts();
  };

  const filtered = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  if (view !== "list") {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 mb-4 text-sm flex-shrink-0">
          <button onClick={() => setView("list")} className="text-muted-foreground hover:text-foreground">← Blog Posts</button>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{view === "create" ? "New Article" : "Edit Article"}</span>
        </div>
        <div className="flex-1 min-h-0">
          <PostForm post={editPost || emptyPost()} onSave={savePost} onCancel={() => setView("list")} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Manager</h2>
          <p className="text-muted-foreground text-sm mt-1">{posts.length} articles · {posts.filter(p => p.published).length} published · {posts.filter(p => p.featured).length} featured</p>
        </div>
        <div className="flex items-center gap-2">
          <BlogBulkImport onComplete={fetchPosts} />
          <Button onClick={() => { setEditPost(null); setView("create"); }} className="gap-2">
            <PlusCircle className="h-4 w-4" /> New Article
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm outline-none focus:border-primary" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[{ label: "Total", v: posts.length, c: "text-primary" }, { label: "Published", v: posts.filter(p => p.published).length, c: "text-green-600" }, { label: "Drafts", v: posts.filter(p => !p.published).length, c: "text-yellow-600" }, { label: "Featured", v: posts.filter(p => p.featured).length, c: "text-secondary" }].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase">Article</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase w-36">Category</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase w-24">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase w-20">Featured</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <AnimatePresence>
                {filtered.map(post => (
                  <motion.tr key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {post.image_url && <img src={post.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                        <div>
                          <div className="font-medium text-sm line-clamp-1">{post.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <Clock className="h-3 w-3" />{post.read_time} · {new Date(post.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{post.category}</span></td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => togglePublish(post)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${post.published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"}`}>
                        {post.published ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {post.published ? "Live" : "Draft"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={async () => { await supabase.from("blog_posts").update({ featured: !post.featured }).eq("id", post.id); fetchPosts(); }}>
                        <Star className={`h-4 w-4 transition-colors ${post.featured ? "fill-secondary text-secondary" : "text-muted-foreground hover:text-secondary"}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><ExternalLink className="h-3.5 w-3.5" /></a>
                        <button onClick={() => { setEditPost(post); setView("edit"); }} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deletePost(post.id)} disabled={deleting === post.id} className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                          {deleting === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-3 opacity-40" /><p className="text-sm">No articles found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
