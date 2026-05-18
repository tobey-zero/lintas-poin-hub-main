import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Eye, Tags, Megaphone } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

async function fetchStats() {
  const [arts, cats, ticker, top] = await Promise.all([
    supabase.from("articles").select("id,status,views_count"),
    supabase.from("categories").select("id"),
    supabase.from("breaking_news").select("id,is_active"),
    supabase.from("articles").select("id,title,views_count,slug").eq("status", "published").order("views_count", { ascending: false }).limit(5),
  ]);
  const articles = arts.data ?? [];
  return {
    totalArticles: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    drafts: articles.filter((a) => a.status === "draft").length,
    totalViews: articles.reduce((s, a) => s + (a.views_count ?? 0), 0),
    categories: cats.data?.length ?? 0,
    activeTicker: (ticker.data ?? []).filter((t) => t.is_active).length,
    top: top.data ?? [],
  };
}

function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "stats"], queryFn: fetchStats });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan situs Lintas Poin</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Artikel" value={data?.totalArticles ?? 0} hint={`${data?.published ?? 0} publish · ${data?.drafts ?? 0} draf`} />
        <StatCard icon={Eye} label="Total Views" value={data?.totalViews ?? 0} />
        <StatCard icon={Tags} label="Kategori" value={data?.categories ?? 0} />
        <StatCard icon={Megaphone} label="Ticker Aktif" value={data?.activeTicker ?? 0} />
      </div>

      <div className="bg-background rounded-xl border p-5">
        <h2 className="font-semibold mb-4">Artikel Terpopuler</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Memuat…</p>
        ) : data?.top.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada artikel diterbitkan.</p>
        ) : (
          <ul className="divide-y">
            {data?.top.map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-4">
                <Link to="/berita/$slug" params={{ slug: a.slug }} className="font-medium hover:text-primary line-clamp-1">{a.title}</Link>
                <span className="text-sm text-muted-foreground flex items-center gap-1 shrink-0"><Eye className="h-3 w-3" />{a.views_count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/admin/articles" className="bg-background border rounded-xl p-5 hover:border-primary transition">
          <h3 className="font-semibold">+ Tulis Artikel Baru</h3>
          <p className="text-sm text-muted-foreground mt-1">Posting berita dengan editor lengkap.</p>
        </Link>
        <Link to="/admin/categories" className="bg-background border rounded-xl p-5 hover:border-primary transition">
          <h3 className="font-semibold">Kelola Menu Navigasi</h3>
          <p className="text-sm text-muted-foreground mt-1">Tambah, urutkan, atau sembunyikan kategori.</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint }: { icon: React.ElementType; label: string; value: number; hint?: string }) {
  return (
    <div className="bg-background border rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="font-display text-3xl mt-2">{value.toLocaleString("id-ID")}</p>
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
