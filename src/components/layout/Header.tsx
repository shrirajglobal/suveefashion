import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Globe, Menu, LogOut, User, ShoppingCart, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Language } from "@/i18n/translations";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import logo from "@/assets/logo-final.png";

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "bn", label: "বাংলা", flag: "🇮🇳" },
];

export default function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { user, buyerStatus, isAdmin, isSubAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const navItems = [
    { path: "/", label: t("nav.home") },
    { path: "/catalogues", label: t("nav.catalogues") },
    { path: "/about", label: t("nav.about") },
    { path: "/contact", label: t("nav.contact") },
    { path: "/blog", label: t("nav.blog") },
    { path: "/advisor", label: t("nav.advisor") },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Fetch cart count for approved buyers
  useEffect(() => {
    if (user && buyerStatus === "approved") {
      supabase
        .from("cart_items")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .then(({ count }) => setCartCount(count ?? 0));
    } else {
      setCartCount(0);
    }
  }, [user, buyerStatus, location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Suvee Fashion" className="h-10 w-auto object-contain md:h-12" />
          <div className="hidden h-8 w-px bg-border sm:block" />
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
            Kurtis &amp; more
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(item.path) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"} ${item.path === "/advisor" ? "flex items-center gap-1.5" : ""}`}>
              {item.path === "/advisor" ? (
                <>🧔 {item.label} <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-600">FREE</span></>
              ) : item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 text-sm">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{languages.find((l) => l.code === language)?.flag}</span>
            </Button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-border bg-popover p-1 shadow-lg">
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => { setLanguage(lang.code); setLangOpen(false); }} className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${language === lang.code ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}>
                    <span>{lang.flag}</span><span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cart icon for approved buyers */}
          {user && buyerStatus === "approved" && (
            <Button variant="ghost" size="sm" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
          )}

          {/* Auth buttons */}
          {user ? (
            <div className="hidden items-center gap-1 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard"><LayoutDashboard className="h-4 w-4" /></Link>
              </Button>
              {(isAdmin || isSubAdmin) && (
                <Button variant="outline" size="sm" asChild><Link to="/admin">Admin</Link></Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="h-4 w-4" /></Button>
            </div>
          ) : (
            <Button variant="default" size="sm" className="hidden md:inline-flex" asChild>
              <Link to="/login">{t("nav.login")}</Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="font-display text-lg">Menu</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={`rounded-md px-4 py-3 text-sm font-medium transition-colors ${isActive(item.path) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"} ${item.path === "/advisor" ? "flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 font-bold" : ""}`}>
                    {item.path === "/advisor" ? (
                      <>🧔 {item.label} <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-bold text-green-600">FREE</span></>
                    ) : item.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-md px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted">Dashboard</Link>
                    {buyerStatus === "approved" && (
                      <Link to="/cart" onClick={() => setMobileOpen(false)} className="rounded-md px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted">
                        Cart {cartCount > 0 && `(${cartCount})`}
                      </Link>
                    )}
                    {(isAdmin || isSubAdmin) && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded-md px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted">Admin Panel</Link>
                    )}
                    <Button variant="outline" className="mt-4" onClick={() => { handleSignOut(); setMobileOpen(false); }}>Sign Out</Button>
                  </>
                ) : (
                  <Button variant="default" className="mt-4" asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>{t("nav.login")}</Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
