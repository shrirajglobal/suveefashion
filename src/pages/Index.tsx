import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Palette, Clock, Truck, Star, Quote, Sparkles, ShieldCheck, Phone, CheckCircle, Play, MessageCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import factoryImage from "@/assets/factory.jpg";
import casualImg from "@/assets/category-casual.jpg";
import festiveImg from "@/assets/category-festive.jpg";
import cottonImg from "@/assets/category-cotton.jpg";
import designerImg from "@/assets/category-designer.jpg";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import heroProduct1 from "@/assets/hero-product-1.jpg";
import heroProduct2 from "@/assets/hero-product-2.jpg";
import heroProduct3 from "@/assets/hero-product-3.jpg";
import heroProduct4 from "@/assets/hero-product-4.jpg";
import heroProduct5 from "@/assets/hero-product-5.jpg";
import heroProduct6 from "@/assets/hero-product-6.jpg";

const fallbackSlides = [heroProduct1, heroProduct2, heroProduct3, heroProduct4, heroProduct5, heroProduct6];

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

const categories = [
  { key: "casual" as const, img: casualImg },
  { key: "festive" as const, img: festiveImg },
  { key: "cotton" as const, img: cottonImg },
  { key: "designer" as const, img: designerImg },
];

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
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [heroSlides, setHeroSlides] = useState<string[]>(fallbackSlides);
  const [ytEmblaRef] = useEmblaCarousel({ loop: false, align: "start", slidesToScroll: 1 });
  const [heroEmblaRef, heroApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [activeSlide, setActiveSlide] = useState(0);

  // Fetch hero banners from database
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
    if (!heroApi) return;
    const onSelect = () => setActiveSlide(heroApi.selectedScrollSnap());
    heroApi.on("select", onSelect);
    onSelect();
    return () => { heroApi.off("select", onSelect); };
  }, [heroApi]);

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, image_url, fabric, is_new_arrival")
      .eq("is_new_arrival", true)
      .limit(4)
      .then(({ data }) => setNewArrivals(data ?? []));
  }, []);

  // Fetch YouTube videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("youtube-feed");
        if (!error && data?.videos?.length) {
          setYoutubeVideos(data.videos);
        }
      } catch {
        // silently fail — fallback UI will show
      }
    };
    fetchVideos();
  }, []);

  return (
    <div>
      {/* Seasonal Campaign Banner */}
      <section className="gradient-gold py-3">
        <div className="container flex items-center justify-center gap-3 text-center">
          <Sparkles className="h-5 w-5 text-foreground" />
          <p className="text-sm font-semibold text-foreground">{t("seasonal.subtitle")}</p>
          <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium text-foreground">Coming Soon</span>
        </div>
      </section>

      {/* Hero Carousel */}
      <section className="relative overflow-hidden">
        <div className="overflow-hidden" ref={heroEmblaRef}>
          <div className="flex">
            {heroSlides.map((slide, i) => (
              <div key={i} className="relative min-w-0 flex-[0_0_100%]">
                <img
                  src={slide}
                  alt={`Suvee Fashion Collection ${i + 1}`}
                  className="h-[60vh] w-full object-cover object-top md:h-[80vh]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
              </div>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center">
          <div className="container pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <h1 className="font-display text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                {t("hero.tagline")}
              </h1>
              <p className="mt-4 text-base text-white/80 md:text-lg">
                {t("hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:opacity-90 w-full sm:w-auto" asChild>
                  <Link to="/advisor">
                    🧔 {t("hero.cta_advisor")}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white w-full sm:w-auto" asChild>
                  <Link to="/register">Register Free →</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white w-full sm:w-auto" asChild>
                  <Link to="/catalogues">
                    {t("hero.cta_catalogue")} <span className="ml-1 text-xs opacity-70">(Coming Soon)</span>
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/70">
                <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> MOQ 50 pcs</span>
                <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> GST Invoices</span>
                <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Pan-India Shipping</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> +91 98316 40808</span>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Dot indicators */}
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => heroApi?.scrollTo(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === activeSlide ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-border bg-accent/50">
        <div className="container flex flex-wrap items-center justify-center gap-4 py-3 text-xs font-medium text-foreground md:gap-8 md:text-sm">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-green-600" /> GST Verified</span>
          <span className="h-4 w-px bg-border hidden md:block" />
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-secondary" /> 7+ Years</span>
          <span className="h-4 w-px bg-border hidden md:block" />
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-secondary" /> 3700+ Retailers</span>
          <span className="h-4 w-px bg-border hidden md:block" />
          <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-secondary" /> Pan-India Delivery</span>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container grid grid-cols-2 gap-4 py-8 md:grid-cols-4 md:py-12">
          {stats.map(({ icon: Icon, key }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <Icon className="h-7 w-7 text-secondary" />
              <span className="font-display text-xl font-extrabold text-foreground">{t(key)}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Collections — Coming Soon */}
      <section className="bg-card py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">{t("categories.title")}</h2>
            <p className="mt-2 text-muted-foreground">Our full digital catalogue is coming soon!</p>
          </motion.div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ key, img }, i) => (
              <motion.div key={key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="group block">
                  <Card className="overflow-hidden border-0 shadow-md">
                    <div className="relative aspect-square overflow-hidden">
                      <img src={img} alt={t(`categories.${key}` as any)} className="h-full w-full object-cover opacity-70" />
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                        <span className="rounded-full bg-background/90 px-4 py-2 text-sm font-bold text-foreground shadow">Coming Soon</span>
                      </div>
                    </div>
                    <CardContent className="p-4 text-center">
                      <h3 className="font-display text-lg font-semibold text-foreground">{t(`categories.${key}` as any)}</h3>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center font-display text-3xl font-bold text-foreground md:text-4xl">
            {t("testimonials.title")}
          </motion.h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <motion.div key={item.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Card className="h-full border-0 bg-card shadow-md">
                  <CardContent className="flex h-full flex-col p-6">
                    <Quote className="mb-3 h-6 w-6 text-secondary" />
                    <p className="flex-1 text-sm text-muted-foreground leading-relaxed italic">"{item.text[language]}"</p>
                    <div className="mt-4 flex items-center gap-1">
                      {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />)}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.city}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dada Se Pucho Highlight */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 py-16 md:py-24 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-4xl shadow-xl">
              🧔
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              {t("advisor.homepage_title" as any)}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              {t("advisor.homepage_subtitle" as any)}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold hover:opacity-90 shadow-lg" asChild>
                <Link to="/advisor">
                  🧔 {t("nav.advisor")} — It's FREE! <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>✓ 100% Free</span>
              <span>✓ Hindi / English / Bengali</span>
              <span>✓ Instant Advice</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* YouTube Section */}
      <section className="bg-card py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">▶ Latest from Our YouTube</h2>
            <p className="mt-2 text-muted-foreground">New catalogues, styling tips & behind-the-scenes from our factory</p>
          </motion.div>

          {youtubeVideos.length > 0 ? (
            <div className="mt-10 overflow-hidden" ref={ytEmblaRef}>
              <div className="flex gap-4">
                {youtubeVideos.map((video, i) => (
                  <motion.div
                    key={video.videoId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="min-w-0 flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%]"
                  >
                    <YouTubeCard video={video} />
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground">Check out our latest videos for new catalogues and styling tips!</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <a href="https://youtube.com/@suveefashion" target="_blank" rel="noopener noreferrer">
                Visit Our YouTube Channel <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-maroon py-16 md:py-24">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">{t("cta.register_title")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80">{t("cta.register_subtitle")}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="gradient-gold text-foreground font-semibold hover:opacity-90" asChild>
                <Link to="/register">Register Free — Takes 2 Min →</Link>
              </Button>
              <a href="https://wa.me/919831640808?text=Hi%20Suvee%20Fashion!%20I%20want%20to%20know%20about%20wholesale%20pricing." target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                  💬 WhatsApp Us
                </Button>
              </a>
              <a href="https://chat.whatsapp.com/EPcMwkcqbhXBSGL2ZhZInL" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                  📢 Join WhatsApp Community
                </Button>
              </a>
            </div>
            <p className="mt-4 text-xs text-white/60">Free registration • No hidden charges • 3700+ retailers already onboard</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
