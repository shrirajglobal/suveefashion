import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Phone, Mail } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-maroon">
                <span className="font-display text-base font-bold text-primary-foreground">S</span>
              </div>
              <span className="font-display text-lg font-bold text-foreground">Suvee Fashion</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t("footer.tagline")}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                ✓ {t("footer.gst")}
              </span>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                ✓ 500+ Retailers
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              {t("footer.quick_links")}
            </h4>
            <nav className="mt-4 flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.home")}</Link>
              <Link to="/catalogues" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.catalogues")}</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.about")}</Link>
              <Link to="/advisor" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("nav.advisor")}</Link>
              <Link to="/delivery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Delivery Info</Link>
            </nav>
          </div>

          {/* For Buyers */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              For Buyers
            </h4>
            <nav className="mt-4 flex flex-col gap-2">
              <Link to="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Register as Buyer</Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Buyer Login</Link>
              <Link to="/delivery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shipping & Delivery</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Bulk Order Inquiry</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              {t("footer.contact_us")}
            </h4>
            <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
              <p>{t("contact.address")}</p>
              <a href="tel:+919831640808" className="inline-flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="h-4 w-4" /> +91 98316 40808
              </a>
              <a href="mailto:suvee.fashion@gmail.com" className="inline-flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" /> suvee.fashion@gmail.com
              </a>
              <a
                href="https://wa.me/919831640808"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-green-600 hover:underline"
              >
                💬 {t("contact.whatsapp")}
              </a>
              <a
                href="https://youtube.com/@suveefashion"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-red-600 hover:underline"
              >
                ▶ YouTube Channel
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Suvee Fashion. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
