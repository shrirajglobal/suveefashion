import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Palette, Clock, Truck, Award, ShieldCheck, Factory, Heart } from "lucide-react";
import factoryImage from "@/assets/factory.jpg";

const values = [
  { icon: Award, titleEn: "Quality First", titleHi: "गुणवत्ता सबसे पहले", titleBn: "গুণমান প্রথমে", descEn: "Every kurti undergoes strict quality checks before dispatch.", descHi: "हर कुर्ती डिस्पैच से पहले सख्त क्वालिटी चेक से गुजरती है।", descBn: "প্রতিটি কুর্তি প্রেরণের আগে কঠোর মান পরীক্ষার মধ্য দিয়ে যায়।" },
  { icon: Heart, titleEn: "Artisan Craft", titleHi: "कारीगर शिल्प", titleBn: "কারিগর শিল্প", descEn: "Handcrafted details by skilled artisans with decades of experience.", descHi: "दशकों के अनुभव वाले कुशल कारीगरों द्वारा हस्तनिर्मित विवरण।", descBn: "দশকের অভিজ্ঞতা সম্পন্ন দক্ষ কারিগরদের দ্বারা হাতে তৈরি।" },
  { icon: ShieldCheck, titleEn: "GST Registered", titleHi: "GST पंजीकृत", titleBn: "GST নিবন্ধিত", descEn: "Fully compliant with GST regulations for hassle-free business.", descHi: "परेशानी मुक्त व्यापार के लिए GST नियमों का पूर्ण अनुपालन।", descBn: "ঝামেলামুক্ত ব্যবসার জন্য GST প্রবিধানের সাথে সম্পূর্ণ সঙ্গতিপূর্ণ।" },
  { icon: Factory, titleEn: "In-House Production", titleHi: "इन-हाउस प्रोडक्शन", titleBn: "ইন-হাউস উৎপাদন", descEn: "Complete control over manufacturing ensures consistency.", descHi: "विनिर्माण पर पूर्ण नियंत्रण स्थिरता सुनिश्चित करता है।", descBn: "উৎপাদনের উপর সম্পূর্ণ নিয়ন্ত্রণ ধারাবাহিকতা নিশ্চিত করে।" },
];

export default function About() {
  const { t, language } = useLanguage();

  return (
    <div>
      {/* Hero */}
      <section className="gradient-maroon py-16 md:py-24">
        <div className="container text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-white md:text-5xl"
          >
            {t("about.page_title")}
          </motion.h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">{t("about.page_subtitle")}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container grid grid-cols-2 gap-4 py-8 md:grid-cols-4 md:py-12">
          {[
            { icon: Users, key: "about.stat_retailers" as const },
            { icon: Palette, key: "about.stat_designs" as const },
            { icon: Clock, key: "about.stat_years" as const },
            { icon: Truck, key: "about.stat_cities" as const },
          ].map(({ icon: Icon, key }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <Icon className="h-7 w-7 text-secondary" />
              <span className="font-display text-lg font-bold text-foreground">{t(key)}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="container grid items-center gap-10 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold text-foreground">{t("about.mission_title")}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{t("about.mission_text")}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl font-bold text-foreground">{t("about.factory_title")}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{t("about.factory_text")}</p>
          </motion.div>
        </div>
      </section>

      {/* Factory Image */}
      <section className="bg-card py-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="overflow-hidden rounded-2xl">
            <img src={factoryImage} alt="Suvee Fashion Factory" className="w-full rounded-2xl object-cover shadow-xl" loading="lazy" />
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon;
              const title = language === "hi" ? v.titleHi : language === "bn" ? v.titleBn : v.titleEn;
              const desc = language === "hi" ? v.descHi : language === "bn" ? v.descBn : v.descEn;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="h-full border-0 bg-card shadow-md">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                        <Icon className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
