import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Masuk — Lintas Poin" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/admin" });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/admin`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Akun dibuat. Anda sekarang masuk.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Berhasil masuk");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-background rounded-xl shadow-lg p-8 border">
        <Link to="/" className="block text-center mb-6">
          <span className="bg-primary text-primary-foreground font-display text-2xl px-2 py-1">LINTAS</span>
          <span className="font-display text-2xl ml-1">POIN</span>
        </Link>
        <h1 className="font-serif text-2xl font-bold text-center mb-2">
          {mode === "signin" ? "Masuk" : "Daftar Akun"}
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          {mode === "signin" ? "Masuk ke panel redaksi" : "Buat akun baru"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nama Tampilan</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Memproses…" : mode === "signin" ? "Masuk" : "Daftar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "signin" ? (
            <>Belum punya akun?{" "}
              <button onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">Daftar</button>
            </>
          ) : (
            <>Sudah punya akun?{" "}
              <button onClick={() => setMode("signin")} className="text-primary font-semibold hover:underline">Masuk</button>
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Pengguna pertama yang mendaftar otomatis menjadi admin.
        </p>
      </div>
    </div>
  );
}
