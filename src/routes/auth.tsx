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

// Password strength checker
function getPasswordStrength(password: string) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return Math.min(strength, 5);
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const strengthLabels = ["Sangat Lemah", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
  
  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded ${i < strength ? strengthColors[strength - 1] : "bg-muted"}`} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Kekuatan: {strengthLabels[Math.max(0, strength - 1)]}</p>
    </div>
  );
}

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
        // Warn if password might be weak
        const strength = getPasswordStrength(password);
        if (strength < 2) {
          toast.warning("Password terlalu lemah. Coba tambah huruf besar, angka, dan simbol.");
          setBusy(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/admin`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) {
          // Handle weak password error
          if (error.message.includes("weak") || error.message.includes("guess")) {
            toast.error("Password masih dianggap lemah. Coba: MyP@ssw0rd2026! atau kombinasi yang lebih unik.");
          } else {
            throw error;
          }
        } else {
          toast.success("Akun dibuat. Anda sekarang masuk.");
        }
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
            <Input 
              id="password" 
              type="password" 
              required 
              minLength={8}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder={mode === "signup" ? "Min 8 karakter" : ""}
            />
            {mode === "signup" && (
              <>
                <PasswordStrengthIndicator password={password} />
                <div className="mt-3 p-3 bg-muted rounded-lg text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">💡 Saran password yang kuat:</p>
                  <p>✓ Campur huruf besar & kecil (A-Z, a-z)</p>
                  <p>✓ Tambah angka & simbol (!@#$%)</p>
                  <p>✓ Minimal 12 karakter</p>
                  <p>✓ Hindarkan: nama, tanggal lahir, email</p>
                  <p className="font-semibold text-foreground mt-2">Contoh: MyP@ssw0rd2026!</p>
                </div>
              </>
            )}
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
