import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, Search, Filter, ShoppingBag, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import casualImg from "@/assets/category-casual.jpg";
import festiveImg from "@/assets/category-festive.jpg";
import cottonImg from "@/assets/category-cotton.jpg";
import designerImg from "@/assets/category-designer.jpg";

const fallbackImages: Record<string, string> = {
  casual: casualImg,
  festive: festiveImg,
  cotton: cottonImg,
  designer: designerImg,
};

interface Product {
  id: string;
  name: string;
  fabric: string | null;
  sizes: string;
  moq: number;
  wsp: number | null;
  bulk_price_50: number | null;
  bulk_price_100: number | null;
  bulk_price_500: number | null;
  image_url: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  category_id: string | null;
  categories?: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  name_hi: string | null;
  name_bn: string | null;
  slug: string;
}

export default function Catalogues() {
  const { t, language } = useLanguage();
  const { user, buyerStatus } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryProduct, setInquiryProduct] = useState<string>("");
  const [inquiryForm, setInquiryForm] = useState({
    business_name: "",
    contact_person: "",
    phone: "",
    email: "",
    expected_quantity: "",
    message: "",
  });

  const canSeePrices = user && buyerStatus === "approved";

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("*").order("display_order"),
        supabase.from("products").select("*, categories(name, slug)"),
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

  const getProductImage = (product: Product) => {
    if (product.image_url) return product.image_url;
    const slug = product.categories?.slug ?? "casual";
    return fallbackImages[slug] ?? casualImg;
  };

  const filtered = products.filter((p) => {
    if (selectedCategory !== "all" && p.category_id !== selectedCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.business_name || !inquiryForm.contact_person || !inquiryForm.phone) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    // Save to DB
    const { error } = await supabase.from("inquiries").insert({
      ...inquiryForm,
      products_interested: inquiryProduct,
    });
    if (error) {
      toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
      return;
    }

    // Build WhatsApp message and redirect user
    const msg = `Hi Suvee Fashion! I'm interested in: *${inquiryProduct}*%0A%0A` +
      `Business: ${inquiryForm.business_name}%0A` +
      `Contact: ${inquiryForm.contact_person}%0A` +
      `Phone: ${inquiryForm.phone}%0A` +
      (inquiryForm.email ? `Email: ${inquiryForm.email}%0A` : "") +
      (inquiryForm.expected_quantity ? `Expected Qty: ${inquiryForm.expected_quantity}%0A` : "") +
      (inquiryForm.message ? `Message: ${inquiryForm.message}` : "");

    window.open(`https://wa.me/919831640808?text=${msg}`, "_blank");

    toast({ title: "Inquiry submitted!", description: "You're being redirected to WhatsApp." });
    setInquiryOpen(false);
    setInquiryForm({ business_name: "", contact_person: "", phone: "", email: "", expected_quantity: "", message: "" });
  };

  const addToCart = async (product: Product) => {
    if (!user) return;
    const { error } = await supabase.from("cart_items").upsert({
      user_id: user.id,
      product_id: product.id,
      quantity: product.moq,
    }, { onConflict: "user_id,product_id" });
    if (error) {
      toast({ title: "Failed to add to cart", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Added to cart! 🛒", description: `${product.name} (${product.moq} pcs)` });
    }
  };

  const requestSample = async (product: Product) => {
    if (!user) return;
    const { error } = await supabase.from("sample_requests").insert({
      user_id: user.id,
      product_id: product.id,
      product_name: product.name,
    });
    if (error) {
      if (error.message.includes("duplicate")) {
        toast({ title: "Sample already requested for this product" });
      } else {
        toast({ title: "Failed to request sample", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Sample requested! 🧪", description: `We'll process your request for ${product.name} shortly.` });
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="gradient-maroon py-12 md:py-16">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold text-white md:text-5xl">
            {t("categories.title")}
          </motion.h1>
        </div>
      </section>

      {/* Status banners */}
      {!user && (
        <section className="border-b border-border bg-accent">
          <div className="container flex flex-col items-center gap-3 py-4 text-center md:flex-row md:justify-between md:text-left">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium text-foreground">
                Want bulk order discounts? <span className="text-primary font-semibold">Register as a Suvee buyer</span> to see wholesale prices and place orders.
              </p>
            </div>
            <Button size="sm" asChild><Link to="/register">{t("cta.register_button")}</Link></Button>
          </div>
        </section>
      )}
      {user && buyerStatus === "pending" && (
        <section className="border-b border-border bg-accent">
          <div className="container flex items-center gap-2 py-4">
            <AlertCircle className="h-5 w-5 text-secondary" />
            <p className="text-sm font-medium text-foreground">Your account is under review. Our team will verify and approve within 24-48 hours.</p>
          </div>
        </section>
      )}
      {user && buyerStatus === "rejected" && (
        <section className="border-b border-border bg-destructive/10">
          <div className="container flex items-center gap-2 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm font-medium text-destructive">Your registration was not approved. Please contact us on WhatsApp for assistance.</p>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="border-b border-border bg-card py-4">
        <div className="container flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              maxLength={100}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{getCategoryName(cat)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg bg-muted" style={{ aspectRatio: "3/5" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">No products found</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group overflow-hidden border-0 shadow-md transition-shadow hover:shadow-xl">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute left-3 top-3 flex gap-1">
                        {product.categories && (
                          <Badge variant="secondary">{product.categories.name}</Badge>
                        )}
                        {product.is_new_arrival && <Badge className="gradient-gold text-foreground border-0">New</Badge>}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-display text-base font-semibold text-foreground">{product.name}</h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {product.fabric && <span>Fabric: {product.fabric}</span>}
                        <span>•</span>
                        <span>Sizes: {product.sizes}</span>
                        <span>•</span>
                        <span>MOQ: {product.moq} pcs</span>
                      </div>

                      {canSeePrices ? (
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">WSP: ₹{product.wsp}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {product.bulk_price_50 && <span>50+ pcs: ₹{product.bulk_price_50} </span>}
                            {product.bulk_price_100 && <span>• 100+: ₹{product.bulk_price_100} </span>}
                            {product.bulk_price_500 && <span>• 500+: ₹{product.bulk_price_500}</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 rounded-md bg-accent px-3 py-2">
                          <Lock className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-primary">
                            {user ? "Approval pending — prices hidden" : "Login to see wholesale price"}
                          </span>
                        </div>
                      )}

                      {!user ? (
                        <Dialog open={inquiryOpen && inquiryProduct === product.name} onOpenChange={(open) => { setInquiryOpen(open); if (open) setInquiryProduct(product.name); }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="mt-3 w-full">
                              <ShoppingBag className="mr-1 h-4 w-4" /> Express Interest
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="font-display">Express Interest — {product.name}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleInquiry} className="space-y-3">
                              <Input placeholder="Business Name *" value={inquiryForm.business_name} onChange={(e) => setInquiryForm({ ...inquiryForm, business_name: e.target.value })} maxLength={100} />
                              <Input placeholder="Contact Person *" value={inquiryForm.contact_person} onChange={(e) => setInquiryForm({ ...inquiryForm, contact_person: e.target.value })} maxLength={100} />
                              <Input placeholder="Phone *" value={inquiryForm.phone} onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })} maxLength={15} />
                              <Input placeholder="Email" value={inquiryForm.email} onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })} maxLength={255} />
                              <Input placeholder="Expected Quantity" value={inquiryForm.expected_quantity} onChange={(e) => setInquiryForm({ ...inquiryForm, expected_quantity: e.target.value })} maxLength={50} />
                              <Textarea placeholder="Message" value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} maxLength={500} />
                              <Button type="submit" className="w-full">Submit Inquiry</Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      ) : canSeePrices ? (
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" className="flex-1" onClick={() => addToCart(product)}>
                            <ShoppingBag className="mr-1 h-4 w-4" /> Add to Cart
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => requestSample(product)}>
                            Sample
                          </Button>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
