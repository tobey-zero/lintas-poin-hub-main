import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchActiveCategories, fetchSiteSettings } from "@/integrations/sqlite";

export function Footer() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories", "active"], queryFn: fetchActiveCategories });
  const { data: settings } = useQuery({ queryKey: ["site_settings"], queryFn: fetchSiteSettings });
  const half = Math.ceil(categories.length / 2);
  const left = categories.slice(0, half);
  const right = categories.slice(half);

  return (
    <footer className="bg-brand-bar text-brand-bar-foreground mt-16">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt={settings.site_name} className="h-10 w-auto object-contain bg-white/5 p-1 rounded" />
            ) : (
              <>
                <span className="bg-primary text-primary-foreground font-display text-2xl px-2 py-1 leading-none">LINTAS</span>
                <span className="font-display text-2xl leading-none">POIN</span>
              </>
            )}
          </div>
          <p className="text-sm opacity-70">
            {settings?.tagline ?? "Portal berita terpercaya dengan informasi terkini dari seluruh penjuru Indonesia dan dunia."}
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-sm">Kategori</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {left.map((c) => (
              <li key={c.id}>
                <Link to="/kategori/$slug" params={{ slug: c.slug }} className="hover:opacity-100 hover:text-primary">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-sm">Lainnya</h4>
          <ul className="space-y-2 text-sm opacity-80">
            {right.map((c) => (
              <li key={c.id}>
                <Link to="/kategori/$slug" params={{ slug: c.slug }} className="hover:opacity-100 hover:text-primary">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-sm">Newsletter</h4>
          <p className="text-sm opacity-70 mb-3">Dapatkan ringkasan berita harian langsung di email Anda.</p>
          <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email" className="flex-1 px-3 py-2 rounded text-foreground text-sm bg-background" />
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-semibold hover:bg-primary/90">Daftar</button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-xs opacity-60 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} {settings?.site_name ?? "Lintas Poin"}. Semua hak dilindungi.</span>
          <span>Dibuat dengan jurnalistik berintegritas.</span>
        </div>
      </div>
    </footer>
  );
}
