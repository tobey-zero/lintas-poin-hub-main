import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ArticleCard } from "@/components/site/ArticleCard";
import {
  fetchArticleBySlug,
  fetchPublishedArticles,
  incrementArticleView,
} from "@/integrations/sqlite";
import { Clock, Share2, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/berita/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params?.slug ?? "Berita"} — Lintas Poin` },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: article, isLoading } = useQuery({
    queryKey: ["article", slug],
    queryFn: () => fetchArticleBySlug(slug),
  });
  const { data: all = [] } = useQuery({ queryKey: ["articles", "published"], queryFn: () => fetchPublishedArticles(60) });

  useEffect(() => {
    if (article?.id) incrementArticleView(article.id);
  }, [article?.id]);

  if (isLoading) {
    return <SiteLayout><div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Memuat…</div></SiteLayout>;
  }
  if (!article) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold">Berita tidak ditemukan</h1>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">Kembali ke beranda</Link>
        </div>
      </SiteLayout>
    );
  }

  const related = all.filter((a) => a.categories?.slug === article.categories?.slug && a.id !== article.id).slice(0, 4);
  const author = article.profiles?.display_name ?? "Redaksi";
  const when = article.published_at
    ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true, locale: idLocale })
    : "";

  return (
    <SiteLayout>
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {article.categories && (
          <Link
            to="/kategori/$slug"
            params={{ slug: article.categories.slug }}
            className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
          >
            {article.categories.label}
          </Link>
        )}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 leading-tight text-foreground">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 py-4 border-y">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              {author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{author}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />{when} · {article.views_count} kali dibaca
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-muted" aria-label="Simpan"><Bookmark className="h-4 w-4" /></button>
            <button className="p-2 rounded-full hover:bg-muted" aria-label="Bagikan"
              onClick={() => navigator.share?.({ title: article.title, url: window.location.href }).catch(() => {})}>
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {article.cover_image && (
          <img src={article.cover_image} alt={article.title} className="w-full rounded-lg my-6 aspect-[16/9] object-cover" />
        )}

        <div className="prose prose-lg max-w-none font-serif text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h3 className="font-display text-2xl border-b-2 border-primary pb-2 mb-5">Berita Terkait</h3>
            <div className="grid sm:grid-cols-2 gap-5">
              {related.map((a) => <ArticleCard key={a.id} article={a} variant="default" />)}
            </div>
          </section>
        )}
      </article>
    </SiteLayout>
  );
}
