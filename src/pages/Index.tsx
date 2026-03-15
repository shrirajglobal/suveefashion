import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Palette, Clock, Truck, Star, Quote, Sparkles, ShieldCheck, Phone, CheckCircle, Play, MessageCircle, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import factoryImage from "@/assets/factory.jpg";
import SEOHead from "@/components/SEOHead";
import { SITE_URL } from "@/lib/constants";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const testimonials = [
  {
    name: "Rajesh Kumar",
    city: "Delhi",
    text: { en: "Suvee Fashion has been our trusted supplier for 5 years. Their quality and consistency is unmatched.", hi: "सुवी फैशन 5 साल से हमारा भरोसेमंद सप्लायर है। उनकी क्वालिटी और कंसिस्टेंसी बेजोड़ है।", bn: "সুভি ফ্যাশন ৫ বছর ধরে আমাদের বিশ্বস্ত সরবরাহকারী। তাদের গুণমান এবং ধারাবাহিকতা অতুলনীয়।" },
  },
  {
    name: "Priya Sharma",
    city: "Mumbai",
    text: { en: "The festive collections always sell out quickly. My customers love the embroidery work.", hi: "फेस्टिव कलेक्शन हमेशा जल्दी बिक जाते हैं। मेरे कस्टमर्स एम्ब्रॉयडरी वर्क पसंद करते हैं।", bn: "উৎসবের কালেকশন সবসময় দ্রুত বিক্রি হয়। আমার গ্রাহকরা এমব্রয়ডারি কাজ পছন্দ করেন।" },
  },
  {
    name: "Amit Ghosh",
    city: "Kolkata",
    text: { en: "Best wholesale rates in the market with genuine quality. Delivery is always on time.", hi: "बाजार में बेस्ट होलसेल रेट्स और असली क्वालिटी। डिलीवरी हमेशा समय पर होती है।", bn: "বাজারে সেরা পাইকারি দাম এবং আসল গুণমান। ডেলিভারি সবসময় সময়মতো হয়।" },
  },
];

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

const stats = [
  { icon: Users, key: "about.stat_retailers" as const },
  { icon: Palette, key: "about.stat_designs" as const },
  { icon: Clock, key: "about.stat_years" as const },
  { icon: Truck, key: "about.stat_cities" as const },
];

interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface BlogPostPreview {
  id: string;
  title: string;
  title_hi: string | null;
  title_bn: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_hi: string | null;
  excerpt_bn: string | null;
  category: string | null;
  published_at: string | null;
  cover_image_url: string | null;
}

function YouTubeCard({ video }: { video: YouTubeVideo }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl">
        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
          title={video.title}
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <button onClick={() => setPlaying(true)} className="group relative aspect-video w-full overflow-hidden rounded-xl">
      <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
      <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 transition-colors group-hover:bg-foreground/30">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive shadow-lg transition-transform group-hover:scale-110">
          <Play className="h-6 w-6 fill-white text-white" />
        </div>
      </div>
      <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-3 text-left text-xs font-medium text-white line-clamp-2">
        {video.title}
      </p>
    </button>
  );
}

export default function Index() {
  const { t, language } = useLanguage();
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPostPreview[]>([]);
  const [heroSlides, setHeroSlides] = useState<string[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [ytEmblaRef] = useEmblaCarousel({ loop: false, align: "start", slidesToScroll: 1 });
  const [heroEmblaRef, heroApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [catEmblaRef, catApi] = useEmblaCarousel({ loop: true, align: "start", slidesToScroll: 2 });
  const [canScrollCatPrev, setCanScrollCatPrev] = useState(false);
  const [canScrollCatNext, setCanScrollCatNext] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    supabase
      .from("hero_banners")
      .select("image_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setHeroSlides(data.map(b => b.image_url));
        }
      });
  }, []);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setDbCategories(data as Category[]);
        }
      });
  }, []);

  useEffect(() => {
    if (!catApi) return;
    const onSelect = () => {
      setCanScrollCatPrev(catApi.canScrollPrev());
      setCanScrollCatNext(catApi.canScrollNext());
    };
    catApi.on("select", onSelect);
    catApi.on("reInit", onSelect);
    onSelect();
    return () => { catApi.off("select", onSelect); catApi.off("reInit", onSelect); };
  }, [catApi]);

  useEffect(() => {
    if (!heroApi) return;
    const onSelect = () => setActiveSlide(heroApi.selectedScrollSnap());
    heroApi.on("select", onSelect);
    onSelect();
    return () => { heroApi.off("select", onSelect); };
  }, [heroApi]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("youtube-feed");
        if (!error && data?.videos?.length) {
          setYoutubeVideos(data.videos);
        }
      } catch {}
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, title, title_hi, title_bn, slug, excerpt, excerpt_hi, excerpt_bn, category, published_at, cover_image_url")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setBlogPosts(data as BlogPostPreview[]);
      });
  }, []);

  const getBlogTitle = (p: BlogPostPreview) =>
    language === "hi" ? (p.title_hi || p.title) : language === "bn" ? (p.title_bn || p.title) : p.title;
  const getBlogExcerpt = (p: BlogPostPreview) =>
    language === "hi" ? (p.excerpt_hi || p.excerpt) : language === "bn" ? (p.excerpt_bn || p.excerpt) : p.excerpt;

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Suvee Fashion",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    description: "Premium wholesale kurti manufacturer from Howrah, Kolkata. 850+ designs, pan-India delivery.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "20/21 Bhawan Ganguly Lane, 5th Floor",
      addressLocality: "Howrah",
      addressRegion: "West Bengal",
      postalCode: "711101",
      addressCountry: "IN",
    },
    contactPoint: { "@type": "ContactPoint", telephone: "+91-9831640808", contactType: "sales" },
  };

  return (
    <div className="pb-16 md:pb-0">
      <SEOHead
        title="Suvee Fashion — Premium Wholesale Kurtis from Kolkata"
        description="Buy wholesale kurtis from Suvee Fashion, Howrah. 850+ designs, pan-India delivery, trusted by 3700+ retailers. Register as buyer for wholesale prices."
        canonical={SITE_URL}
        jsonLd={orgJsonLd}
      />
      {/* Hero Carousel */}
      <section className="relative overflow-hidden">
        <div className="overflow-hidden" ref={heroEmblaRef}>
          <div className="flex">
            {heroSlides.map((slide, i) => (
              <div key={i} className="relative min-w-0 flex-[0_0_100%]">
                <img
                  src={slide}
                  alt={`Suvee Fashion Collection ${i + 1}`}
                  className="h-[55vh] w-full object-cover object-top sm:h-[60vh] md:h-[80vh]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/50 to-transparent" />
              </div>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
          <div className="container pointer-events-auto px-5 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <h1 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl lg:text-6xl">
                {t("hero.tagline")}
              </h1>
              <p className="mt-2 text-sm text-white/80 sm:mt-4 sm:text-base md:text-lg">
                {t("hero.subtitle")}
              </p>

              {/* CTA Buttons — clean 2-button layout on mobile */}
              <div className="mt-5 flex gap-2.5 sm:mt-8 sm:gap-3">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:opacity-90 flex-1 sm:flex-none text-sm sm:text-base h-11 sm:h-12" asChild>
                  <Link to="/advisor">
                    🧔 {t("hero.cta_advisor")}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white flex-1 sm:flex-none text-sm sm:text-base h-11 sm:h-12" asChild>
                  <Link to="/register">Register Free →</Link>
                </Button>
              </div>

              {/* Trust badges — compact on mobile */}
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/60 sm:mt-6 sm:gap-4 sm:text-xs sm:text-white/70">
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> No minimum limit</span>
                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> GST Invoices</span>
                <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Pan-India</span>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-6 sm:gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => heroApi?.scrollTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeSlide ? "w-6 bg-white sm:w-8" : "w-2 bg-white/50 hover:bg-white/70 sm:w-2.5"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Trust Bar — single row, no wrapping issues */}
      <section className="border-b border-border bg-accent/50">
        <div className="container overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-start gap-4 py-2.5 text-[11px] font-medium text-foreground sm:justify-center sm:gap-6 md:gap-8 md:py-3 md:text-sm whitespace-nowrap">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-green-600 shrink-0" /> GST Verified</span>
            <span className="h-3 w-px bg-border shrink-0" />
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-secondary shrink-0" /> 7+ Years</span>
            <span className="h-3 w-px bg-border shrink-0" />
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-secondary shrink-0" /> 3700+ Retailers</span>
            <span className="h-3 w-px bg-border shrink-0" />
            <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-secondary shrink-0" /> Pan-India</span>
          </div>
        </div>
      </section>

      {/* Stats — compact on mobile */}
      <section className="border-b border-border bg-card">
        <div className="container grid grid-cols-4 gap-2 py-5 sm:gap-4 md:py-12">
          {stats.map(({ icon: Icon, key }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-1 text-center sm:gap-2"
            >
              <Icon className="h-5 w-5 text-secondary sm:h-7 sm:w-7" />
              <span className="font-display text-sm font-extrabold text-foreground sm:text-xl">{t(key)}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Collections — dynamic from DB with carousel */}
      <section className="bg-card py-10 sm:py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">{t("categories.title")}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">Browse our full digital catalogue with 850+ designs</p>
          </motion.div>

          {dbCategories.length > 0 ? (
            <div className="relative mt-6 sm:mt-10">
              <div className="overflow-hidden" ref={catEmblaRef}>
                <div className="flex gap-3 sm:gap-4">
                  {dbCategories.map((cat, i) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="min-w-0 flex-[0_0_45%] sm:flex-[0_0_30%] lg:flex-[0_0_23%]"
                    >
                      <Link to={`/catalogues?category=${cat.slug}`}>
                        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                          <div className="relative aspect-[3/4] sm:aspect-square overflow-hidden bg-muted">
                            {cat.image_url ? (
                              <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">No Image</div>
                            )}
                          </div>
                          <CardContent className="p-2.5 text-center sm:p-4">
                            <h3 className="font-display text-sm font-semibold text-foreground sm:text-lg">{cat.name}</h3>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* Slider nav buttons */}
              <button
                onClick={() => catApi?.scrollPrev()}
                className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-lg border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-30 sm:-left-4 sm:h-10 sm:w-10"
                disabled={!canScrollCatPrev}
                aria-label="Previous categories"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => catApi?.scrollNext()}
                className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-lg border border-border text-foreground hover:bg-accent transition-colors disabled:opacity-30 sm:-right-4 sm:h-10 sm:w-10"
                disabled={!canScrollCatNext}
                aria-label="Next categories"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="mt-6 text-center text-sm text-muted-foreground">Loading categories...</div>
          )}
        </div>
      </section>

      {/* Testimonials — horizontal scroll on mobile */}
      <section className="py-10 sm:py-16 md:py-24">
        <div className="container">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
            {t("testimonials.title")}
          </motion.h2>
          <div className="mt-6 flex gap-4 overflow-x-auto pb-2 scrollbar-hide sm:mt-10 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
            {testimonials.map((item, i) => (
              <motion.div key={item.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="min-w-[75vw] sm:min-w-0">
                <Card className="h-full border-0 bg-card shadow-md">
                  <CardContent className="flex h-full flex-col p-4 sm:p-6">
                    <Quote className="mb-2 h-5 w-5 text-secondary sm:mb-3 sm:h-6 sm:w-6" />
                    <p className="flex-1 text-xs text-muted-foreground leading-relaxed italic sm:text-sm">"{item.text[language]}"</p>
                    <div className="mt-3 flex items-center gap-0.5 sm:mt-4 sm:gap-1">
                      {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-secondary text-secondary sm:h-4 sm:w-4" />)}
                    </div>
                    <p className="mt-1.5 text-xs font-semibold text-foreground sm:mt-2 sm:text-sm">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground sm:text-xs">{item.city}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dada Se Pucho Highlight */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 py-10 sm:py-16 md:py-24 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-3xl shadow-xl sm:mb-6 sm:h-20 sm:w-20 sm:text-4xl">
              🧔
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              {t("advisor.homepage_title" as any)}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:mt-4 sm:text-base">
              {t("advisor.homepage_subtitle" as any)}
            </p>
            <div className="mt-6 sm:mt-8">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:opacity-90 shadow-lg w-full sm:w-auto" asChild>
                <Link to="/advisor">
                  🧔 {t("nav.advisor")} — It's FREE! <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-muted-foreground sm:gap-4 sm:text-xs">
              <span>✓ 100% Free</span>
              <span>✓ Hindi / English</span>
              <span>✓ Instant Advice</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Latest from Blog */}
      {blogPosts.length > 0 && (
        <section className="py-10 sm:py-16 md:py-24">
          <div className="container">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                {language === "hi" ? "📖 लेटेस्ट ब्लॉग" : language === "bn" ? "📖 সাম্প্রতিক ব্লগ" : "📖 Latest from Our Blog"}
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">
                {language === "hi" ? "कुर्ती बिजनेस टिप्स और ट्रेंड्स" : language === "bn" ? "কুর্তি ব্যবসা টিপস এবং ট্রেন্ড" : "Tips, trends & insights for kurti retailers"}
              </p>
            </motion.div>
            <div className="mt-6 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-6">
              {blogPosts.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={`/blog/${post.slug}`}>
                    <Card className="group h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow">
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        {post.cover_image_url ? (
                          <img src={post.cover_image_url} alt={getBlogTitle(post)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                            <span className="text-3xl">📝</span>
                          </div>
                        )}
                        {post.category && (
                          <Badge className="absolute left-2 top-2 bg-primary/90 text-primary-foreground text-[10px]">{post.category}</Badge>
                        )}
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-display text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors sm:text-base">{getBlogTitle(post)}</h3>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{getBlogExcerpt(post)}</p>
                        {post.published_at && (
                          <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 text-center sm:mt-8">
              <Button variant="outline" asChild>
                <Link to="/blog">
                  {language === "hi" ? "सभी आर्टिकल पढ़ें" : language === "bn" ? "সব আর্টিকেল পড়ুন" : "Read All Articles"} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* YouTube Section */}
      <section className="bg-card py-10 sm:py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">▶ Latest from Our YouTube</h2>
            <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">New catalogues, styling tips & behind-the-scenes</p>
          </motion.div>

          {youtubeVideos.length > 0 ? (
            <div className="mt-6 overflow-hidden sm:mt-10" ref={ytEmblaRef}>
              <div className="flex gap-3 sm:gap-4">
                {youtubeVideos.map((video, i) => (
                  <motion.div
                    key={video.videoId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="min-w-0 flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_30%]"
                  >
                    <YouTubeCard video={video} />
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-center sm:mt-10">
              <p className="text-sm text-muted-foreground">Check out our latest videos for new catalogues and styling tips!</p>
            </div>
          )}

          <div className="mt-6 text-center sm:mt-8">
            <Button variant="outline" size="sm" asChild className="sm:size-default">
              <a href="https://youtube.com/@suveefashion" target="_blank" rel="noopener noreferrer">
                Visit Our YouTube <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-maroon py-10 sm:py-16 md:py-24">
        <div className="container text-center px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl md:text-4xl">{t("cta.register_title")}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/80 sm:mt-4 sm:text-base">{t("cta.register_subtitle")}</p>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              <Button size="lg" className="gradient-gold text-foreground font-semibold hover:opacity-90 w-full sm:w-auto" asChild>
                <Link to="/register">Register Free — Takes 2 Min →</Link>
              </Button>
              <a href="https://wa.me/919831640808?text=Hi%20Suvee%20Fashion!%20I%20want%20to%20know%20about%20wholesale%20pricing." target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white w-full">
                  💬 WhatsApp Us
                </Button>
              </a>
              <a href="https://chat.whatsapp.com/EPcMwkcqbhXBSGL2ZhZInL" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white w-full">
                  📢 Join WhatsApp Community
                </Button>
              </a>
            </div>
            <p className="mt-3 text-[10px] text-white/60 sm:mt-4 sm:text-xs">Free registration • No hidden charges • 3700+ retailers</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
