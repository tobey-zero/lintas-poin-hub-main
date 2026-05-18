import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSiteSettings, updateSiteSettings } from "@/integrations/sqlite";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings/")({
  component: AdminSettings,
});

function AdminSettings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: s } = useQuery({ queryKey: ["site_settings"], queryFn: fetchSiteSettings });
  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (s) {
      setSiteName(s.site_name);
      setTagline(s.tagline ?? "");
      setLogoUrl(s.logo_url ?? "");
    }
  }, [s]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user!.id}/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("site-assets").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      setLogoUrl(data.publicUrl);
      toast.success("Logo diunggah, klik Simpan untuk menerapkan");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal unggah");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("site_settings").update({
        site_name: siteName,
        tagline: tagline || null,
        logo_url: logoUrl || null,
        updated_at: new Date().toISOString(),
      }).eq("id", 1);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("Pengaturan disimpan");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl font-bold">Pengaturan Situs</h1>
        <p className="text-muted-foreground text-sm">Logo, nama, dan tagline.</p>
      </div>

      <div className="bg-background border rounded-xl p-5 space-y-4">
        <div className="space-y-2">
          <Label>Logo</Label>
          {logoUrl && (
            <div className="bg-muted rounded-md p-4 flex items-center justify-center">
              <img src={logoUrl} alt="logo" className="max-h-20 object-contain" />
            </div>
          )}
          <label className="block">
            <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
            <span className={`flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed rounded-md text-sm cursor-pointer hover:bg-muted ${uploading ? "opacity-50" : ""}`}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Mengunggah…" : "Unggah logo (PNG/SVG transparan)"}
            </span>
          </label>
          <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="atau tempel URL" />
          {logoUrl && <Button variant="ghost" size="sm" onClick={() => setLogoUrl("")}>Hapus logo (kembali ke teks)</Button>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nama Situs</Label>
          <Input id="name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tag">Tagline</Label>
          <Input id="tag" value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}Simpan
        </Button>
      </div>
    </div>
  );
}
