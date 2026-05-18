import { createFileRoute, useNavigate, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllCategories, slugify, fetchArticleById, createArticle, updateArticle } from "@/integrations/sqlite";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/articles/$id")({
  component: ArticleEditor,
});

function ArticleEditor() {
  const { id } = useParams({ from: "/admin/articles/$id" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === "new";

  const { data: categories = [] } = useQuery({ queryKey: ["categories", "all"], queryFn: fetchAllCategories });

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isTrending, setIsTrending] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data, error } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
      if (error) toast.error(error.message);
      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setExcerpt(data.excerpt ?? "");
        setContent(data.content ?? "");
        setCoverImage(data.cover_image ?? "");
        setCategoryId(data.category_id ?? "");
        setStatus(data.status as "draft" | "published");
        setIsTrending(data.is_trending);
      }
      setLoading(false);
    })();
  }, [id, isNew]);

  const onTitleChange = (v: string) => {
    setTitle(v);
    if (isNew && (!slug || slug === slugify(title))) setSlug(slugify(v));
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("article-images").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("article-images").getPublicUrl(path);
      setCoverImage(data.publicUrl);
      toast.success("Gambar diunggah");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal unggah");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (publishNow?: boolean) => {
    if (!title.trim()) { toast.error("Judul wajib diisi"); return; }
    if (!slug.trim()) { toast.error("Slug wajib diisi"); return; }
    setSaving(true);
    try {
      const finalStatus = publishNow ? "published" : status;
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content,
        cover_image: coverImage || null,
        category_id: categoryId || null,
        status: finalStatus,
        is_trending: isTrending,
        author_id: user!.id,
        published_at: finalStatus === "published" ? new Date().toISOString() : null,
      };
      if (isNew) {
        const { data, error } = await supabase.from("articles").insert(payload).select("id").single();
        if (error) throw error;
        toast.success("Artikel dibuat");
        navigate({ to: "/admin/articles/$id", params: { id: data.id } });
      } else {
        const { error } = await supabase.from("articles").update(payload).eq("id", id);
        if (error) throw error;
        toast.success("Artikel disimpan");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Memuat…</p>;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/admin/articles" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Kembali
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave()} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}Simpan Draf
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>Publish</Button>
        </div>
      </div>

      <h1 className="font-serif text-3xl font-bold">{isNew ? "Tulis Artikel Baru" : "Edit Artikel"}</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Judul artikel" className="text-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug URL</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="contoh-judul-artikel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Ringkasan</Label>
            <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Ringkasan singkat untuk preview" rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Konten</Label>
            <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Tulis isi artikel di sini…" rows={20} className="font-serif" />
            <p className="text-xs text-muted-foreground">Pisahkan paragraf dengan baris kosong.</p>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="bg-background border rounded-xl p-4 space-y-3">
            <Label>Gambar Cover</Label>
            {coverImage && <img src={coverImage} alt="cover" className="w-full rounded-md aspect-video object-cover" />}
            <label className="block">
              <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
              <span className={`flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed rounded-md text-sm cursor-pointer hover:bg-muted ${uploading ? "opacity-50" : ""}`}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Mengunggah…" : "Unggah gambar"}
              </span>
            </label>
            <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="atau tempel URL" />
          </div>

          <div className="bg-background border rounded-xl p-4 space-y-3">
            <Label htmlFor="cat">Kategori</Label>
            <select id="cat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
              <option value="">— Pilih —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>

            <Label htmlFor="status">Status</Label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
              <option value="draft">Draf</option>
              <option value="published">Published</option>
            </select>

            <label className="flex items-center gap-2 text-sm cursor-pointer pt-2">
              <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} />
              Tampilkan di Trending
            </label>
          </div>
        </aside>
      </div>
    </div>
  );
}
