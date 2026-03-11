import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Package, ShoppingCart, Eye, Layers, X, Share2, MessageCircle, ChevronUp, Filter, SlidersHorizontal, ArrowUpDown, Minus, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  name_hi: string | null;
  name_bn: string | null;
  slug: string;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  fabric: string | null;
  sizes: string;
  pcs_per_set: number;
  wsp: number | null;
  bundle_type: string | null;
  available_sizes: string[] | null;
  available_colours: string[] | null;
  combo_description: string | null;
  category_id: string | null;
  image_url: string | null;
  additional_images: string[] | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  created_at?: string;
}

// ─── Price helper ───
function getDisplayPrice(wsp: number | null, discountPercent: number): number {
  const w = Number(wsp) || 0;
  if (discountPercent > 0) return Math.round(w * (1 - discountPercent / 100));
  return w;
}

// ─── WhatsApp helper ───
function buildWhatsAppUrl(product: Product) {
  const lines = [
    `Hi Suvee Fashion! I'm interested in:`,
    `📦 ${product.name}`,
    product.fabric ? `🧵 ${product.fabric} | ${product.sizes} | ${product.pcs_per_set} pcs` : `📏 ${product.sizes} | ${product.pcs_per_set} pcs`,
    product.image_url ? `🖼 ${product.image_url}` : "",
    `Please share availability & best price.`,
  ].filter(Boolean).join("\n");
  return `https://wa.me/919831640808?text=${encodeURIComponent(lines)}`;
}

// ─── Share helper ───
async function shareProduct(product: Product) {
  const url = `${SITE_URL}/catalogues?product=${product.id}`;
  const text = `${product.name}${product.fabric ? ` - ${product.fabric}` : ""} | ${product.pcs_per_set} pcs/set`;
  if (navigator.share) {
    try { await navigator.share({ title: product.name, text, url }); } catch { /* cancelled */ }
  } else {
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Product link copied to clipboard." });
  }
}

// ─── Product Image Gallery ───
function ProductImageGallery({ product }: { product: Product }) {
  const allImages = [product.image_url, ...(product.additional_images || [])].filter(Boolean) as string[];
  const [activeIdx, setActiveIdx] = useState(0);
  if (allImages.length === 0) return null;
  return (
    <div>
      <img src={allImages[activeIdx]} alt={product.name} className="w-full object-cover aspect-square sm:rounded-t-lg" />
      {allImages.length > 1 && (
        <div className="flex gap-1.5 p-2 overflow-x-auto scrollbar-hide">
          {allImages.map((url, i) => (
            <button key={i} onClick={() => setActiveIdx(i)}
              className={`shrink-0 h-14 w-12 rounded-md overflow-hidden border-2 transition-all ${i === activeIdx ? "border-primary ring-1 ring-primary" : "border-border opacity-70 hover:opacity-100"}`}>
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Colour dots ───
function ColourDots({ colours }: { colours: string[] | null }) {
  if (!colours?.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {colours.slice(0, 6).map((c, i) => (
        <span key={i} className="h-4 w-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: c }} title={c} />
      ))}
      {colours.length > 6 && <span className="text-[10px] text-muted-foreground">+{colours.length - 6}</span>}
    </div>
  );
}

// ─── Price Display ───
function PriceDisplay({ product, isApproved, discountPercent, size = "sm" }: { product: Product; isApproved: boolean; discountPercent: number; size?: "sm" | "lg" }) {
  const user = useAuth().user;
  const wsp = Number(product.wsp) || 0;
  if (!wsp) return null;

  if (isApproved) {
    const displayPrice = getDisplayPrice(product.wsp, discountPercent);
    const hasDiscount = discountPercent > 0;
    const textSize = size === "lg" ? "text-2xl" : "text-base";
    const subSize = size === "lg" ? "text-sm" : "text-[10px]";
    return (
      <div className="mt-2 font-body">
        {hasDiscount && <span className="text-muted-foreground line-through text-xs mr-1">₹{wsp}</span>}
        <span className={`${textSize} font-bold text-primary`}>₹{displayPrice}</span>
        <span className={`${subSize} font-normal text-muted-foreground ml-1`}>
          {size === "lg" ? "per piece" : "/pc"} + 5% GST
        </span>
        {hasDiscount && <Badge className="ml-1.5 bg-green-100 text-green-800 text-[10px]">{discountPercent}% off</Badge>}
      </div>
    );
  }

  if (!user) {
    return (
      <p className="mt-2 text-[11px] text-muted-foreground italic">
        <Link to="/login" className="text-primary underline">Login</Link> to see prices
      </p>
    );
  }
  return null;
}

// ─── Product Card ───
function ProductCard({
  product, isApproved, discountPercent, addingToCart, onView, onAddToCart,
}: {
  product: Product; isApproved: boolean; discountPercent: number; addingToCart: string | null; onView: () => void; onAddToCart: () => void;
}) {
  const { user } = useAuth();
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card className="group overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center"><Package className="h-12 w-12 text-muted-foreground/30" /></div>
          )}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.is_featured && <Badge className="bg-secondary text-secondary-foreground text-[10px]">⭐ Featured</Badge>}
            {product.is_new_arrival && <Badge className="bg-green-600 text-white text-[10px]">✨ New</Badge>}
          </div>
          <div className="absolute right-2 top-2 flex flex-col gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md" onClick={onView}><Eye className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md" onClick={() => shareProduct(product)}><Share2 className="h-3.5 w-3.5" /></Button>
          </div>
          <a href={buildWhatsAppUrl(product)} target="_blank" rel="noopener noreferrer"
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110"
            aria-label="Ask on WhatsApp">
            <MessageCircle className="h-4 w-4" fill="white" />
          </a>
        </div>
        <CardContent className="p-3 sm:p-4">
          <h3 className="font-display text-sm font-semibold text-foreground line-clamp-1 sm:text-base">{product.name}</h3>
          {product.fabric && <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{product.fabric}</p>}
          <div className="mt-2 flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px]"><Layers className="mr-0.5 h-3 w-3" />{product.pcs_per_set} pcs</Badge>
            <Badge variant="outline" className="text-[10px]">{product.sizes}</Badge>
          </div>
          <PriceDisplay product={product} isApproved={isApproved} discountPercent={discountPercent} />
          <ColourDots colours={product.available_colours} />
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={onView}>View</Button>
            {isApproved ? (
              <Button size="sm" className="flex-1 text-xs" onClick={onAddToCart} disabled={addingToCart === product.id}>
                {addingToCart === product.id ? "Adding..." : "Add to Cart"}
              </Button>
            ) : (
              <Button size="sm" className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white" asChild>
                <a href={buildWhatsAppUrl(product)} target="_blank" rel="noopener noreferrer">💬 Inquire</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Product Detail Dialog ───
function ProductDetailDialog({
  product, isApproved, discountPercent, onClose, onAddToCart,
}: {
  product: Product | null; isApproved: boolean; discountPercent: number; onClose: () => void; onAddToCart: (p: Product, qty: number, sizeQtys?: Record<string, number>) => void;
}) {
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});

  const hasSizes = !!(product?.available_sizes && product.available_sizes.length > 0);

  useEffect(() => {
    if (product) {
      setQty(product.pcs_per_set || 1);
      if (product.available_sizes && product.available_sizes.length > 0) {
        const init: Record<string, number> = {};
        product.available_sizes.forEach(s => { init[s] = 0; });
        setSizeQuantities(init);
      } else {
        setSizeQuantities({});
      }
    }
  }, [product]);

  if (!product) return null;
  const step = product.pcs_per_set || 1;

  const totalSizeSets = Object.values(sizeQuantities).reduce((a, b) => a + b, 0);
  const totalSizePcs = totalSizeSets * step;

  const updateSizeQty = (size: string, delta: number) => {
    setSizeQuantities(prev => ({
      ...prev,
      [size]: Math.max(0, (prev[size] || 0) + delta),
    }));
  };

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg p-0">
        <ProductImageGallery product={product} />
        <div className="p-5 space-y-4">
          <DialogHeader className="flex-row items-start justify-between gap-2">
            <div className="flex-1 text-left">
              <DialogTitle className="font-display text-xl leading-tight">{product.name}</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {[product.fabric, product.sizes, `${product.pcs_per_set} pcs/set`].filter(Boolean).join(" • ")}
              </p>
            </div>
            <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => shareProduct(product)}>
              <Share2 className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}

          <div className="grid grid-cols-2 gap-2">
            {product.bundle_type && (
              <div className="rounded-lg border border-border p-2.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Bundle</p>
                <p className="text-sm font-medium text-foreground">{product.bundle_type}</p>
              </div>
            )}
            <div className="rounded-lg border border-border p-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Pcs/Set</p>
              <p className="text-sm font-medium text-foreground">{product.pcs_per_set}</p>
            </div>
            <div className="rounded-lg border border-border p-2.5">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Sizes</p>
              <p className="text-sm font-medium text-foreground">{product.sizes}</p>
            </div>
            {product.fabric && (
              <div className="rounded-lg border border-border p-2.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Fabric</p>
                <p className="text-sm font-medium text-foreground">{product.fabric}</p>
              </div>
            )}
          </div>

          {product.available_colours && product.available_colours.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-foreground">Available Colours</p>
              <div className="flex flex-wrap gap-1.5">
                {product.available_colours.map((c, i) => (
                  <span key={i} className="h-7 w-7 rounded-full border border-border shadow-sm" style={{ backgroundColor: c }} title={c} />
                ))}
              </div>
            </div>
          )}

          {product.combo_description && (
            <div className="rounded-lg bg-accent/50 p-3">
              <p className="text-xs font-semibold text-foreground">Combo Details</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{product.combo_description}</p>
            </div>
          )}

          <PriceDisplay product={product} isApproved={isApproved} discountPercent={discountPercent} size="lg" />

          {!user && (
            <p className="text-xs text-muted-foreground italic">
              <Link to="/register" className="text-primary underline">Register as buyer</Link> to see wholesale prices
            </p>
          )}

          {/* Size-wise quantity selector for products with available_sizes */}
          {isApproved && hasSizes && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Select Quantity per Size <span className="font-normal text-muted-foreground">({step} pcs/set)</span></p>
              <div className="space-y-1.5">
                {product.available_sizes!.map(size => (
                  <div key={size} className="flex items-center gap-3 rounded-lg border border-border p-2">
                    <Badge variant={sizeQuantities[size] > 0 ? "default" : "outline"} className="min-w-[40px] justify-center text-xs">{size}</Badge>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateSizeQty(size, -1)} disabled={!sizeQuantities[size]}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium font-body">{sizeQuantities[size] || 0}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateSizeQty(size, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-[10px] text-muted-foreground ml-auto font-body">
                      {sizeQuantities[size] > 0 ? `${sizeQuantities[size]} set${sizeQuantities[size] > 1 ? "s" : ""} = ${sizeQuantities[size] * step} pcs` : "—"}
                    </span>
                  </div>
                ))}
              </div>
              {totalSizeSets > 0 && (
                <p className="text-xs font-medium text-secondary font-body">Total: {totalSizeSets} set{totalSizeSets > 1 ? "s" : ""} = {totalSizePcs} pcs</p>
              )}
            </div>
          )}

          {/* Simple quantity selector for products without available_sizes */}
          {isApproved && !hasSizes && (
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-foreground">Qty:</label>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setQty(Math.max(step, qty - step))}>-</Button>
                <Input type="number" value={qty} onChange={e => setQty(Math.max(step, Math.round((parseInt(e.target.value) || step) / step) * step))}
                  className="h-8 w-20 text-center text-sm font-body" min={step} step={step} />
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setQty(qty + step)}>+</Button>
              </div>
              <span className="text-[10px] text-muted-foreground">({step} pcs/set)</span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" asChild>
              <a href={buildWhatsAppUrl(product)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" fill="white" /> Ask on WhatsApp
              </a>
            </Button>
            {isApproved && hasSizes && (
              <Button variant="outline" className="shrink-0" disabled={totalSizeSets === 0}
                onClick={() => { onAddToCart(product, totalSizePcs, sizeQuantities); onClose(); }}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add {totalSizePcs} pcs
              </Button>
            )}
            {isApproved && !hasSizes && (
              <Button variant="outline" className="shrink-0" onClick={() => { onAddToCart(product, qty); onClose(); }}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add {qty} pcs
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Filter Sidebar Content ───
function FilterContent({
  fabrics, selectedFabrics, toggleFabric, priceRange, setPriceRange, maxPrice, sortBy, setSortBy,
}: {
  fabrics: string[]; selectedFabrics: string[]; toggleFabric: (f: string) => void;
  priceRange: [number, number]; setPriceRange: (r: [number, number]) => void; maxPrice: number;
  sortBy: string; setSortBy: (s: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground uppercase tracking-wide">Sort By</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Featured First</SelectItem>
            <SelectItem value="price-low">Price: Low → High</SelectItem>
            <SelectItem value="price-high">Price: High → Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fabric */}
      {fabrics.length > 0 && (
        <div>
          <label className="mb-2 block text-xs font-semibold text-foreground uppercase tracking-wide">Fabric</label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {fabrics.map(f => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={selectedFabrics.includes(f)} onCheckedChange={() => toggleFabric(f)} />
                <span className="text-sm text-foreground">{f}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price range */}
      {maxPrice > 0 && (
        <div>
          <label className="mb-2 block text-xs font-semibold text-foreground uppercase tracking-wide">
            Price: ₹{priceRange[0]} — ₹{priceRange[1]}
          </label>
          <Slider min={0} max={maxPrice} step={50} value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───
export default function Catalogues() {
  const { t, language } = useLanguage();
  const { user, buyerStatus, discountPercent, businessName } = useAuth();
  const isApproved = !!(user && buyerStatus === "approved");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("*").order("display_order"),
        supabase.from("products").select("*").order("is_featured", { ascending: false }).order("is_new_arrival", { ascending: false }).order("created_at", { ascending: false }),
      ]);
      setCategories(catRes.data ?? []);
      const prods = prodRes.data ?? [];
      setProducts(prods);

      // Compute max price
      const wspValues = prods.map(p => Number(p.wsp) || 0).filter(v => v > 0);
      if (wspValues.length > 0) {
        const max = Math.ceil(Math.max(...wspValues) / 100) * 100;
        setMaxPrice(max);
        setPriceRange([0, max]);
      }

      setLoading(false);
      const productId = searchParams.get("product");
      if (productId) {
        const found = prods.find((p) => p.id === productId);
        if (found) setSelectedProduct(found);
      }
    };
    fetchData();
  }, []);

  // Unique fabrics
  const fabrics = useMemo(() => [...new Set(products.map(p => p.fabric).filter(Boolean))] as string[], [products]);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getCategoryName = (cat: Category) => {
    if (language === "hi" && cat.name_hi) return cat.name_hi;
    if (language === "bn" && cat.name_bn) return cat.name_bn;
    return cat.name;
  };

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);

  const toggleFabric = (f: string) => setSelectedFabrics(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.fabric?.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !selectedCategory || p.category_id === selectedCategory;
      const matchesFabric = selectedFabrics.length === 0 || selectedFabrics.includes(p.fabric || "");
      const wsp = Number(p.wsp) || 0;
      const matchesPrice = wsp >= priceRange[0] && wsp <= priceRange[1];
      return matchesSearch && matchesCat && matchesFabric && matchesPrice;
    });

    // Sort
    if (sortBy === "price-low") result = [...result].sort((a, b) => (Number(a.wsp) || 0) - (Number(b.wsp) || 0));
    else if (sortBy === "price-high") result = [...result].sort((a, b) => (Number(b.wsp) || 0) - (Number(a.wsp) || 0));
    else if (sortBy === "newest") result = [...result].sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());

    return result;
  }, [products, search, selectedCategory, selectedFabrics, priceRange, sortBy]);

  const featuredProducts = sortBy === "default" ? filtered.filter((p) => p.is_featured) : [];
  const newArrivals = sortBy === "default" ? filtered.filter((p) => p.is_new_arrival && !p.is_featured) : [];
  const regularProducts = sortBy === "default" ? filtered.filter((p) => !p.is_featured && !p.is_new_arrival) : filtered;

  const addToCart = async (product: Product, quantity = 1, sizeQtys?: Record<string, number>) => {
    if (!user) {
      toast({ title: "Please login first", description: "You need to register and get approved to order.", variant: "destructive" });
      return;
    }
    if (buyerStatus !== "approved") {
      toast({ title: "Approval pending", description: "Your buyer account is being reviewed by our team.", variant: "destructive" });
      return;
    }
    setAddingToCart(product.id);
    const step = product.pcs_per_set || 1;

    // Size-wise cart items
    if (sizeQtys && Object.values(sizeQtys).some(v => v > 0)) {
      const entries = Object.entries(sizeQtys).filter(([, sets]) => sets > 0);
      let totalPcs = 0;
      for (const [size, sets] of entries) {
        const pcs = sets * step;
        totalPcs += pcs;
        // Upsert: try insert, on conflict update quantity
        const { data: existing } = await supabase.from("cart_items")
          .select("id, quantity").eq("user_id", user.id).eq("product_id", product.id).eq("size", size).maybeSingle();
        if (existing) {
          await supabase.from("cart_items").update({ quantity: existing.quantity + pcs }).eq("id", existing.id);
        } else {
          await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: pcs, size });
        }
      }
      toast({ title: "Added to cart! 🛒", description: `${product.name} × ${totalPcs} pcs (${entries.length} size${entries.length > 1 ? "s" : ""}) added.` });
    } else {
      // No sizes — single cart item
      const qty = Math.max(step, Math.round(quantity / step) * step);
      const { error } = await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: qty });
      if (error) {
        toast({ title: "Error", description: "Could not add to cart. Try again.", variant: "destructive" });
        setAddingToCart(null);
        return;
      }
      toast({ title: "Added to cart! 🛒", description: `${product.name} × ${qty} pcs added.` });
    }
    setAddingToCart(null);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
    if (searchParams.has("product")) {
      searchParams.delete("product");
      setSearchParams(searchParams, { replace: true });
    }
  };

  const activeFilterCount = selectedFabrics.length + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) + (sortBy !== "default" ? 1 : 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading catalogues...</div>
      </div>
    );
  }

  const renderGrid = (title: string, prods: Product[]) => (
    <div className="mb-8">
      <h2 className="mb-4 font-display text-lg font-bold text-foreground sm:text-xl">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {prods.map((p) => (
          <ProductCard key={p.id} product={p} isApproved={isApproved} discountPercent={discountPercent}
            addingToCart={addingToCart} onView={() => setSelectedProduct(p)} onAddToCart={() => addToCart(p)} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-28 md:pb-0">
      {/* Personalized welcome for approved buyers */}
      {isApproved && businessName && (
        <div className="bg-primary/5 border-b border-primary/10">
          <div className="container py-3 flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-foreground">
              Welcome back, <span className="font-semibold">{businessName}</span>! 👋
            </p>
            {discountPercent > 0 && (
              <Badge className="bg-green-100 text-green-800 text-xs">Your Discount: {discountPercent}% off</Badge>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <section className="border-b border-border bg-card py-8 sm:py-12">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
            {t("nav.catalogues")}
          </motion.h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">850+ designs across all categories</p>
          <div className="mx-auto mt-5 flex max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name, fabric..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {search && <Button variant="ghost" size="icon" onClick={() => setSearch("")}><X className="h-4 w-4" /></Button>}
          </div>
        </div>
      </section>

      {/* Category filter bar + Filter button */}
      <section className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur md:top-20">
        <div className="container overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 py-3">
            <Button size="sm" variant={selectedCategory === null ? "default" : "outline"} className="shrink-0 text-xs" onClick={() => setSelectedCategory(null)}>All</Button>
            {categories.map((cat) => (
              <Button key={cat.id} size="sm" variant={selectedCategory === cat.id ? "default" : "outline"} className="shrink-0 text-xs whitespace-nowrap" onClick={() => setSelectedCategory(cat.id)}>
                {getCategoryName(cat)}
              </Button>
            ))}

            {/* Filter button (mobile: sheet, desktop: inline) */}
            <div className="ml-auto md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="text-xs relative">
                    <SlidersHorizontal className="mr-1 h-3.5 w-3.5" /> Filters
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">{activeFilterCount}</span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                  <div className="mt-4">
                    <FilterContent fabrics={fabrics} selectedFabrics={selectedFabrics} toggleFabric={toggleFabric}
                      priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxPrice}
                      sortBy={sortBy} setSortBy={setSortBy} />
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" className="mt-4 text-xs" onClick={() => { setSelectedFabrics([]); setPriceRange([0, maxPrice]); setSortBy("default"); }}>
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop filter bar */}
      <div className="hidden md:block border-b border-border bg-muted/30">
        <div className="container py-3 flex items-center gap-6 flex-wrap">
          <FilterContent fabrics={fabrics} selectedFabrics={selectedFabrics} toggleFabric={toggleFabric}
            priceRange={priceRange} setPriceRange={setPriceRange} maxPrice={maxPrice}
            sortBy={sortBy} setSortBy={setSortBy} />
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => { setSelectedFabrics([]); setPriceRange([0, maxPrice]); setSortBy("default"); }}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Results count + active filter chips */}
      <div className="container pt-4 pb-1 flex items-center gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {products.length} products
        </p>
        {selectedCategoryObj && (
          <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => setSelectedCategory(null)}>
            {getCategoryName(selectedCategoryObj)} <X className="h-3 w-3" />
          </Badge>
        )}
        {search && (
          <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => setSearch("")}>
            "{search}" <X className="h-3 w-3" />
          </Badge>
        )}
        {selectedFabrics.map(f => (
          <Badge key={f} variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => toggleFabric(f)}>
            {f} <X className="h-3 w-3" />
          </Badge>
        ))}
      </div>

      <div className="container py-4 sm:py-6">
        {filtered.length === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No products found. Try a different search or category.</p>
          </div>
        ) : (
          <>
            {featuredProducts.length > 0 && renderGrid("⭐ Featured Products", featuredProducts)}
            {newArrivals.length > 0 && renderGrid(t("new_arrivals.title"), newArrivals)}
            {regularProducts.length > 0 && renderGrid(sortBy === "default" ? `All Products (${regularProducts.length})` : `${filtered.length} Products`, regularProducts)}
          </>
        )}
      </div>

      {!user && (
        <section className="border-t border-border bg-accent/50 py-10 text-center">
          <div className="container">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">{t("cta.register_title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("cta.register_subtitle")}</p>
            <div className="mt-5 flex justify-center gap-3">
              <Button size="lg" asChild><Link to="/register">{t("cta.register_button")}</Link></Button>
              <Button size="lg" variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-600" asChild>
                <a href="https://wa.me/919831640808?text=Hi%20Suvee%20Fashion!%20I%27m%20interested%20in%20your%20wholesale%20kurtis." target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
              </Button>
            </div>
          </div>
        </section>
      )}

      <div className="fixed bottom-[52px] left-0 right-0 z-40 md:hidden safe-area-bottom">
        <a href="https://wa.me/919831640808?text=Hi%20Suvee%20Fashion!%20I%20have%20a%20question%20about%20your%20catalogue."
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green-600 py-2.5 text-xs font-semibold text-white">
          <MessageCircle className="h-4 w-4" fill="white" /> Have questions? Ask on WhatsApp
        </a>
      </div>

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-28 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 md:bottom-8"
          aria-label="Scroll to top">
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      <ProductDetailDialog product={selectedProduct} isApproved={isApproved} discountPercent={discountPercent}
        onClose={handleCloseDetail} onAddToCart={addToCart} />
    </div>
  );
}
