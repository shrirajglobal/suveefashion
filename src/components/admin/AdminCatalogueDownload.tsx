import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Download, Share2, Loader2, Filter } from "lucide-react";

interface Category { id: string; name: string; }

export default function AdminCatalogueDownload() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [fabrics, setFabrics] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("id, name").order("display_order"),
        supabase.from("products").select("*").order("name"),
      ]);
      setCategories(catRes.data ?? []);
      const prods = prodRes.data ?? [];
      setProducts(prods);

      const uniqueFabrics = [...new Set(prods.map(p => p.fabric).filter(Boolean))] as string[];
      setFabrics(uniqueFabrics);

      const wspValues = prods.map(p => Number(p.wsp) || 0).filter(v => v > 0);
      if (wspValues.length > 0) {
        const max = Math.ceil(Math.max(...wspValues) / 100) * 100;
        setMaxPrice(max);
        setPriceRange([0, max]);
      }
    };
    fetch();
  }, []);

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== "all" && p.category_id !== selectedCategory) return false;
    if (selectedFabrics.length > 0 && !selectedFabrics.includes(p.fabric)) return false;
    const wsp = Number(p.wsp) || 0;
    if (wsp < priceRange[0] || wsp > priceRange[1]) return false;
    return true;
  });

  const toggleFabric = (f: string) => {
    setSelectedFabrics(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const generatePDF = async () => {
    if (filteredProducts.length === 0) {
      toast({ title: "No products to include", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-catalogue-pdf", {
        body: {
          category_id: selectedCategory === "all" ? null : selectedCategory,
          fabrics: selectedFabrics.length > 0 ? selectedFabrics : null,
          price_min: priceRange[0],
          price_max: priceRange[1],
          discount_percent: discountPercent,
        },
      });
      if (error) throw error;

      const w = window.open("", "_blank");
      if (!w) { toast({ title: "Pop-up blocked. Please allow pop-ups.", variant: "destructive" }); return; }
      w.document.write(data.html);
      w.document.close();
      toast({ title: "Catalogue generated! Use Ctrl+P to save as PDF." });
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const shareOnWhatsApp = () => {
    const catName = selectedCategory === "all" ? "All Categories" : categories.find(c => c.id === selectedCategory)?.name || "Selected";
    const catalogueUrl = selectedCategory === "all"
      ? `${SITE_URL}/catalogues`
      : `${SITE_URL}/catalogues?category=${selectedCategory}`;
    const msg = `🛍️ *Suvee Fashion — ${catName} Catalogue*\n\nBrowse our latest collection here:\n${catalogueUrl}${discountPercent > 0 ? `\n\n🎉 Special ${discountPercent}% discount available!` : ""}\n\nWhatsApp: +91 98316 40808`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="mt-4 space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" /> Catalogue Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Category */}
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Fabric */}
          {fabrics.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-foreground">Fabric</label>
              <div className="flex flex-wrap gap-2">
                {fabrics.map(f => (
                  <label key={f} className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox checked={selectedFabrics.includes(f)} onCheckedChange={() => toggleFabric(f)} />
                    <span className="text-xs text-foreground">{f}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price range */}
          <div>
            <label className="mb-2 block text-xs font-medium text-foreground">
              Price Range: ₹{priceRange[0]} — ₹{priceRange[1]}
            </label>
            <Slider
              min={0}
              max={maxPrice}
              step={50}
              value={priceRange}
              onValueChange={(v) => setPriceRange(v as [number, number])}
              className="mt-2"
            />
          </div>

          {/* Discount */}
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Custom Discount %</label>
            <Input
              type="number"
              min={0}
              max={50}
              value={discountPercent}
              onChange={e => setDiscountPercent(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-32"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">PDF will show prices after this discount</p>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-sm font-medium text-foreground">
              {filteredProducts.length} products selected
              {discountPercent > 0 && <Badge className="ml-2 bg-green-100 text-green-800 text-[10px]">{discountPercent}% discount applied</Badge>}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={generatePDF} disabled={generating || filteredProducts.length === 0}>
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {generating ? "Generating..." : "Generate Catalogue PDF"}
            </Button>
            <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-600" onClick={shareOnWhatsApp}>
              <Share2 className="mr-2 h-4 w-4" /> Share on WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
