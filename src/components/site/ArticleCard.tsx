import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import type { Article } from "@/integrations/sqlite";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Variant = "hero" | "large" | "default" | "compact" | "list";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=80";

function timeAgo(iso: string | null) {
  if (!iso) return "";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: idLocale });
  } catch {
    return "";
  }
}

export function ArticleCard({ article, variant = "default" }: { article: Article; variant?: Variant }) {
  const img = article.cover_image || FALLBACK_IMG;
  const cat = article.categories?.label ?? "";
  const author = article.profiles?.display_name ?? "Redaksi";
  const when = timeAgo(article.published_at ?? article.created_at);

  return (
    <Link to="/berita/$slug" params={{ slug: article.slug }} className="block group">
      {variant === "hero" && (
        <div className="relative overflow-hidden rounded-lg news-card news-card-hover">
          <img src={img} alt={article.title} className="w-full h-[280px] sm:h-[420px] lg:h-[520px] object-cover group-hover:scale-105 transition-transform duration-500" width={1600} height={900} />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
            <CategoryBadge label={cat} />
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mt-3 leading-tight group-hover:text-primary transition-colors">
              {article.title}
            </h2>
            {article.excerpt && <p className="mt-3 text-sm sm:text-base opacity-90 line-clamp-2 max-w-3xl">{article.excerpt}</p>}
            <Meta author={author} when={when} light />
          </div>
        </div>
      )}

      {variant === "large" && (
        <article className="news-card news-card-hover rounded-lg overflow-hidden">
          <div className="aspect-[16/10] overflow-hidden">
            <img src={img} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" width={1024} height={640} />
          </div>
          <div className="p-5">
            <CategoryBadge label={cat} />
            <h3 className="font-serif text-xl font-bold mt-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
            {article.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>}
            <Meta author={author} when={when} />
          </div>
        </article>
      )}

      {variant === "default" && (
        <article className="news-card news-card-hover rounded-lg overflow-hidden h-full flex flex-col">
          <div className="aspect-[16/10] overflow-hidden">
            <img src={img} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" width={1024} height={640} />
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <CategoryBadge label={cat} />
            <h3 className="font-serif text-base font-bold mt-2 leading-snug group-hover:text-primary transition-colors line-clamp-3">
              {article.title}
            </h3>
            <div className="mt-auto pt-3"><Meta author={author} when={when} /></div>
          </div>
        </article>
      )}

      {variant === "compact" && (
        <article className="flex gap-3 group">
          <div className="w-24 h-24 shrink-0 overflow-hidden rounded">
            <img src={img} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          </div>
          <div className="flex-1 min-w-0">
            <CategoryBadge label={cat} />
            <h4 className="font-semibold text-sm mt-1 leading-snug group-hover:text-primary transition-colors line-clamp-3">
              {article.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">{when}</p>
          </div>
        </article>
      )}

      {variant === "list" && (
        <article className="flex flex-col sm:flex-row gap-4 py-5 border-b group">
          <div className="sm:w-64 sm:shrink-0 aspect-[16/10] overflow-hidden rounded-md">
            <img src={img} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          </div>
          <div className="flex-1">
            <CategoryBadge label={cat} />
            <h3 className="font-serif text-xl font-bold mt-2 leading-snug group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            {article.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>}
            <Meta author={author} when={when} />
          </div>
        </article>
      )}
    </Link>
  );
}

function CategoryBadge({ label }: { label: string }) {
  if (!label) return null;
  return (
    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-primary">
      {label}
    </span>
  );
}

function Meta({ author, when, light }: { author: string; when: string; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 mt-3 text-xs ${light ? "text-white/80" : "text-muted-foreground"}`}>
      <span>{author}</span>
      {when && <><span>•</span><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{when}</span></>}
    </div>
  );
}
