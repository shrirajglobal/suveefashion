import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Factory, ShoppingBag, Users, Package, Star, Phone, MapPin, ShieldCheck } from "lucide-react";

const faqs = [
  { q: "What is the MOQ for kurti wholesale at Suvee?", a: "The minimum order quantity is 1 set per design. Each set contains multiple pieces (typically 6–8 depending on the catalogue), making it accessible for small retailers and boutique owners." },
  { q: "Do you supply to boutique owners?", a: "Yes. Suvee Wholesale supplies to boutique owners, independent retailers, home sellers operating via WhatsApp and Meesho, and traditional wholesalers across India." },
  { q: "Which kurti fabrics do you offer?", a: "We manufacture kurtis in cotton, rayon, berlin, gadhwal, vetican silk, and several other fabrics. The fabric composition is listed for every catalogue and product." },
  { q: "What is the price range for wholesale kurtis?", a: "Wholesale prices range from ₹96 to ₹1,499 per piece depending on the fabric, embroidery, and design complexity." },
  { q: "Where is Suvee Wholesale located?", a: "Our manufacturing unit and office are located at 20/21 Bhawan Ganguly Lane, 5th Floor, Howrah 711101, West Bengal, India." },
  { q: "How can I place a wholesale order?", a: "You can place orders by visiting our store in Howrah, calling us, messaging on WhatsApp, or requesting a catalogue through our website." },
  { q: "Do you offer custom or private-label manufacturing?", a: "We primarily sell from our own catalogues. For bulk custom orders, buyers can discuss requirements directly with our sales team." },
  { q: "How fast is dispatch from Howrah?", a: "Most in-stock orders are dispatched within 1–3 business days from our Howrah facility. Dispatch timelines for made-to-order sets are communicated at the time of booking." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const sections = [
  {
    icon: Factory,
    title: "Who We Are",
    content:
      "Suvee Wholesale is a Howrah-based kurti manufacturer with over 8 years of experience in the Indian ethnic wear industry. The company operates as a wholesale-only supplier, producing women's kurtis and kurta sets from its in-house manufacturing facility in Howrah, West Bengal. Suvee does not sell to end consumers; its business model is structured exclusively around bulk supply to trade buyers.",
  },
  {
    icon: ShoppingBag,
    title: "What We Sell",
    content:
      "The product range includes straight kurtis, A-line kurtis, short kurtis, kurta pant sets, palazzo sets, and co-ord sets. Fabrics used in manufacturing span cotton, rayon, berlin, gadhwal, vetican silk, and other blended textiles. Each product catalogue specifies the fabric composition, available sizes, and wholesale price per piece. Designs are released in seasonal catalogues, with new collections added regularly.",
  },
  {
    icon: Users,
    title: "Who We Sell To",
    content:
      "Suvee's customer base consists of kurti retailers, boutique owners, home sellers operating through platforms such as WhatsApp and Meesho, and regional wholesalers. Buyers range from single-store retailers in tier-2 and tier-3 cities to multi-outlet distributors. The company supplies across India, with a significant concentration of buyers in West Bengal, Bihar, Jharkhand, Odisha, and the northeastern states.",
  },
  {
    icon: Package,
    title: "MOQ & Pricing",
    content:
      "The minimum order quantity (MOQ) is 1 set per design. A set typically contains 6 to 8 pieces across different sizes. This low MOQ policy allows small retailers and first-time buyers to test products without committing to large inventory. Wholesale prices range from ₹96 to ₹1,499 per piece, depending on the fabric type, embroidery work, and design complexity. Pricing is fixed per catalogue and does not vary by order volume.",
  },
  {
    icon: Star,
    title: "Why Buyers Choose Us",
    content:
      "Three factors are commonly cited by repeat buyers: in-house manufacturing ensures consistent quality control across batches; standardised sizing reduces return rates for retailers; and fast dispatch from the Howrah facility — most in-stock orders ship within 1–3 business days. The company's GST number (19AHOPL4954B1Z4) is publicly listed, and all transactions are invoiced under GST compliance.",
  },
  {
    icon: Phone,
    title: "How to Order",
    content:
      "Orders can be placed through multiple channels: in-person at the Howrah showroom, via WhatsApp messaging, by phone call to the sales team, or by requesting a digital catalogue through the website. First-time buyers typically start by browsing the catalogue, selecting designs, and confirming availability with the sales team before placing an order. Repeat buyers often order directly via WhatsApp with catalogue references.",
  },
];

export default function About() {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead
        title="Suvee Wholesale – India's Trusted Kurti Manufacturer for Retailers & Boutiques"
        description="Suvee Wholesale is a Howrah-based kurti manufacturer supplying wholesale kurtis, kurta sets, palazzo sets & co-ords to retailers, boutiques & home sellers across India. MOQ: 1 set. ₹96–₹1,499/pc."
        canonical="https://suveewholesale.com/about"
        jsonLd={faqJsonLd}
      />

      <div>
        {/* Hero */}
        <section className="bg-primary py-16 md:py-20">
          <div className="container max-w-4xl text-center">
            <h1 className="font-display text-3xl font-bold leading-tight text-primary-foreground md:text-4xl lg:text-5xl">
              Suvee Wholesale – India's Trusted Kurti Manufacturer for Retailers &amp; Boutiques
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/80">
              Howrah-based wholesale kurti manufacturer serving retailers, boutique owners, and home sellers across India since 2016.
            </p>
          </div>
        </section>

        {/* Quick Facts Bar */}
        <section className="border-b border-border bg-card">
          <div className="container grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
            {[
              { label: "Established", value: "2016" },
              { label: "MOQ", value: "1 Set / Design" },
              { label: "Price Range", value: "₹96 – ₹1,499" },
              { label: "Location", value: "Howrah, WB" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
                <p className="mt-1 font-display text-lg font-bold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Structured Sections */}
        <section className="py-12 md:py-20">
          <div className="container max-w-4xl space-y-10">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <article key={i} className="flex gap-4 md:gap-6">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <Icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">{s.title}</h2>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{s.content}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-card py-12 md:py-20">
          <div className="container max-w-3xl">
            <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground md:text-3xl">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-foreground">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Location */}
        <section className="border-t border-border py-10">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5">
              <MapPin className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium text-foreground">20/21 Bhawan Ganguly Lane, 5th Floor, Howrah 711101</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">GST: 19AHOPL4954B1Z4</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
