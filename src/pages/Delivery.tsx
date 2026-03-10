import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Clock, MapPin, Package } from "lucide-react";

const zones = [
  {
    region: { en: "Kolkata & West Bengal", hi: "कोलकाता और पश्चिम बंगाल", bn: "কলকাতা ও পশ্চিমবঙ্গ" },
    timeline: { en: "1-2 business days", hi: "1-2 कार्यदिवस", bn: "১-২ কর্মদিবস" },
    icon: MapPin,
    highlight: true,
  },
  {
    region: { en: "Eastern India (Bihar, Jharkhand, Odisha, Assam, NE)", hi: "पूर्वी भारत (बिहार, झारखंड, ओडिशा, असम, NE)", bn: "পূর্ব ভারত (বিহার, ঝাড়খণ্ড, ওডিশা, অসম, NE)" },
    timeline: { en: "2-4 business days", hi: "2-4 कार्यदिवस", bn: "২-৪ কর্মদিবস" },
    icon: Truck,
    highlight: false,
  },
  {
    region: { en: "North India (Delhi, UP, Rajasthan, MP, Punjab)", hi: "उत्तर भारत (दिल्ली, UP, राजस्थान, MP, पंजाब)", bn: "উত্তর ভারত (দিল্লি, UP, রাজস্থান, MP, পাঞ্জাব)" },
    timeline: { en: "3-5 business days", hi: "3-5 कार्यदिवस", bn: "৩-৫ কর্মদিবস" },
    icon: Truck,
    highlight: false,
  },
  {
    region: { en: "West & South India (Maharashtra, Gujarat, Karnataka, Tamil Nadu, Kerala)", hi: "पश्चिम और दक्षिण भारत (महाराष्ट्र, गुजरात, कर्नाटक, तमिल नाडु, केरल)", bn: "পশ্চিম ও দক্ষিণ ভারত (মহারাষ্ট্র, গুজরাট, কর্ণাটক, তামিল নাড়ু, কেরালা)" },
    timeline: { en: "4-7 business days", hi: "4-7 कार्यदिवस", bn: "৪-৭ কর্মদিবস" },
    icon: Truck,
    highlight: false,
  },
];

const policies = [
  { icon: Package, title: { en: "Minimum Order", hi: "न्यूनतम ऑर्डर", bn: "সর্বনিম্ন অর্ডার" }, desc: { en: "No minimum order limit. Buy even 1 bundle. We don't sell single pieces.", hi: "कोई न्यूनतम ऑर्डर सीमा नहीं। 1 बंडल भी खरीद सकते हैं। हम सिंगल पीस नहीं बेचते।", bn: "কোনো ন্যূনতম অর্ডার সীমা নেই। ১টি বান্ডেলও কিনতে পারেন। আমরা একক পিস বিক্রি করি না।" } },
  { icon: Truck, title: { en: "Shipping Partners", hi: "शिपिंग पार्टनर", bn: "শিপিং পার্টনার" }, desc: { en: "We ship via DTDC, Delhivery, and professional transport services for bulk orders.", hi: "हम DTDC, Delhivery और बल्क ऑर्डर्स के लिए प्रोफेशनल ट्रांसपोर्ट से शिप करते हैं।", bn: "আমরা DTDC, Delhivery এবং বাল্ক অর্ডারের জন্য পেশাদার পরিবহন সেবা ব্যবহার করি।" } },
  { icon: Clock, title: { en: "Order Processing", hi: "ऑर्डर प्रोसेसिंग", bn: "অর্ডার প্রসেসিং" }, desc: { en: "Orders are processed within 24-48 hours. Custom/bulk orders may take 5-7 days.", hi: "ऑर्डर 24-48 घंटों में प्रोसेस होते हैं। कस्टम/बल्क ऑर्डर में 5-7 दिन लग सकते हैं।", bn: "অর্ডার ২৪-৪৮ ঘণ্টার মধ্যে প্রসেস করা হয়। কাস্টম/বাল্ক অর্ডারে ৫-৭ দিন লাগতে পারে।" } },
];

export default function Delivery() {
  const { t, language } = useLanguage();

  return (
    <div className="py-12 md:py-20">
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">{t("delivery.title")}</h1>
          <p className="mt-3 text-muted-foreground">{t("delivery.subtitle")}</p>
        </motion.div>

        {/* Delivery Zones */}
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground">Delivery Zones & Timelines</h2>
          {zones.map((zone, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className={`border-0 shadow-md ${zone.highlight ? "ring-2 ring-secondary" : ""}`}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${zone.highlight ? "bg-secondary/20" : "bg-muted"}`}>
                    <zone.icon className={`h-5 w-5 ${zone.highlight ? "text-secondary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-sm font-semibold text-foreground">{zone.region[language]}</h3>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${zone.highlight ? "text-secondary" : "text-foreground"}`}>{zone.timeline[language]}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Shipping Policies */}
        <div className="mt-12 space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground">Shipping Details</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {policies.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border-0 shadow-md">
                  <CardContent className="p-5">
                    <p.icon className="h-6 w-6 text-primary" />
                    <h3 className="mt-3 font-display text-sm font-semibold text-foreground">{p.title[language]}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{p.desc[language]}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
