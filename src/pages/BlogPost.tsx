import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Tag, MessageCircle, Copy, Check, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { SITE_URL } from "@/lib/constants";
import { format } from "date-fns";

interface FullPost {
  id: string;
  title: string;
  title_hi: string | null;
  title_bn: string | null;
  slug: string;
  content: string;
  content_hi: string | null;
  content_bn: string | null;
  excerpt: string | null;
  excerpt_hi: string | null;
  excerpt_bn: string | null;
  cover_image_url: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  category: string | null;
  social_caption: string | null;
  social_caption_hi: string | null;
  published_at: string | null;
}

interface RelatedPost {
  id: string;
  title: string;
  title_hi: string | null;
  title_bn: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_hi: string | null;
  excerpt_bn: string | null;
  cover_image_url: string | null;
  published_at: string | null;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const [post, setPost] = useState<FullPost | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      setPost(data as FullPost | null);
      setLoading(false);

      // Fetch related posts
      if (data?.category) {
        const { data: relatedData } = await supabase
          .from("blog_posts")
          .select("id, title, title_hi, title_bn, slug, excerpt, excerpt_hi, excerpt_bn, cover_image_url, published_at")
          .eq("status", "published")
          .eq("category", data.category)
          .neq("id", data.id)
          .order("published_at", { ascending: false })
          .limit(3);
        setRelated((relatedData as RelatedPost[]) || []);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="mx-auto h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mx-auto mt-4 h-4 w-96 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
        <Button asChild className="mt-4"><Link to="/blog">← Back to Blog</Link></Button>
      </div>
    );
  }

  const title = language === "hi" ? (post.title_hi || post.title) : language === "bn" ? (post.title_bn || post.title) : post.title;
  const content = language === "hi" ? (post.content_hi || post.content) : language === "bn" ? (post.content_bn || post.content) : post.content;
  const excerpt = language === "hi" ? (post.excerpt_hi || post.excerpt) : language === "bn" ? (post.excerpt_bn || post.excerpt) : post.excerpt;

  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  const shareWhatsApp = () => {
    const text = `📖 ${title}\n\n${excerpt || ""}\n\nRead: ${postUrl}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title, text, url: postUrl }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRelTitle = (p: RelatedPost) =>
    language === "hi" ? (p.title_hi || p.title) : language === "bn" ? (p.title_bn || p.title) : p.title;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.cover_image_url || `${SITE_URL}/og-default.jpg`,
    datePublished: post.published_at,
    author: { "@type": "Organization", name: "Suvee Fashion" },
    publisher: {
      "@type": "Organization",
      name: "Suvee Fashion",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
    },
    mainEntityOfPage: postUrl,
    keywords: post.keywords?.join(", "),
  };

  return (
    <div>
      <SEOHead
        title={`${title} | Suvee Fashion Blog`}
        description={post.meta_description || excerpt || ""}
        ogImage={post.cover_image_url || undefined}
        ogType="article"
        canonical={postUrl}
        jsonLd={jsonLd}
      />

      <article className="pb-16">
        {/* Header */}
        <section className="gradient-maroon py-10 md:py-16">
          <div className="container max-w-3xl">
            <Link to="/blog" className="mb-4 inline-flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" /> 
              {language === "hi" ? "सभी आर्टिकल" : language === "bn" ? "সব আর্টিকেল" : "All Articles"}
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {post.category && (
                <Badge className="mb-3 bg-white/20 text-white border-white/30">{post.category}</Badge>
              )}
              <h1 className="font-display text-2xl font-bold text-white leading-tight md:text-4xl">
                {title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/70">
                {post.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(post.published_at), "dd MMMM yyyy")}
                  </span>
                )}
                <span>By Suvee Fashion</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Cover image */}
        {post.cover_image_url && (
          <div className="container max-w-3xl -mt-6">
            <img
              src={post.cover_image_url}
              alt={title}
              className="w-full rounded-xl shadow-lg aspect-[16/9] object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="container max-w-3xl">
          <div className="mt-8 max-w-none [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-l-4 [&_h2]:border-secondary [&_h2]:pl-3 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-muted-foreground [&_p]:leading-[1.8] [&_p]:mb-4 [&_p]:text-[15px] [&_strong]:text-foreground [&_strong]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_ul]:my-4 [&_ul]:space-y-2 [&_ol]:my-4 [&_ol]:space-y-2 [&_li]:text-muted-foreground [&_li]:text-[15px] [&_li]:leading-[1.7] [&_li]:pl-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-secondary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6 [&_hr]:my-8 [&_hr]:border-border [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* Share & Keywords */}
          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {post.keywords?.map((kw) => (
                <Badge key={kw} variant="outline" className="text-xs">
                  <Tag className="mr-1 h-2.5 w-2.5" />{kw}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={shareWhatsApp} className="gap-1.5">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 overflow-hidden rounded-xl border border-border shadow-lg">
            <div className="gradient-maroon p-6 text-center sm:p-10">
              <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {language === "hi" ? "कुर्ती बिजनेस बढ़ाना चाहते हैं?" : language === "bn" ? "কুর্তি ব্যবসা বাড়াতে চান?" : "Ready to Grow Your Kurti Business?"}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/80 sm:text-base">
                {language === "hi" ? "Suvee Fashion से होलसेल कुर्ती खरीदें — 850+ डिज़ाइन, फैक्ट्री रेट, पूरे भारत में डिलीवरी" : language === "bn" ? "Suvee Fashion থেকে পাইকারি কুর্তি কিনুন — ৮৫০+ ডিজাইন, ফ্যাক্টরি রেট, সারা ভারতে ডেলিভারি" : "Buy wholesale kurtis from Suvee Fashion — 850+ designs, factory rates, pan-India delivery"}
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="gradient-gold text-foreground font-bold hover:opacity-90 w-full sm:w-auto" asChild>
                  <Link to="/register">✨ Register as Buyer →</Link>
                </Button>
                <Button size="lg" className="bg-green-600 text-white font-bold hover:bg-green-700 w-full sm:w-auto" asChild>
                  <a href="https://wa.me/919831640808?text=Hi%20Suvee%20Fashion!%20I%20want%20to%20see%20your%20wholesale%20catalogue." target="_blank" rel="noopener noreferrer">
                    💬 WhatsApp Us for Catalogue
                  </a>
                </Button>
              </div>
              <p className="mt-4 text-[10px] text-white/50 sm:text-xs">Free registration • No minimum order • 3700+ retailers trust us</p>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <section className="mt-12 border-t border-border bg-card py-10">
            <div className="container max-w-3xl">
              <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                {language === "hi" ? "और पढ़ें" : language === "bn" ? "আরও পড়ুন" : "Related Articles"}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {related.map((rp) => (
                  <Link key={rp.id} to={`/blog/${rp.slug}`}>
                    <Card className="h-full overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-[16/10] overflow-hidden bg-muted">
                        {rp.cover_image_url ? (
                          <img src={rp.cover_image_url} alt={getRelTitle(rp)} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                            <span className="text-2xl">📝</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="text-sm font-semibold text-foreground line-clamp-2">{getRelTitle(rp)}</h3>
                        {rp.published_at && (
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            {format(new Date(rp.published_at), "dd MMM yyyy")}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
