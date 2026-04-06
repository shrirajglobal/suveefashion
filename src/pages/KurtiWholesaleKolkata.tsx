import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Factory, Zap, MessageCircle, Palette, Store, Home, ShoppingBag, Repeat } from "lucide-react";

import kurtisImg from "@/assets/kurti-types/kurtis.jpg";
import pantSetImg from "@/assets/kurti-types/pant-set.jpg";
import dupattaSetImg from "@/assets/kurti-types/dupatta-set.jpg";
import shortKurtiImg from "@/assets/kurti-types/short-kurti.jpg";
import anarkaliImg from "@/assets/kurti-types/anarkali.jpg";
import straightCutImg from "@/assets/kurti-types/straight-cut.jpg";
import palazzoSetImg from "@/assets/kurti-types/palazzo-set.jpg";
import coOrdsImg from "@/assets/kurti-types/co-ords.jpg";

const WA_LINK = "https://wa.me/919831640808?text=Hi%20Suvee%2C%20I%20want%20your%20wholesale%20catalogue";

const productTypes = [
  { name: "Kurtis / Kurtas", img: kurtisImg },
  { name: "Pant Set", img: pantSetImg },
  { name: "Dupatta Set", img: dupattaSetImg },
  { name: "Short Kurti", img: shortKurtiImg },
  { name: "Anarkali", img: anarkaliImg },
  { name: "Straight-Cut", img: straightCutImg },
  { name: "Palazzo Set", img: palazzoSetImg },
  { name: "Co-Ords", img: coOrdsImg },
];

const audiences = [
  { icon: Store, label: "Kurti Retailers", desc: "Brick-and-mortar shop owners looking for consistent wholesale supply." },
  { icon: ShoppingBag, label: "Boutique Owners", desc: "Curated boutiques seeking unique designs at manufacturer prices." },
  { icon: Home, label: "Home Sellers", desc: "WhatsApp & Meesho sellers building a kurti business from home." },
  { icon: Repeat, label: "Wholesalers & Resellers", desc: "Bulk buyers redistributing across tier-2 and tier-3 cities." },
];

const whySuvee = [
  { icon: Factory, title: "In-House Manufacturing", desc: "Complete control over quality, sizing, and production timelines from our Howrah factory." },
  { icon: Palette, title: "850+ Designs / Season", desc: "Fresh catalogues every season across cotton, rayon, berlin, gadhwal & vetican silk." },
  { icon: Zap, title: "Fast Dispatch", desc: "Most in-stock orders dispatched within 1–3 business days from Howrah." },
  { icon: MessageCircle, title: "WhatsApp Support", desc: "Order, track, and get catalogue updates directly on WhatsApp — no app needed." },
];

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Suvee Wholesale",
  description: "Kurti wholesale supplier and manufacturer in Kolkata / Howrah, West Bengal. MOQ 1 set per design.",
  url: "https://suveewholesale.com",
  telephone: "+919831640808",
  address: {
    "@type": "PostalAddress",
    streetAddress: "20/21 Bhawan Ganguly Lane, 5th Floor",
    addressLocality: "Howrah",
    addressRegion: "West Bengal",
    postalCode: "711101",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 22.5958,
    longitude: 88.3119,
  },
  openingHours: "Mo-Sa 10:00-19:00",
  priceRange: "₹96–₹1499",
  image: "https://suveewholesale.com/og-default.jpg",
};

export default function KurtiWholesaleKolkata() {
  return (
    <>
      <SEOHead
        title="Kurti Wholesale Supplier Kolkata – Suvee Wholesale | MOQ 1 Set"
        description="Suvee Wholesale is a Howrah-based kurti manufacturer supplying wholesale kurtis, kurta sets & co-ords to retailers & boutiques. MOQ 1 set. ₹96–₹1,499/pc."
        canonical="https://suveewholesale.com/kurti-wholesale-supplier-kolkata"
        jsonLd={localBusinessJsonLd}
      />

      <div>
        {/* Hero */}
        <section className="bg-primary py-20 md:py-28">
          <div className="container max-w-4xl text-center">
            <h1 className="font-display text-3xl font-bold leading-tight text-primary-foreground md:text-4xl lg:text-5xl">
              Kurti Wholesale Supplier in Kolkata &amp; West Bengal | Suvee Wholesale
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/90 md:text-xl">
              Direct from Manufacturer. No Middleman. MOQ 1 Set.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1ebe57]"
              >
                <MessageCircle className="h-5 w-5" />
                Get Wholesale Catalogue
              </a>
              <Link
                to="/catalogues"
                className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
              >
                Browse Catalogues
              </Link>
            </div>
          </div>
        </section>

        {/* Product Types */}
        <section className="py-14 md:py-20">
          <div className="container">
            <h2 className="mb-10 text-center font-display text-2xl font-bold text-foreground md:text-3xl">
              Types of Kurtis We Supply
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
              {productTypes.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group overflow-hidden border-0 shadow-md transition hover:shadow-xl">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={p.img}
                        alt={`${p.name} wholesale supplier Kolkata`}
                        width={640}
                        height={640}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-3 text-center">
                      <p className="font-display text-sm font-semibold text-foreground md:text-base">{p.name}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Who This Is For */}
        <section className="border-y border-border bg-card py-14 md:py-20">
          <div className="container max-w-5xl">
            <h2 className="mb-10 text-center font-display text-2xl font-bold text-foreground md:text-3xl">
              Who We Supply To
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map((a, i) => {
                const Icon = a.icon;
                return (
                  <motion.div
                    key={a.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="h-full border-0 shadow-md">
                      <CardContent className="flex flex-col items-center p-6 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                          <Icon className="h-6 w-6 text-accent-foreground" />
                        </div>
                        <h3 className="font-display text-base font-semibold text-foreground">{a.label}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Suvee */}
        <section className="py-14 md:py-20">
          <div className="container max-w-5xl">
            <h2 className="mb-10 text-center font-display text-2xl font-bold text-foreground md:text-3xl">
              Why Retailers Choose Suvee
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {whySuvee.map((w, i) => {
                const Icon = w.icon;
                return (
                  <motion.div
                    key={w.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex gap-4"
                  >
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                      <Icon className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{w.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{w.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-14">
          <div className="container max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
              Ready to Stock Suvee Kurtis?
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Get the latest catalogue on WhatsApp. No registration needed.
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-[#1ebe57]"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp Us Now
            </a>
          </div>
        </section>

        {/* Sticky WhatsApp Button */}
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-xl transition hover:scale-110 md:bottom-6"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-7 w-7 text-white" />
        </a>
      </div>
    </>
  );
}
