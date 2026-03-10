import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Calendar, Tag, Share2, MessageCircle, Copy, Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  title_hi: string | null;
  title_bn: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_hi: string | null;
  excerpt_bn: string | null;
  cover_image_url: string | null;
  category: string | null;
  published_at: string | null;
  keywords: string[] | null;
}

const CATEGORIES = [
  { value: "all", label: "All", labelHi: "सभी", labelBn: "সব" },
  { value: "business-tips", label: "Business Tips", labelHi: "बिजनेस टिप्स", labelBn: "ব্যবসা টিপস" },
  { value: "seasonal-trends", label: "Seasonal Trends", labelHi: "सीज़नल ट्रेंड्स", labelBn: "মরসুমী ট্রেন্ড" },
  { value: "fabric-guide", label: "Fabric Guide", labelHi: "फैब्रिक गाइड", labelBn: "ফ্যাব্রিক গাইড" },
  { value: "marketing", label: "Marketing", labelHi: "मार्केटिंग", labelBn: "মার্কেটিং" },
  { value: "pricing", label: "Pricing", labelHi: "प्राइसिंग", labelBn: "প্রাইসিং" },
  { value: "inventory", label: "Inventory", labelHi: "इन्वेंटरी", labelBn: "ইনভেন্টরি" },
  { value: "starting-business", label: "Starting Out", labelHi: "शुरुआत", labelBn: "শুরু করা" },
];

export default function Blog() {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, title_hi, title_bn, slug, excerpt, excerpt_hi, excerpt_bn, cover_image_url, category, published_at, keywords")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setPosts((data as BlogPost[]) || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const getTitle = (p: BlogPost) =>
    language === "hi" ? (p.title_hi || p.title) : language === "bn" ? (p.title_bn || p.title) : p.title;

  const getExcerpt = (p: BlogPost) =>
    language === "hi" ? (p.excerpt_hi || p.excerpt) : language === "bn" ? (p.excerpt_bn || p.excerpt) : p.excerpt;

  const filtered = posts.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = !search || getTitle(p).toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const shareWhatsApp = (p: BlogPost) => {
    const url = `${window.location.origin}/blog/${p.slug}`;
    const text = `📖 ${getTitle(p)}\n\n${getExcerpt(p) || ""}\n\nRead more: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const copyLink = (p: BlogPost) => {
    navigator.clipboard.writeText(`${window.location.origin}/blog/${p.slug}`);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCatLabel = (cat: (typeof CATEGORIES)[0]) =>
    language === "hi" ? cat.labelHi : language === "bn" ? cat.labelBn : cat.label;

  const seoTitle = language === "hi" ? "ब्लॉग — Suvee Fashion" : language === "bn" ? "ব্লগ — Suvee Fashion" : "Blog — Kurti Business Tips | Suvee Fashion";
  const seoDesc = "Expert tips for kurti retailers: business advice, seasonal trends, fabric guides, pricing strategies and more from Suvee Fashion, Kolkata.";

  return (
    <div>
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        canonical="https://suveefashion.lovable.app/blog"
      />

      {/* Hero */}
      <section className="gradient-maroon py-12 md:py-20">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-white md:text-5xl">
              {language === "hi" ? "कुर्ती बिजनेस ब्लॉग" : language === "bn" ? "কুর্তি ব্যবসা ব্লগ" : "Kurti Business Blog"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 md:text-base">
              {language === "hi" ? "रिटेलर्स के लिए प्रैक्टिकल टिप्स, ट्रेंड्स और बिजनेस एडवाइस" : language === "bn" ? "খুচরা বিক্রেতাদের জন্য ব্যবহারিক টিপস, ট্রেন্ড এবং ব্যবসায়িক পরামর্শ" : "Practical tips, trends & business advice for kurti retailers"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-card py-4">
        <div className="container">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeCategory === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {getCatLabel(cat)}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={language === "hi" ? "ब्लॉग खोजें..." : language === "bn" ? "ব্লগ খুঁজুন..." : "Search articles..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-10 md:py-16">
        <div className="container">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">
                {language === "hi" ? "कोई ब्लॉग पोस्ट नहीं मिला" : language === "bn" ? "কোনো ব্লগ পোস্ট পাওয়া যায়নি" : "No blog posts found"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {language === "hi" ? "जल्द ही नए आर्टिकल आ रहे हैं!" : language === "bn" ? "শীঘ্রই নতুন আর্টিকেল আসছে!" : "New articles coming soon!"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow">
                    <Link to={`/blog/${post.slug}`}>
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        {post.cover_image_url ? (
                          <img
                            src={post.cover_image_url}
                            alt={getTitle(post)}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                            <span className="text-4xl">📝</span>
                          </div>
                        )}
                        {post.category && (
                          <Badge className="absolute left-3 top-3 bg-primary/90 text-primary-foreground text-[10px]">
                            {CATEGORIES.find((c) => c.value === post.category)?.label || post.category}
                          </Badge>
                        )}
                      </div>
                    </Link>
                    <CardContent className="flex flex-col gap-2 p-4">
                      <Link to={`/blog/${post.slug}`}>
                        <h3 className="font-display text-base font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors sm:text-lg">
                          {getTitle(post)}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-2 sm:text-sm">
                        {getExcerpt(post)}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
                          <Calendar className="h-3 w-3" />
                          {post.published_at ? format(new Date(post.published_at), "dd MMM yyyy") : ""}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.preventDefault(); shareWhatsApp(post); }}
                            className="rounded-full p-1.5 text-muted-foreground hover:bg-green-50 hover:text-green-600 transition-colors"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); copyLink(post); }}
                            className="rounded-full p-1.5 text-muted-foreground hover:bg-accent transition-colors"
                            title="Copy link"
                          >
                            {copiedId === post.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
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
