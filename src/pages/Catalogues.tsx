import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Package, ShoppingCart, Eye, Layers, X } from "lucide-react";
import { Link } from "react-router-dom";
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
  is_featured: boolean;
  is_new_arrival: boolean;
}

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

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("*").order("display_order"),
        supabase.from("products").select("*").order("is_featured", { ascending: false }).order("is_new_arrival", { ascending: false }).order("created_at", { ascending: false }),
      ]);
      setCategories(catRes.data ?? []);
      setProducts(prodRes.data ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getCategoryName = (cat: Category) => {
    if (language === "hi" && cat.name_hi) return cat.name_hi;
    if (language === "bn" && cat.name_bn) return cat.name_bn;
    return cat.name;
  };

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

  const renderColourDots = (colours: string[] | null) => {
    if (!colours?.length) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {colours.slice(0, 6).map((c, i) => (
          <span key={i} className="h-4 w-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: c }} title={c} />
        ))}
        {colours.length > 6 && <span className="text-[10px] text-muted-foreground">+{colours.length - 6}</span>}
      </div>
    );
  };

  const ProductCard = ({ product }: { product: Product }) => (
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
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.is_featured && <Badge className="bg-secondary text-secondary-foreground text-[10px]">⭐ Featured</Badge>}
            {product.is_new_arrival && <Badge className="bg-green-600 text-white text-[10px]">✨ New</Badge>}
          </div>
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-foreground/0 opacity-0 transition-all group-hover:bg-foreground/20 group-hover:opacity-100">
            <Button size="sm" variant="secondary" className="h-9 w-9 rounded-full p-0" onClick={() => setSelectedProduct(product)}>
              <Eye className="h-4 w-4" />
            </Button>
            {isApproved && (
              <Button size="sm" className="h-9 w-9 rounded-full p-0 bg-primary" onClick={() => addToCart(product)} disabled={addingToCart === product.id}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardContent className="p-3 sm:p-4">
          <h3 className="font-display text-sm font-semibold text-foreground line-clamp-1 sm:text-base">{product.name}</h3>
          {product.fabric && <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{product.fabric}</p>}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px]"><Layers className="mr-0.5 h-3 w-3" />{product.pcs_per_set} pcs</Badge>
              <Badge variant="outline" className="text-[10px]">{product.sizes}</Badge>
            </div>
          </div>
          {isApproved && product.wsp && (
            <p className="mt-2 font-display text-base font-bold text-primary">₹{product.wsp} <span className="text-[10px] font-normal text-muted-foreground">WSP/pc</span></p>
          )}
          {!user && (
            <p className="mt-2 text-[11px] text-muted-foreground italic">
              <Link to="/login" className="text-primary underline">Login</Link> to see prices
            </p>
          )}
          {renderColourDots(product.available_colours)}
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setSelectedProduct(product)}>View Details</Button>
            {isApproved && (
              <Button size="sm" className="flex-1 text-xs" onClick={() => addToCart(product)} disabled={addingToCart === product.id}>
                {addingToCart === product.id ? "Adding..." : "Add to Cart"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading catalogues...</div>
      </div>
    );
  }

  return (
    <div className="pb-16 md:pb-0">
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

      <div className="container py-6 sm:py-10">
        {filtered.length === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No products found. Try a different search or category.</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featuredProducts.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 font-display text-lg font-bold text-foreground sm:text-xl">⭐ Featured Products</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}

            {/* New Arrivals */}
            {newArrivals.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-4 font-display text-lg font-bold text-foreground sm:text-xl">{t("new_arrivals.title")}</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}

            {/* All products */}
            {regularProducts.length > 0 && (
              <div>
                <h2 className="mb-4 font-display text-lg font-bold text-foreground sm:text-xl">All Products ({regularProducts.length})</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {regularProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
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
              <Button size="lg" variant="outline" asChild>
                <a href="https://wa.me/919831640808?text=Hi%20Suvee%20Fashion!%20I%27m%20interested%20in%20your%20wholesale%20kurtis." target="_blank" rel="noopener noreferrer">
                  💬 WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Product detail dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(o) => !o && setSelectedProduct(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-lg">{selectedProduct.name}</DialogTitle>
              </DialogHeader>
              {selectedProduct.image_url && (
                <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full rounded-lg object-cover aspect-square" />
              )}
              <div className="space-y-3 text-sm">
                {selectedProduct.description && <p className="text-muted-foreground">{selectedProduct.description}</p>}
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.fabric && <Badge variant="outline">{selectedProduct.fabric}</Badge>}
                  <Badge variant="outline"><Layers className="mr-1 h-3 w-3" />{selectedProduct.pcs_per_set} pcs/set</Badge>
                  <Badge variant="outline">{selectedProduct.sizes}</Badge>
                  {selectedProduct.bundle_type && <Badge variant="outline">{selectedProduct.bundle_type}</Badge>}
                </div>
                {selectedProduct.available_sizes && selectedProduct.available_sizes.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-foreground">Available Sizes:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedProduct.available_sizes.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedProduct.available_colours && selectedProduct.available_colours.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-foreground">Available Colours:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.available_colours.map((c, i) => (
                        <span key={i} className="h-6 w-6 rounded-full border border-border shadow-sm" style={{ backgroundColor: c }} title={c} />
                      ))}
                    </div>
                  </div>
                )}
                {selectedProduct.combo_description && (
                  <div>
                    <p className="text-xs font-semibold text-foreground">Combo Details:</p>
                    <p className="text-muted-foreground">{selectedProduct.combo_description}</p>
                  </div>
                )}
                {isApproved && selectedProduct.wsp && (
                  <p className="font-display text-xl font-bold text-primary">₹{selectedProduct.wsp} <span className="text-xs font-normal text-muted-foreground">WSP per piece</span></p>
                )}
                {!user && (
                  <p className="text-xs text-muted-foreground italic">
                    <Link to="/register" className="text-primary underline">Register as buyer</Link> to see wholesale prices
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                {isApproved && (
                  <Button className="flex-1" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                  </Button>
                )}
                <Button variant="outline" className="flex-1" asChild>
                  <a href="https://wa.me/919831640808?text=Hi%20Suvee!%20Interested%20in%20" + encodeURIComponent(selectedProduct.name) target="_blank" rel="noopener noreferrer">
                    💬 WhatsApp Inquiry
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
