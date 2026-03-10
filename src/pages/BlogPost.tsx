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

  const postUrl = `https://suveefashion.lovable.app/blog/${post.slug}`;

  const shareWhatsApp = () => {
    const text = `📖 ${title}\n\n${excerpt || ""}\n\nRead: ${postUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
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
    image: post.cover_image_url || "https://suveefashion.lovable.app/og-default.jpg",
    datePublished: post.published_at,
    author: { "@type": "Organization", name: "Suvee Fashion" },
    publisher: {
      "@type": "Organization",
      name: "Suvee Fashion",
      logo: { "@type": "ImageObject", url: "https://suveefashion.lovable.app/favicon.ico" },
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
          <div className="prose prose-lg mx-auto mt-8 max-w-none text-foreground prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
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
          <div className="mt-10 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-6 text-center dark:from-amber-950/20 dark:to-orange-950/20 sm:p-8">
            <h3 className="font-display text-xl font-bold text-foreground">
              {language === "hi" ? "कुर्ती बिजनेस शुरू करना चाहते हैं?" : language === "bn" ? "কুর্তি ব্যবসা শুরু করতে চান?" : "Want to Start Your Kurti Business?"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {language === "hi" ? "Suvee Fashion से होलसेल कुर्ती खरीदें — 850+ डिज़ाइन, पूरे भारत में डिलीवरी" : language === "bn" ? "Suvee Fashion থেকে পাইকারি কুর্তি কিনুন — ৮৫০+ ডিজাইন, সারা ভারতে ডেলিভারি" : "Buy wholesale kurtis from Suvee Fashion — 850+ designs, pan-India delivery"}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild className="gradient-gold text-foreground font-semibold">
                <Link to="/register">Register as Buyer →</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/catalogues">Browse Catalogue</Link>
              </Button>
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
