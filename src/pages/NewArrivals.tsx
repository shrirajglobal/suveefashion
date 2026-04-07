import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Package, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { SITE_URL } from "@/lib/constants";

interface ArrivalOverride {
  productId: string;
  priceRange?: string;
  moq?: string;
}

interface Product {
  id: string;
  name: string;
  fabric: string | null;
  image_url: string | null;
  wsp: number | null;
  pcs_per_set: number;
  sizes: string;
  description: string | null;
}

interface MergedProduct extends Product {
  priceRange: string;
  moq: string;
}

function mergeProducts(products: Product[], overrides: ArrivalOverride[]): MergedProduct[] {
  const overrideMap = new Map(overrides.map(o => [o.productId, o]));
  return products.map(p => {
    const o = overrideMap.get(p.id);
    return {
      ...p,
      priceRange: o?.priceRange || (p.wsp ? `₹${p.wsp} per piece` : "Contact for price"),
      moq: o?.moq || `1 Set (${p.pcs_per_set} pcs)`,
    };
  });
}

function whatsappUrl(productName: string) {
  const text = `Hi Suvee, I'm interested in "${productName}" from your new arrivals. Please share details and catalogue.`;
  return `https://wa.me/919831640808?text=${encodeURIComponent(text)}`;
}

export function NewArrivalCard({ product, user, buyerStatus }: { product: MergedProduct; user: any; buyerStatus: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">No Image</div>
          )}
          <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-[10px]">
            <Sparkles className="h-3 w-3 mr-1" /> New
          </Badge>
        </div>
        <CardContent className="p-3 sm:p-4 flex flex-col flex-1 gap-2">
          <h3 className="font-display text-sm font-semibold text-foreground line-clamp-2 sm:text-base">{product.name}</h3>
          <div className="flex flex-wrap gap-1.5">
            {product.fabric && (
              <Badge variant="outline" className="text-[10px] sm:text-xs font-normal">{product.fabric}</Badge>
            )}
            <Badge variant="outline" className="text-[10px] sm:text-xs font-normal">
              <Package className="h-3 w-3 mr-0.5" /> {product.moq}
            </Badge>
          </div>
          {buyerStatus === "approved" ? (
            <p className="text-sm font-bold text-primary mt-auto">{product.priceRange}</p>
          ) : !user ? (
            <Link to="/login" className="text-sm font-medium text-primary hover:underline mt-auto">Login to see prices</Link>
          ) : (
            <p className="text-sm text-muted-foreground mt-auto">Approval pending</p>
          )}
          <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white mt-1" asChild>
            <a href={whatsappUrl(product.name)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4 mr-1.5" /> Get Catalogue
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function NewArrivals() {
  const [products, setProducts] = useState<MergedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: dbProducts }, overridesRes] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, fabric, image_url, wsp, pcs_per_set, sizes, description")
          .eq("is_new_arrival", true)
          .order("created_at", { ascending: false }),
        fetch("/data/arrivals.json").then(r => r.json()).catch(() => [] as ArrivalOverride[]),
      ]);
      if (dbProducts) {
        setProducts(mergeProducts(dbProducts as Product[], overridesRes));
      }
      setLoading(false);
    }
    load();
  }, []);

  const jsonLd = products.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        description: p.description || `${p.name} — wholesale kurti from Suvee Wholesale`,
        brand: { "@type": "Brand", name: "Suvee Wholesale" },
        image: p.image_url,
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: p.wsp || 0,
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: "Suvee Wholesale" },
        },
      },
    })),
  } : undefined;

  return (
    <div className="pb-16 md:pb-0">
      <SEOHead
        title="New Arrivals — Latest Kurti Designs | Suvee Wholesale"
        description="Explore the latest kurti designs from Suvee Wholesale, Howrah. Cotton, rayon & silk kurtis at wholesale prices. MOQ 1 set. Fast dispatch across India."
        canonical={`${SITE_URL}/new-arrivals`}
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent py-10 sm:py-16">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30">
              <Sparkles className="h-3 w-3 mr-1" /> Fresh This Season
            </Badge>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
              New Arrivals — Latest Kurti Designs
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Discover our freshest wholesale kurti collections. Updated every season with trending styles, premium fabrics, and unbeatable wholesale pricing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-10 sm:py-16">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/5] animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground">No new arrivals at the moment. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map(p => (
                <NewArrivalCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-accent/30 py-10 sm:py-14">
        <div className="container text-center">
          <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">Want the Full Catalogue?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Message us on WhatsApp and get our complete digital catalogue with 850+ designs.</p>
          <Button size="lg" className="mt-5 bg-green-600 hover:bg-green-700 text-white" asChild>
            <a href="https://wa.me/919831640808?text=Hi%20Suvee%2C%20I%20want%20your%20full%20wholesale%20catalogue" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 mr-2" /> Get Full Catalogue on WhatsApp
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
