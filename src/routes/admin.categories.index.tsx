import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllCategories, slugify, createCategory, updateCategory, deleteCategory } from "@/integrations/sqlite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories/")({
  component: AdminCategories,
});

function AdminCategories() {
  const qc = useQueryClient();
  const { data: cats = [] } = useQuery({ queryKey: ["categories", "all"], queryFn: fetchAllCategories });
  const [newLabel, setNewLabel] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["categories"] });
  };

  const add = useMutation({
    mutationFn: async (label: string) => {
      const slug = slugify(label);
      if (!slug) throw new Error("Label tidak valid");
      const maxOrder = Math.max(0, ...cats.map((c) => c.sort_order));
      const { error } = await supabase.from("categories").insert({ label: label.trim(), slug, sort_order: maxOrder + 1 });
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); setNewLabel(""); toast.success("Kategori ditambahkan"); },
    onError: (e: Error) => toast.error(e.message),
  });

  type CatPatch = Partial<{ label: string; slug: string; sort_order: number; is_active: boolean }>;
  const update = useMutation({
    mutationFn: async (c: { id: string; patch: CatPatch }) => {
      const { error } = await supabase.from("categories").update(c.patch).eq("id", c.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Kategori dihapus"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const move = (idx: number, dir: -1 | 1) => {
    const a = cats[idx];
    const b = cats[idx + dir];
    if (!a || !b) return;
    update.mutate({ id: a.id, patch: { sort_order: b.sort_order } });
    update.mutate({ id: b.id, patch: { sort_order: a.sort_order } });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl font-bold">Kategori / Menu</h1>
        <p className="text-muted-foreground text-sm">Tambah, urutkan, dan aktifkan kategori navigasi.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (newLabel.trim()) add.mutate(newLabel); }} className="flex gap-2">
        <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Nama kategori baru, contoh: Politik" />
        <Button type="submit" disabled={add.isPending}><Plus className="h-4 w-4" />Tambah</Button>
      </form>

      <div className="bg-background border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 w-12">#</th>
              <th className="p-3">Label</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c, i) => (
              <tr key={c.id} className="border-t">
                <td className="p-3 text-muted-foreground">{i + 1}</td>
                <td className="p-3">
                  <Input
                    defaultValue={c.label}
                    onBlur={(e) => { if (e.target.value !== c.label) update.mutate({ id: c.id, patch: { label: e.target.value } }); }}
                    className="h-8"
                  />
                </td>
                <td className="p-3 text-muted-foreground text-xs">/{c.slug}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${c.is_active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                    {c.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === cats.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: c.id, patch: { is_active: !c.is_active } })}>
                      {c.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm("Hapus kategori? Artikel terkait akan kehilangan kategori.")) remove.mutate(c.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {cats.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Belum ada kategori.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
