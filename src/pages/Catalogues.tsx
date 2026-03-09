import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

export default function Catalogues() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent">
          <Clock className="h-10 w-10 text-secondary" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Catalogues — Coming Soon! 🎉
        </h1>
        <p className="mt-4 text-muted-foreground">
          We're building something amazing! Our full digital catalogue with 850+ designs will be live soon. Meanwhile, ask Dada for business advice or connect on WhatsApp for orders.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:opacity-90" asChild>
            <Link to="/advisor">🧔 {t("nav.advisor")}</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="https://wa.me/919831640808?text=Hi%20Suvee%20Fashion!%20I%27m%20interested%20in%20your%20wholesale%20kurtis." target="_blank" rel="noopener noreferrer">
              💬 WhatsApp for Orders
            </a>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
