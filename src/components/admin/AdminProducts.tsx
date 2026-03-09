import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";
import casualImg from "@/assets/category-casual.jpg";

interface ProductForm {
  name: string;
  description: string;
  fabric: string;
  sizes: string;
  moq: number;
  wsp: number | null;
  bulk_price_50: number | null;
  bulk_price_100: number | null;
  bulk_price_500: number | null;
  category_id: string;
  image_url: string;
  is_featured: boolean;
  is_new_arrival: boolean;
}

const emptyForm: ProductForm = {
  name: "", description: "", fabric: "", sizes: "S-XXL", moq: 50,
  wsp: null, bulk_price_50: null, bulk_price_100: null, bulk_price_500: null,
  category_id: "", image_url: "", is_featured: false, is_new_arrival: false,
};

export default function AdminProducts({ onUpdate }: { onUpdate: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("display_order"),
    ]);
    setProducts(p.data ?? []);
    setCategories(c.data ?? []);
    setLoading(false);
  };

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description || "", fabric: p.fabric || "",
      sizes: p.sizes, moq: p.moq, wsp: p.wsp, bulk_price_50: p.bulk_price_50,
      bulk_price_100: p.bulk_price_100, bulk_price_500: p.bulk_price_500,
      category_id: p.category_id || "", image_url: p.image_url || "",
      is_featured: p.is_featured, is_new_arrival: p.is_new_arrival,
    });
    setDialogOpen(true);
  };

  const saveProduct = async () => {
    const payload = {
      ...form,
      wsp: form.wsp || null,
      bulk_price_50: form.bulk_price_50 || null,
      bulk_price_100: form.bulk_price_100 || null,
      bulk_price_500: form.bulk_price_500 || null,
      category_id: form.category_id || null,
      image_url: form.image_url || null,
    };

    const { error } = editingId
      ? await supabase.from("products").update(payload).eq("id", editingId)
      : await supabase.from("products").insert(payload);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Product updated!" : "Product created!" });
      setDialogOpen(false);
      fetchAll();
      onUpdate();
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Product deleted" });
      fetchAll();
      onUpdate();
    }
  };

  if (loading) return <p className="py-8 text-center text-muted-foreground">Loading products...</p>;

  const numField = (label: string, key: keyof ProductForm) => (
    <div>
      <label className="mb-1 block text-xs font-medium">{label}</label>
      <Input type="number" value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value ? Number(e.target.value) : null })} />
    </div>
  );

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{products.length} product(s)</span>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle className="font-display">{editingId ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium">Product Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={200} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium">Fabric</label>
                  <Input value={form.fabric} onChange={(e) => setForm({ ...form, fabric: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Sizes</label>
                  <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Category</label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">Image URL</label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {numField("MOQ", "moq")}
                {numField("WSP (₹)", "wsp")}
                {numField("Price 50+ pcs (₹)", "bulk_price_50")}
                {numField("Price 100+ pcs (₹)", "bulk_price_100")}
                {numField("Price 500+ pcs (₹)", "bulk_price_500")}
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.is_new_arrival} onCheckedChange={(v) => setForm({ ...form, is_new_arrival: v })} /> New Arrival
                </label>
              </div>
              <Button onClick={saveProduct} className="w-full">{editingId ? "Update Product" : "Create Product"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No products yet. Add your first product!</p>
      ) : (
        products.map((p) => (
          <Card key={p.id} className="border-0 shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <img src={p.image_url || casualImg} alt={p.name} className="h-16 w-14 rounded-md object-cover" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold text-foreground">{p.name}</h3>
                  {p.is_featured && <Badge variant="secondary">Featured</Badge>}
                  {p.is_new_arrival && <Badge variant="outline">New</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.categories?.name || "Uncategorized"} · {p.fabric || "N/A"} · MOQ: {p.moq} · WSP: ₹{p.wsp ?? "N/A"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
