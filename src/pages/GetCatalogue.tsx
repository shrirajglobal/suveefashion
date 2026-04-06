import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LeadCaptureForm from "@/components/LeadCaptureForm";
import SEOHead from "@/components/SEOHead";
import { SITE_URL } from "@/lib/constants";

export default function GetCatalogue() {
  return (
    <div className="pb-16 md:pb-0">
      <SEOHead
        title="Get Free Kurti Wholesale Catalogue | Suvee Wholesale"
        description="Request Suvee Wholesale's latest kurti catalogue on WhatsApp. 850+ designs, cotton to silk, MOQ 1 set. For retailers, boutiques & home sellers across India."
        canonical={`${SITE_URL}/get-catalogue`}
      />

      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent py-10 sm:py-16 md:py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl text-center"
          >
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30">
              <Sparkles className="h-3 w-3 mr-1" /> Free Catalogue
            </Badge>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              Get Your Free Kurti Wholesale Catalogue
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Fill in your details and receive our complete digital catalogue with 850+ designs directly on WhatsApp. No registration required.
            </p>
          </motion.div>

          <div className="mt-8">
            <LeadCaptureForm />
          </div>

          {/* Trust points */}
          <div className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-3 text-center text-xs text-muted-foreground sm:grid-cols-4 sm:text-sm">
            {["850+ Designs", "MOQ 1 Set", "Pan-India Delivery", "No Spam"].map((item) => (
              <div key={item} className="rounded-lg border border-border bg-card/50 px-3 py-2 font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
