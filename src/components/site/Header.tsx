import { Link } from "@tanstack/react-router";
import { Search, Menu, X, LogIn, Settings } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchActiveCategories, fetchActiveBreakingNews, fetchSiteSettings } from "@/integrations/sqlite";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const [open, setOpen] = useState(false);
  const { isStaff, user } = useAuth();
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const { data: categories = [] } = useQuery({ queryKey: ["categories", "active"], queryFn: fetchActiveCategories });
  const { data: ticker = [] } = useQuery({ queryKey: ["breaking", "active"], queryFn: fetchActiveBreakingNews });
  const { data: settings } = useQuery({ queryKey: ["site_settings"], queryFn: fetchSiteSettings });

  const siteName = settings?.site_name ?? "Lintas Poin";

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="bg-brand-bar text-brand-bar-foreground text-xs">
        <div className="container mx-auto px-4 flex items-center justify-between h-8">
          <span className="opacity-80">{today}</span>
          <div className="flex items-center gap-4 opacity-80">
            {isStaff && (
              <Link to="/admin" className="flex items-center gap-1 hover:opacity-100"><Settings className="h-3 w-3" />Admin</Link>
            )}
            {!user ? (
              <Link to="/auth" className="flex items-center gap-1 hover:opacity-100"><LogIn className="h-3 w-3" />Masuk</Link>
            ) : (
              <span className="hidden sm:inline opacity-80">{user.email}</span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 flex items-center justify-between py-4 gap-4">
        <Link to="/" className="flex items-center gap-2">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={siteName} className="h-10 sm:h-12 w-auto object-contain" />
          ) : (
            <>
              <span className="bg-primary text-primary-foreground font-display text-3xl px-3 py-1 leading-none">LINTAS</span>
              <span className="font-display text-3xl text-foreground leading-none">POIN</span>
            </>
          )}
        </Link>
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari berita..."
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <nav className="bg-brand-bar text-brand-bar-foreground">
        <div className="container mx-auto px-4">
          <ul className="hidden md:flex items-center gap-1 overflow-x-auto">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  to="/kategori/$slug"
                  params={{ slug: c.slug }}
                  activeProps={{ className: "bg-primary text-primary-foreground" }}
                  className="block px-4 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-primary/80 transition-colors"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
          {open && (
            <ul className="md:hidden flex flex-col py-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/kategori/$slug"
                    params={{ slug: c.slug }}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-primary/80"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {ticker.length > 0 && (
        <div className="bg-accent border-b overflow-hidden">
          <div className="container mx-auto px-4 flex items-center gap-3 h-9">
            <span className="bg-breaking text-primary-foreground text-xs font-bold px-2 py-1 uppercase shrink-0">Breaking</span>
            <div className="flex-1 overflow-hidden">
              <div className="flex gap-12 whitespace-nowrap animate-ticker text-sm">
                {[...ticker, ...ticker].map((h, i) => (
                  <span key={i} className="text-foreground/80">• {h.headline}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
