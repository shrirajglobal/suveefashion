import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Store } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface UserContext {
  state: string;
  businessType: string;
}

const STATES = [
  "Delhi", "UP", "Rajasthan", "Punjab", "Haryana", "MP", "Uttarakhand",
  "West Bengal", "Bihar", "Jharkhand", "Odisha", "Assam",
  "Tamil Nadu", "Karnataka", "Kerala", "AP", "Telangana",
  "Gujarat", "Maharashtra", "Goa",
  "Northeast", "Other",
];

const BUSINESS_TYPES = [
  { value: "retailer", label: "Retailer", labelHi: "रिटेलर", emoji: "🏪" },
  { value: "wholesaler", label: "Wholesaler", labelHi: "होलसेलर", emoji: "📦" },
  { value: "new", label: "Starting New", labelHi: "नया शुरू कर रहा हूँ", emoji: "🌱" },
];

interface Props {
  onComplete: (ctx: UserContext) => void;
}

export default function AdvisorOnboarding({ onComplete }: Props) {
  const { language } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [state, setState] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-2xl shadow-lg">
          🧔
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            {language === "hi" ? "पहले अपने बारे में बताइए!" : "Pehle apne baare mein bataiye!"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {language === "hi" ? "ताकि Dada आपको सही सलाह दे सकें" : "Taaki Dada aapko sahi advice de sakein"}
          </p>
        </div>
      </div>

      {step === 1 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {language === "hi" ? "तुम कहाँ से हो?" : "Tu kahaan se hai?"}
          </div>
          <div className="flex flex-wrap gap-2">
            {STATES.map((s) => (
              <button
                key={s}
                onClick={() => { setState(s); setStep(2); }}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-1 text-xs text-muted-foreground">
            📍 {state}
          </div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Store className="h-4 w-4 text-primary" />
            {language === "hi" ? "बिज़नेस कैसा है?" : "Business kaisa hai?"}
          </div>
          <div className="flex flex-col gap-2">
            {BUSINESS_TYPES.map((bt) => (
              <button
                key={bt.value}
                onClick={() => onComplete({ state, businessType: bt.value })}
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10"
              >
                <span className="text-xl">{bt.emoji}</span>
                <span>{language === "hi" ? bt.labelHi : bt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
