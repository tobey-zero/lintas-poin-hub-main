import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArticleCard } from "@/components/site/ArticleCard";
import { fetchActiveCategories, fetchArticlesByCategory } from "@/integrations/sqlite";

export const Route = createFileRoute("/kategori/$slug")({
  head: ({ params }) => {
    const slug = params?.slug ?? "";
    const label = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
      meta: [
        { title: `${label} — Lintas Poin` },
        { name: "description", content: `Berita terbaru kategori ${label} di Lintas Poin.` },
        { property: "og:title", content: `${label} — Lintas Poin` },
        { property: "og:description", content: `Berita terbaru kategori ${label}.` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: categories = [] } = useQuery({ queryKey: ["categories", "active"], queryFn: fetchActiveCategories });
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["articles", "category", slug],
    queryFn: () => fetchArticlesByCategory(slug),
  });
  const cat = categories.find((c) => c.slug === slug);
  const label = cat?.label ?? slug;

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="border-b-2 border-primary pb-3 mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Kategori</p>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground">{label}</h1>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground py-10 text-center">Memuat…</p>
        ) : articles.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center">Belum ada berita di kategori ini.</p>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {articles.map((a) => <ArticleCard key={a.id} article={a} variant="list" />)}
            </div>
            <aside>
              <h3 className="font-display text-xl border-b-2 border-primary pb-2 mb-4">Kategori Lain</h3>
              <div className="flex flex-wrap gap-2">
                {categories.filter((c) => c.slug !== slug).map((c) => (
                  <Link
                    key={c.id}
                    to="/kategori/$slug"
                    params={{ slug: c.slug }}
                    className="px-3 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full text-xs font-semibold transition-colors"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
