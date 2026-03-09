import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import casualImg from "@/assets/category-casual.jpg";
import festiveImg from "@/assets/category-festive.jpg";
import cottonImg from "@/assets/category-cotton.jpg";
import designerImg from "@/assets/category-designer.jpg";

const sampleProducts = [
  { name: "Summer Breeze Cotton Kurti", category: "Cotton", fabric: "Pure Cotton", sizes: "S-XXL", moq: 50, img: cottonImg },
  { name: "Royal Embroidered Festive Kurti", category: "Festive", fabric: "Silk Blend", sizes: "S-XL", moq: 30, img: festiveImg },
  { name: "Everyday Comfort Kurti", category: "Casual", fabric: "Rayon", sizes: "S-3XL", moq: 100, img: casualImg },
  { name: "Designer Zari Work Kurti", category: "Designer", fabric: "Georgette", sizes: "S-XXL", moq: 25, img: designerImg },
  { name: "Pastel Dream Kurti Set", category: "Casual", fabric: "Cotton Blend", sizes: "S-XXL", moq: 50, img: casualImg },
  { name: "Bridal Maroon Heavy Kurti", category: "Festive", fabric: "Velvet", sizes: "S-XL", moq: 20, img: festiveImg },
];

export default function Catalogues() {
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero */}
      <section className="gradient-maroon py-12 md:py-16">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold text-white md:text-5xl">
            {t("categories.title")}
          </motion.h1>
          <p className="mx-auto mt-3 max-w-xl text-white/80 text-sm md:text-base">
            Browse our premium kurti collection. Register to see wholesale prices.
          </p>
        </div>
      </section>

      {/* Registration Banner */}
      <section className="border-b border-border bg-accent">
        <div className="container flex flex-col items-center gap-3 py-4 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-foreground">
              Want bulk order discounts? <span className="text-primary font-semibold">Register as a Suvee buyer</span> to see wholesale prices and place orders.
            </p>
          </div>
          <Button size="sm" asChild>
            <Link to="/register">{t("cta.register_button")}</Link>
          </Button>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleProducts.map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="group overflow-hidden border-0 shadow-md transition-shadow hover:shadow-xl">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <Badge className="absolute left-3 top-3" variant="secondary">
                      {product.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-display text-base font-semibold text-foreground">{product.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Fabric: {product.fabric}</span>
                      <span>•</span>
                      <span>Sizes: {product.sizes}</span>
                      <span>•</span>
                      <span>MOQ: {product.moq} pcs</span>
                    </div>
                    {/* Price Hidden */}
                    <div className="mt-3 flex items-center gap-2 rounded-md bg-accent px-3 py-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        Login to see wholesale price
                      </span>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                      <Link to="/contact">Express Interest</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
