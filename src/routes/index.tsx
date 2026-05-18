import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArticleCard } from "@/components/site/ArticleCard";
import { fetchActiveCategories, fetchPublishedArticles } from "@/integrations/sqlite";
import { TrendingUp, Flame } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lintas Poin — Portal Berita Terkini Indonesia" },
      { name: "description", content: "Berita terkini dan terpercaya dari Indonesia dan dunia: politik, ekonomi, olahraga, teknologi, hiburan, dan lifestyle." },
      { property: "og:title", content: "Lintas Poin — Portal Berita Terkini Indonesia" },
      { property: "og:description", content: "Berita terkini dan terpercaya dari Indonesia dan dunia." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: articles = [], isLoading } = useQuery({ queryKey: ["articles", "published"], queryFn: () => fetchPublishedArticles(60) });
  const { data: categories = [] } = useQuery({ queryKey: ["categories", "active"], queryFn: fetchActiveCategories });

  const hero = articles[0];
  const sideTop = articles.slice(1, 3);
  const trending = articles.filter((a) => a.is_trending).slice(0, 4);
  const byCat = (slug: string) => articles.filter((a) => a.categories?.slug === slug);

  return (
    <SiteLayout>
      {isLoading && (
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Memuat berita…</div>
      )}

      {!isLoading && articles.length === 0 && (
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="font-serif text-2xl font-bold">Belum ada artikel diterbitkan</h2>
          <p className="text-muted-foreground mt-2">Masuk sebagai admin untuk mulai memposting berita.</p>
          <Link to="/auth" className="inline-block mt-4 px-5 py-2 bg-primary text-primary-foreground rounded-md font-semibold">Masuk Admin</Link>
        </div>
      )}

      {hero && (
        <section className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><ArticleCard article={hero} variant="hero" /></div>
            <div className="flex flex-col gap-6">
              {sideTop.map((a) => <ArticleCard key={a.id} article={a} variant="large" />)}
            </div>
          </div>
        </section>
      )}

      {trending.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <SectionHeader icon={<Flame className="h-5 w-5" />} title="Trending" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.map((a) => <ArticleCard key={a.id} article={a} variant="default" />)}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SectionHeader title="Terbaru" />
            <div className="grid sm:grid-cols-2 gap-5">
              {articles.slice(0, 6).map((a) => <ArticleCard key={a.id} article={a} variant="default" />)}
            </div>
          </div>
          <aside>
            <SectionHeader icon={<TrendingUp className="h-5 w-5" />} title="Paling Populer" />
            <div className="space-y-4">
              {[...articles].sort((a, b) => b.views_count - a.views_count).slice(0, 6).map((a, i) => (
                <div key={a.id} className="flex gap-3 items-start">
                  <span className="font-display text-3xl text-primary leading-none w-8 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <ArticleCard article={a} variant="compact" />
                </div>
              ))}
            </div>
          </aside>
        </section>
      )}

      {categories.slice(0, 4).map((cat) => {
        const catArticles = byCat(cat.slug).slice(0, 4);
        if (catArticles.length === 0) return null;
        return (
          <section key={cat.id} className="container mx-auto px-4 py-8">
            <SectionHeader title={cat.label} categorySlug={cat.slug} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {catArticles.map((a) => <ArticleCard key={a.id} article={a} variant="default" />)}
            </div>
          </section>
        );
      })}

      <section className="container mx-auto px-4 py-10">
        <h3 className="font-serif text-2xl font-bold mb-4">Telusuri Semua Kategori</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/kategori/$slug"
              params={{ slug: c.slug }}
              className="px-4 py-2 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full text-sm font-semibold transition-colors"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function SectionHeader({ title, icon, categorySlug }: { title: string; icon?: React.ReactNode; categorySlug?: string }) {
  return (
    <div className="flex items-center justify-between border-b-2 border-primary mb-5 pb-2">
      <h2 className="font-display text-2xl flex items-center gap-2 text-foreground">
        {icon}{title}
      </h2>
      {categorySlug && (
        <Link to="/kategori/$slug" params={{ slug: categorySlug }} className="text-sm font-semibold text-primary hover:underline">
          Lihat semua →
        </Link>
      )}
    </div>
  );
}
