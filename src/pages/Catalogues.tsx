import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Package, ShoppingCart, Eye, Layers, X, Share2, MessageCircle, ChevronUp } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const url = `${window.location.origin}/catalogues?product=${product.id}`;
  const text = `${product.name}${product.fabric ? ` - ${product.fabric}` : ""} | ${product.pcs_per_set} pcs/set`;

  if (navigator.share) {
    try {
      await navigator.share({ title: product.name, text, url });
    } catch {
      /* user cancelled */
    }
  } else {
    await navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Product link copied to clipboard." });
  }
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

// ─── Product Card ───
function ProductCard({
  product,
  isApproved,
  user,
  addingToCart,
  onView,
  onAddToCart,
}: {
  product: Product;
  isApproved: boolean;
  user: any;
  addingToCart: string | null;
  onView: () => void;
  onAddToCart: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card className="group overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.is_featured && <Badge className="bg-secondary text-secondary-foreground text-[10px]">⭐ Featured</Badge>}
            {product.is_new_arrival && <Badge className="bg-green-600 text-white text-[10px]">✨ New</Badge>}
          </div>

          {/* Quick-action icons – always visible on mobile, hover on desktop */}
          <div className="absolute right-2 top-2 flex flex-col gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md" onClick={onView}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md" onClick={() => shareProduct(product)}>
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* WhatsApp quick-inquiry – always visible */}
          <a
            href={buildWhatsAppUrl(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110"
            aria-label="Ask on WhatsApp"
          >
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

          {isApproved && product.wsp && (
            <p className="mt-2 font-display text-base font-bold text-primary">₹{product.wsp} <span className="text-[10px] font-normal text-muted-foreground">WSP/pc</span></p>
          )}
          {!user && (
            <p className="mt-2 text-[11px] text-muted-foreground italic">
              <Link to="/login" className="text-primary underline">Login</Link> to see prices
            </p>
          )}

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
  product,
  isApproved,
  user,
  onClose,
  onAddToCart,
}: {
  product: Product | null;
  isApproved: boolean;
  user: any;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}) {
  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg p-0">
        {/* Image gallery */}
        <ProductImageGallery product={product} />

        <div className="p-5 space-y-4">
          {/* Header row with share */}
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

          {/* Description */}
          {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}

          {/* Specs grid */}
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

          {/* Colours */}
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

          {/* Sizes */}
          {product.available_sizes && product.available_sizes.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-foreground">Available Sizes</p>
              <div className="flex flex-wrap gap-1">
                {product.available_sizes.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Combo */}
          {product.combo_description && (
            <div className="rounded-lg bg-accent/50 p-3">
              <p className="text-xs font-semibold text-foreground">Combo Details</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{product.combo_description}</p>
            </div>
          )}

          {/* Price */}
          {isApproved && product.wsp && (
            <p className="font-display text-2xl font-bold text-primary">₹{product.wsp} <span className="text-sm font-normal text-muted-foreground">WSP per piece</span></p>
          )}
          {!user && (
            <p className="text-xs text-muted-foreground italic">
              <Link to="/register" className="text-primary underline">Register as buyer</Link> to see wholesale prices
            </p>
          )}

          {/* CTA buttons */}
          <div className="flex gap-2 pt-1">
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" asChild>
              <a href={buildWhatsAppUrl(product)} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" fill="white" /> Ask on WhatsApp
              </a>
            </Button>
            {isApproved && (
              <Button variant="outline" className="shrink-0" onClick={() => { onAddToCart(product); onClose(); }}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Section renderer ───
function ProductSection({ title, products, ...cardProps }: { title: string; products: Product[] } & Omit<React.ComponentProps<typeof ProductCard>, "product" | "onView" | "onAddToCart">) {
  const { onView, onAddToCart, ...rest } = cardProps as any;
  return null; // unused, inline below
}

// ─── Main Page ───
export default function Catalogues() {
  const { t, language } = useLanguage();
  const { user, buyerStatus } = useAuth();
  const isApproved = user && buyerStatus === "approved";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("*").order("display_order"),
        supabase.from("products").select("*").order("is_featured", { ascending: false }).order("is_new_arrival", { ascending: false }).order("created_at", { ascending: false }),
      ]);
      setCategories(catRes.data ?? []);
      const prods = prodRes.data ?? [];
      setProducts(prods);
      setLoading(false);

      // Deep-link: auto-open product dialog
      const productId = searchParams.get("product");
      if (productId) {
        const found = prods.find((p) => p.id === productId);
        if (found) setSelectedProduct(found);
      }
    };
    fetchData();
  }, []);

  // Scroll-to-top visibility
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

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.fabric?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || p.category_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const featuredProducts = filtered.filter((p) => p.is_featured);
  const newArrivals = filtered.filter((p) => p.is_new_arrival && !p.is_featured);
  const regularProducts = filtered.filter((p) => !p.is_featured && !p.is_new_arrival);

  const addToCart = async (product: Product) => {
    if (!user) {
      toast({ title: "Please login first", description: "You need to register and get approved to order.", variant: "destructive" });
      return;
    }
    if (buyerStatus !== "approved") {
      toast({ title: "Approval pending", description: "Your buyer account is being reviewed by our team.", variant: "destructive" });
      return;
    }
    setAddingToCart(product.id);
    const { error } = await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: 1 });
    if (error) {
      toast({ title: "Error", description: "Could not add to cart. Try again.", variant: "destructive" });
    } else {
      toast({ title: "Added to cart! 🛒", description: `${product.name} added.` });
    }
    setAddingToCart(null);
  };

  // Clear deep-link param when dialog closes
  const handleCloseDetail = () => {
    setSelectedProduct(null);
    if (searchParams.has("product")) {
      searchParams.delete("product");
      setSearchParams(searchParams, { replace: true });
    }
  };

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
          <ProductCard
            key={p.id}
            product={p}
            isApproved={!!isApproved}
            user={user}
            addingToCart={addingToCart}
            onView={() => setSelectedProduct(p)}
            onAddToCart={() => addToCart(p)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-28 md:pb-0">
      {/* Header */}
      <section className="border-b border-border bg-card py-8 sm:py-12">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
            {t("nav.catalogues")}
          </motion.h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">850+ designs across all categories</p>

          {/* Search */}
          <div className="mx-auto mt-5 flex max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name, fabric..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {search && (
              <Button variant="ghost" size="icon" onClick={() => setSearch("")}><X className="h-4 w-4" /></Button>
            )}
          </div>
        </div>
      </section>

      {/* Category filter bar */}
      <section className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur md:top-20">
        <div className="container overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 py-3">
            <Button size="sm" variant={selectedCategory === null ? "default" : "outline"} className="shrink-0 text-xs" onClick={() => setSelectedCategory(null)}>
              All
            </Button>
            {categories.map((cat) => (
              <Button key={cat.id} size="sm" variant={selectedCategory === cat.id ? "default" : "outline"} className="shrink-0 text-xs whitespace-nowrap" onClick={() => setSelectedCategory(cat.id)}>
                {getCategoryName(cat)}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Results count + active filter chip */}
      <div className="container pt-4 pb-1 flex items-center gap-2 flex-wrap">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {products.length} products
        </p>
        {selectedCategoryObj && (
          <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => setSelectedCategory(null)}>
            {getCategoryName(selectedCategoryObj)}
            <X className="h-3 w-3" />
          </Badge>
        )}
        {search && (
          <Badge variant="secondary" className="gap-1 text-xs cursor-pointer" onClick={() => setSearch("")}>
            "{search}"
            <X className="h-3 w-3" />
          </Badge>
        )}
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
            {regularProducts.length > 0 && renderGrid(`All Products (${regularProducts.length})`, regularProducts)}
          </>
        )}
      </div>

      {/* CTA for non-logged-in users */}
      {!user && (
        <section className="border-t border-border bg-accent/50 py-10 text-center">
          <div className="container">
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">{t("cta.register_title")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("cta.register_subtitle")}</p>
            <div className="mt-5 flex justify-center gap-3">
              <Button size="lg" asChild><Link to="/register">{t("cta.register_button")}</Link></Button>
              <Button size="lg" variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-600" asChild>
                <a href="https://wa.me/919831640808?text=Hi%20Suvee%20Fashion!%20I%27m%20interested%20in%20your%20wholesale%20kurtis." target="_blank" rel="noopener noreferrer">
                  💬 WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Mobile sticky WhatsApp inquiry bar */}
      <div className="fixed bottom-[52px] left-0 right-0 z-40 md:hidden safe-area-bottom">
        <a
          href="https://wa.me/919831640808?text=Hi%20Suvee%20Fashion!%20I%20have%20a%20question%20about%20your%20catalogue."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green-600 py-2.5 text-xs font-semibold text-white"
        >
          <MessageCircle className="h-4 w-4" fill="white" />
          Have questions? Ask on WhatsApp
        </a>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-28 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 md:bottom-8"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}

      {/* Product detail dialog */}
      <ProductDetailDialog
        product={selectedProduct}
        isApproved={!!isApproved}
        user={user}
        onClose={handleCloseDetail}
        onAddToCart={addToCart}
      />
    </div>
  );
}
