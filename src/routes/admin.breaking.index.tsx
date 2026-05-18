import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllBreakingNews, createBreakingNews, updateBreakingNews, deleteBreakingNews } from "@/integrations/sqlite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/breaking/")({
  component: AdminBreaking,
});

function AdminBreaking() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({ queryKey: ["breaking", "all"], queryFn: fetchAllBreakingNews });
  const [text, setText] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["breaking"] });

  const add = useMutation({
    mutationFn: async (headline: string) => {
      const max = Math.max(0, ...items.map((i) => i.sort_order));
      const { error } = await supabase.from("breaking_news").insert({ headline: headline.trim(), sort_order: max + 1 });
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); setText(""); toast.success("Headline ditambahkan"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (i: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("breaking_news").update({ is_active: !i.is_active }).eq("id", i.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("breaking_news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Dihapus"); },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl font-bold">Breaking News</h1>
        <p className="text-muted-foreground text-sm">Headline berjalan di ticker atas.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) add.mutate(text); }} className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis headline breaking news…" />
        <Button type="submit"><Plus className="h-4 w-4" />Tambah</Button>
      </form>

      <ul className="bg-background border rounded-xl divide-y">
        {items.map((i) => (
          <li key={i.id} className="p-3 flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${i.is_active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
              {i.is_active ? "Aktif" : "Off"}
            </span>
            <p className="flex-1 text-sm">{i.headline}</p>
            <Button size="sm" variant="ghost" onClick={() => toggle.mutate(i)}>
              {i.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => remove.mutate(i.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
        {items.length === 0 && <li className="p-6 text-center text-muted-foreground text-sm">Belum ada headline.</li>}
      </ul>
    </div>
  );
}
