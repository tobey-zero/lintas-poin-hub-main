import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, Tags, Megaphone, Settings, LogOut, Home } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Lintas Poin" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isStaff, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat…</div>;
  }
  if (!isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-center">
        <div>
          <h1 className="font-serif text-2xl font-bold">Akses ditolak</h1>
          <p className="text-muted-foreground mt-2">Akun Anda bukan staf redaksi.</p>
          <Link to="/" className="inline-block mt-4 text-primary hover:underline">Kembali ke beranda</Link>
        </div>
      </div>
    );
  }

  const nav = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/articles", label: "Artikel", icon: FileText },
    { to: "/admin/categories", label: "Kategori / Menu", icon: Tags },
    { to: "/admin/breaking", label: "Breaking News", icon: Megaphone },
    { to: "/admin/settings", label: "Pengaturan", icon: Settings },
  ];

  const isActive = (to: string, end?: boolean) => (end ? path === to : path.startsWith(to));

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-60 bg-background border-r flex-col hidden md:flex">
        <div className="p-4 border-b">
          <Link to="/" className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground font-display text-xl px-2 py-1">LP</span>
            <span className="font-semibold">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                isActive(n.to, n.end) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t space-y-2">
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><Home className="h-3 w-3" />Lihat situs</Link>
          <Button variant="outline" size="sm" className="w-full" onClick={() => signOut().then(() => navigate({ to: "/" }))}>
            <LogOut className="h-4 w-4" />Keluar
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-background border-b px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="md:hidden flex gap-2 overflow-x-auto">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className={`text-xs whitespace-nowrap px-2 py-1 rounded ${isActive(n.to, n.end) ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {n.label}
              </Link>
            ))}
          </div>
          <div className="ml-auto text-xs text-muted-foreground truncate">{user.email}</div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
