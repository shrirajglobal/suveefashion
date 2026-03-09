import { Link, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const HIDDEN_PATHS = ["/advisor", "/cart", "/admin", "/login", "/register", "/dashboard"];

export default function MobileCTABar() {
  const location = useLocation();
  const { t } = useLanguage();

  if (HIDDEN_PATHS.some((p) => location.pathname.startsWith(p))) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur p-2 md:hidden">
      <div className="flex gap-2">
        <Link
          to="/advisor"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-bold text-white"
        >
          🧔 {t("nav.advisor")}
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">FREE</span>
        </Link>
        <a
          href="https://wa.me/919831640808?text=Hi%20Suvee%20Fashion!"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 py-3 text-sm font-semibold text-white"
        >
          💬 WhatsApp Us
        </a>
      </div>
    </div>
  );
}
