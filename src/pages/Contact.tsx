import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function Contact() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
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

      <section className="py-16 md:py-24">
        <div className="container grid gap-10 md:grid-cols-2">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">{t("contact.name")} *</label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">{t("contact.phone")} *</label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={15} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">{t("contact.email")}</label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">{t("contact.message")} *</label>
                    <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} maxLength={1000} />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" /> {t("contact.send")}
                  </Button>
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
                  <p className="mt-1 text-sm text-muted-foreground">+91 99999 99999</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="flex items-start gap-4 p-6">
                <Mail className="mt-1 h-6 w-6 shrink-0 text-secondary" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">Email</h3>
                  <p className="mt-1 text-sm text-muted-foreground">info@suveefashion.com</p>
                </div>
              </CardContent>
            </Card>

            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2"
            >
              <Button variant="outline" size="lg" className="w-full border-green-500 text-green-600 hover:bg-green-50">
                💬 {t("contact.whatsapp")}
              </Button>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
