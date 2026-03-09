import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Clock, CheckCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("inquiries").insert({
      contact_person: form.name.trim(),
      business_name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      message: form.message.trim(),
      products_interested: "General Inquiry",
    });
    setLoading(false);

    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
      return;
    }

    // Also open WhatsApp with the message
    const msg = `Hi Suvee Fashion!%0A%0AName: ${form.name}%0APhone: ${form.phone}%0A${form.email ? `Email: ${form.email}%0A` : ""}Message: ${form.message}`;
    window.open(`https://wa.me/919831640808?text=${msg}`, "_blank");

    toast({ title: "Message sent! ✅", description: "We'll get back to you within 24 hours. You're also being redirected to WhatsApp." });
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div>
      <section className="gradient-maroon py-16 md:py-24">
        <div className="container text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl font-bold text-white md:text-5xl">
            {t("contact.title")}
          </motion.h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">{t("contact.subtitle")}</p>
        </div>
      </section>

      {/* Response time promise strip */}
      <section className="border-b border-border bg-accent">
        <div className="container flex flex-wrap items-center justify-center gap-6 py-3 text-sm">
          <span className="flex items-center gap-1.5 text-foreground"><Clock className="h-4 w-4 text-secondary" /> Reply within 2 hours</span>
          <span className="flex items-center gap-1.5 text-foreground"><CheckCircle className="h-4 w-4 text-secondary" /> No spam, ever</span>
          <span className="flex items-center gap-1.5 text-foreground"><Phone className="h-4 w-4 text-secondary" /> Direct line to owner</span>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container grid gap-10 md:grid-cols-2">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <h2 className="mb-1 font-display text-xl font-bold text-foreground">Send us a message</h2>
                <p className="mb-6 text-sm text-muted-foreground">We reply to every inquiry personally</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">{t("contact.name")} *</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">{t("contact.phone")} *</label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={15} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">{t("contact.email")}</label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">{t("contact.message")} *</label>
                    <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} maxLength={1000} placeholder="Tell us about your requirements — quantity, product type, budget..." />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    <Send className="mr-2 h-4 w-4" /> {loading ? "Sending..." : t("contact.send")}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">Your message will also be sent via WhatsApp for faster response</p>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
            <Card className="border-0 shadow-md">
              <CardContent className="flex items-start gap-4 p-6">
                <MapPin className="mt-1 h-6 w-6 shrink-0 text-secondary" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">Office Address</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t("contact.address")}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="flex items-start gap-4 p-6">
                <Phone className="mt-1 h-6 w-6 shrink-0 text-secondary" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">Phone</h3>
                  <a href="tel:+919831640808" className="mt-1 block text-sm text-muted-foreground hover:text-foreground">+91 98316 40808</a>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="flex items-start gap-4 p-6">
                <Mail className="mt-1 h-6 w-6 shrink-0 text-secondary" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">Email</h3>
                  <a href="mailto:suvee.fashion@gmail.com" className="mt-1 block text-sm text-muted-foreground hover:text-foreground">suvee.fashion@gmail.com</a>
                </div>
              </CardContent>
            </Card>

            <a
              href="https://wa.me/919831640808"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2"
            >
              <Button variant="outline" size="lg" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                💬 {t("contact.whatsapp")} — Fastest Response
              </Button>
            </a>

            {/* Trust signals */}
            <div className="rounded-xl bg-accent p-4">
              <p className="text-sm font-medium text-foreground">💡 Quick tip for buyers</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Want to see wholesale prices? <a href="/register" className="font-medium text-primary hover:underline">Register as a buyer</a> — it's free and takes 2 minutes.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
