import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllArticles, updateArticle, deleteArticle } from "@/integrations/sqlite";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, EyeOff, Flame } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/admin/articles/")({
  component: AdminArticles,
});

function AdminArticles() {
  const qc = useQueryClient();
  const { data: articles = [], isLoading } = useQuery({ queryKey: ["admin", "articles"], queryFn: () => fetchAllArticles() });

  const togglePublish = useMutation({
    mutationFn: async (a: { id: string; status: string }) => {
      const newStatus: "draft" | "published" = a.status === "published" ? "draft" : "published";
      const published_at = newStatus === "published" ? new Date().toISOString() : null;
      updateArticle(a.id, { status: newStatus, published_at });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Status diperbarui");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleTrending = useMutation({
    mutationFn: async (a: { id: string; is_trending: boolean }) => {
      updateArticle(a.id, { is_trending: !a.is_trending });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      deleteArticle(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Artikel dihapus");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Artikel</h1>
          <p className="text-muted-foreground text-sm">Kelola semua artikel berita</p>
        </div>
        <Link to="/admin/articles/new">
          <Button><Plus className="h-4 w-4" />Tulis Baru</Button>
        </Link>
      </div>

      <div className="bg-background border rounded-xl overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-muted-foreground">Memuat…</p>
        ) : articles.length === 0 ? (
          <p className="p-6 text-muted-foreground">Belum ada artikel. Klik "Tulis Baru".</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3">Judul</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Views</th>
                  <th className="p-3">Diubah</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => {
                  const cats = a.categories as { label?: string } | null;
                  return (
                  <tr key={a.id} className="border-t hover:bg-muted/30">
                    <td className="p-3 max-w-xs">
                      <p className="font-medium line-clamp-1">{a.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">/{a.slug}</p>
                    </td>
                    <td className="p-3">{cats?.label ?? "-"}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        a.status === "published" ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
                      }`}>{a.status}</span>
                      {a.is_trending && <span className="ml-1 inline-block px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">trending</span>}
                    </td>
                    <td className="p-3">{a.views_count}</td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: idLocale })}
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => toggleTrending.mutate({ id: a.id, is_trending: a.is_trending })} title="Toggle trending">
                          <Flame className={`h-4 w-4 ${a.is_trending ? "text-orange-500" : ""}`} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => togglePublish.mutate({ id: a.id, status: a.status })} title="Toggle publish">
                          {a.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Link to="/admin/articles/$id" params={{ id: a.id }}>
                          <Button size="sm" variant="ghost"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => { if (confirm("Hapus artikel?")) remove.mutate(a.id); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
