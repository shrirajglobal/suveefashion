import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon, Layers } from "lucide-react";
import ColourPicker from "@/components/admin/ColourPicker";
import casualImg from "@/assets/category-casual.jpg";

const FABRICS = [
  "Rayon 14kg",
  "Heavy Rayon",
  "Cotton (40x60)",
  "Cotton (60x60) - Cambric Cotton",
  "Roman Silk",
  "Berlin Silk",
  "Gadhwal Silk",
  "Gajji Silk",
];

const ALL_SIZES = ["S", "M", "L", "XL", "XXL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL", "9XL", "10XL"];

interface ProductForm {
  name: string;
  description: string;
  fabric: string;
  sizes: string;
  pcs_per_set: number;
  wsp: number | null;
  bundle_type: string;
  available_sizes: string[];
  combo_description: string;
  available_colours: string[];
  category_id: string;
  image_url: string;
  is_featured: boolean;
  is_new_arrival: boolean;
}

const emptyForm: ProductForm = {
  name: "", description: "", fabric: "", sizes: "S-XXL", pcs_per_set: 4,
  wsp: null, bundle_type: "combo", available_sizes: [], combo_description: "",
  available_colours: [], category_id: "", image_url: "", is_featured: false, is_new_arrival: false,
};

export default function AdminProducts({ onUpdate }: { onUpdate: () => void }) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [fabricOther, setFabricOther] = useState("");
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkImages, setBulkImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

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

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setFabricOther(""); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setEditingId(p.id);
    const isOtherFabric = p.fabric && !FABRICS.includes(p.fabric);
    setFabricOther(isOtherFabric ? p.fabric : "");
    setForm({
      name: p.name, description: p.description || "", fabric: isOtherFabric ? "__other__" : (p.fabric || ""),
      sizes: p.sizes, pcs_per_set: p.pcs_per_set, wsp: p.wsp,
      bundle_type: p.bundle_type || "combo",
      available_sizes: p.available_sizes || [],
      combo_description: p.combo_description || "",
      available_colours: p.available_colours || [],
      category_id: p.category_id || "", image_url: p.image_url || "",
      is_featured: p.is_featured, is_new_arrival: p.is_new_arrival,
    });
    setDialogOpen(true);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return null; }
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
    return publicUrl;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) setForm((f) => ({ ...f, image_url: url }));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getResolvedFabric = () => form.fabric === "__other__" ? fabricOther.trim() : form.fabric;

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      available_sizes: f.available_sizes.includes(size)
        ? f.available_sizes.filter((s) => s !== size)
        : [...f.available_sizes, size],
    }));
  };

  const saveProduct = async () => {
    if (!form.name.trim()) { toast({ title: "Product name is required", variant: "destructive" }); return; }
    if (form.bundle_type === "colour_chart" && form.available_colours.length !== form.pcs_per_set) {
      toast({ title: `Please select exactly ${form.pcs_per_set} colours for the colour chart`, variant: "destructive" }); return;
    }
    const resolvedFabric = getResolvedFabric();
    const payload: any = {
      name: form.name,
      description: form.description || null,
      fabric: resolvedFabric || null,
      sizes: form.sizes,
      pcs_per_set: form.pcs_per_set,
      wsp: form.wsp || null,
      bundle_type: form.bundle_type,
      available_sizes: form.available_sizes,
      available_colours: form.bundle_type === "colour_chart" ? form.available_colours : [],
      combo_description: form.combo_description || null,
      category_id: form.category_id || null,
      image_url: form.image_url || null,
      is_featured: form.is_featured,
      is_new_arrival: form.is_new_arrival,
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

  const handleBulkAdd = async () => {
    if (bulkImages.length === 0) { toast({ title: "Please select images", variant: "destructive" }); return; }
    if (!form.name.trim()) { toast({ title: "Product name is required", variant: "destructive" }); return; }
    setBulkUploading(true);

    const resolvedFabric = getResolvedFabric();
    const products: any[] = [];

    for (let i = 0; i < bulkImages.length; i++) {
      const url = await uploadImage(bulkImages[i]);
      if (!url) { setBulkUploading(false); return; }
      products.push({
        name: bulkImages.length === 1 ? form.name : `${form.name} - ${i + 1}`,
        description: form.description || null,
        fabric: resolvedFabric || null,
        sizes: form.sizes,
        pcs_per_set: form.pcs_per_set,
        wsp: form.wsp || null,
        bundle_type: form.bundle_type,
        available_sizes: form.available_sizes,
        combo_description: form.combo_description || null,
        category_id: form.category_id || null,
        image_url: url,
        is_featured: form.is_featured,
        is_new_arrival: form.is_new_arrival,
      });
    }

    const { error } = await supabase.from("products").insert(products);
    setBulkUploading(false);

    if (error) {
      toast({ title: "Bulk add failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${products.length} product(s) created!` });
      setBulkDialogOpen(false);
      setBulkImages([]);
      setForm(emptyForm);
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

  // Shared form fields component
  const ProductFormFields = () => (
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
          <Select value={form.fabric} onValueChange={(v) => { setForm({ ...form, fabric: v }); if (v !== "__other__") setFabricOther(""); }}>
            <SelectTrigger><SelectValue placeholder="Select fabric" /></SelectTrigger>
            <SelectContent>
              {FABRICS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              <SelectItem value="__other__">Others</SelectItem>
            </SelectContent>
          </Select>
          {form.fabric === "__other__" && (
            <Input className="mt-2" placeholder="Enter fabric name" value={fabricOther} onChange={(e) => setFabricOther(e.target.value)} maxLength={100} />
          )}
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
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium">Pcs per Set/Bundle *</label>
          <Input type="number" min={1} value={String(form.pcs_per_set)} onChange={(e) => setForm({ ...form, pcs_per_set: parseInt(e.target.value) || 1 })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">WSP (₹) *</label>
          <Input type="number" value={String(form.wsp ?? "")} onChange={(e) => setForm({ ...form, wsp: e.target.value ? Number(e.target.value) : null })} />
        </div>
      </div>

      {/* Bundle Type */}
      <div>
        <label className="mb-1 block text-xs font-medium">Bundle Type *</label>
        <Select value={form.bundle_type} onValueChange={(v) => setForm({ ...form, bundle_type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="combo">Combo</SelectItem>
            <SelectItem value="colour_chart">Colour Chart</SelectItem>
            <SelectItem value="assorted">Assorted</SelectItem>
          </SelectContent>
        </Select>
        <p className="mt-1 rounded bg-accent px-2 py-1 text-[10px] text-muted-foreground">
          {form.bundle_type === "combo" && "Combo: 3-4 pcs of SAME colour but DIFFERENT sizes in one set. Select which sizes are included below."}
          {form.bundle_type === "colour_chart" && "Colour Chart: Each set has 3-4 DIFFERENT colours of the SAME size. Customer picks one or more sizes. Select available sizes below."}
          {form.bundle_type === "assorted" && "Assorted: Mixed prints, colours and sizes in one set. Flexible combinations. Describe the assortment below."}
        </p>
      </div>

      {/* Size picker for combo & colour_chart */}
      {(form.bundle_type === "combo" || form.bundle_type === "colour_chart") && (
        <div>
          <label className="mb-1 block text-xs font-medium">
            {form.bundle_type === "combo" ? "Sizes in this set" : "Available sizes (customer picks)"}
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_SIZES.map((size) => (
              <label key={size} className="flex cursor-pointer items-center gap-1.5 rounded-md border border-input px-2.5 py-1.5 text-xs transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                <Checkbox
                  checked={form.available_sizes.includes(size)}
                  onCheckedChange={() => toggleSize(size)}
                />
                {size}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Assorted description */}
      {form.bundle_type === "assorted" && (
        <div>
          <label className="mb-1 block text-xs font-medium">Assortment Description</label>
          <Textarea
            value={form.combo_description}
            onChange={(e) => setForm({ ...form, combo_description: e.target.value })}
            rows={2}
            placeholder="e.g., Mixed floral prints in S, M, L sizes with assorted colours"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium">Sizes (display text)</label>
        <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="e.g., S-XXL" />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /> Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={form.is_new_arrival} onCheckedChange={(v) => setForm({ ...form, is_new_arrival: v })} /> New Arrival
        </label>
      </div>
    </div>
  );

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{products.length} product(s)</span>
        <div className="flex gap-2">
          {/* Bulk Add Dialog */}
          <Dialog open={bulkDialogOpen} onOpenChange={(open) => { setBulkDialogOpen(open); if (!open) { setBulkImages([]); setForm(emptyForm); setFabricOther(""); } }}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" onClick={() => { setForm(emptyForm); setFabricOther(""); }}>
                <Layers className="mr-1 h-4 w-4" /> Bulk Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display">Bulk Add Products</DialogTitle>
                <p className="text-xs text-muted-foreground">Upload multiple images with shared details. Each image creates a separate product named "Product Name - 1", "Product Name - 2", etc.</p>
              </DialogHeader>

              {/* Bulk image upload area */}
              <div>
                <label className="mb-1 block text-xs font-medium">Upload Images *</label>
                <div
                  className="flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input p-4 transition-colors hover:border-primary/50"
                  onClick={() => bulkFileInputRef.current?.click()}
                >
                  <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Click to select images ({bulkImages.length} selected)</p>
                  <input
                    ref={bulkFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => { if (e.target.files) setBulkImages(Array.from(e.target.files)); }}
                  />
                </div>
                {bulkImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {bulkImages.map((file, i) => (
                      <div key={i} className="relative">
                        <img src={URL.createObjectURL(file)} alt="" className="h-16 w-14 rounded-md object-cover" />
                        <button
                          className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                          onClick={(e) => { e.stopPropagation(); setBulkImages((prev) => prev.filter((_, j) => j !== i)); }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <ProductFormFields />

              <Button onClick={handleBulkAdd} className="w-full" disabled={bulkUploading}>
                {bulkUploading ? "Uploading & Creating..." : `Create ${bulkImages.length} Product(s)`}
              </Button>
            </DialogContent>
          </Dialog>

          {/* Single Add Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader><DialogTitle className="font-display">{editingId ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>

              {/* Image upload */}
              <div>
                <label className="mb-1 block text-xs font-medium">Product Image</label>
                {form.image_url ? (
                  <div className="relative inline-block">
                    <img src={form.image_url} alt="Product" className="h-32 w-28 rounded-lg object-cover" />
                    <button
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                      onClick={() => setForm({ ...form, image_url: "" })}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="flex h-32 w-28 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input transition-colors hover:border-primary/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <p className="text-xs text-muted-foreground">Uploading...</p>
                    ) : (
                      <>
                        <ImageIcon className="mb-1 h-6 w-6 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">Click to upload</p>
                      </>
                    )}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              <ProductFormFields />

              <Button onClick={saveProduct} className="w-full">{editingId ? "Update Product" : "Create Product"}</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No products yet. Add your first product!</p>
      ) : (
        products.map((p) => (
          <Card key={p.id} className="border-0 shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <img src={p.image_url || casualImg} alt={p.name} className="h-16 w-14 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-sm font-semibold text-foreground truncate">{p.name}</h3>
                  {p.is_featured && <Badge variant="secondary">Featured</Badge>}
                  {p.is_new_arrival && <Badge variant="outline">New</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.categories?.name || "Uncategorized"} · {p.fabric || "N/A"} · {p.pcs_per_set} pcs/set · WSP: ₹{p.wsp ?? "N/A"}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">{(p.bundle_type || "combo").replace("_", " ")}</p>
              </div>
              <div className="flex gap-1 shrink-0">
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
