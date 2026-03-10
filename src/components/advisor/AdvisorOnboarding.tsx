import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Store } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface UserContext {
  state: string;
  businessType: string;
}

const STATE_GROUPS = [
  { label: "North", labelHi: "उत्तर", states: ["Delhi", "UP", "Rajasthan", "Punjab", "Haryana", "Uttarakhand", "MP"] },
  { label: "East", labelHi: "पूर्व", states: ["West Bengal", "Bihar", "Jharkhand", "Odisha"] },
  { label: "South", labelHi: "दक्षिण", states: ["Tamil Nadu", "Karnataka", "Kerala", "AP", "Telangana"] },
  { label: "West", labelHi: "पश्चिम", states: ["Gujarat", "Maharashtra", "Goa"] },
  { label: "Northeast", labelHi: "पूर्वोत्तर", states: ["Assam", "Northeast"] },
  { label: "Other", labelHi: "अन्य", states: ["Other"] },
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
      className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-lg"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-2xl shadow-lg">
          🧔
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-foreground leading-tight">
            {language === "hi" ? "पहले अपने बारे में बताइए!" : "Pehle apne baare mein bataiye!"}
          </h2>
          <p className="text-[11px] text-muted-foreground">
            {language === "hi" ? "ताकि Dada आपको सही सलाह दे सकें" : "Taaki Dada aapko sahi advice de sakein"}
          </p>
        </div>
      </div>

      {step === 1 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {language === "hi" ? "आप कहाँ से हैं?" : "Aap kahaan se hain?"}
          </div>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto overscroll-none pr-1">
            {STATE_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {language === "hi" ? group.labelHi : group.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.states.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setState(s); setStep(2); }}
                      className="rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10 active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-1 text-[11px] text-muted-foreground">
            📍 {state}
            <button onClick={() => setStep(1)} className="ml-2 text-primary underline text-[11px]">Change</button>
          </div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Store className="h-4 w-4 text-primary" />
            {language === "hi" ? "आपका बिज़नेस कैसा है?" : "Aapka business kaisa hai?"}
          </div>
          <div className="flex flex-col gap-2">
            {BUSINESS_TYPES.map((bt) => (
              <button
                key={bt.value}
                onClick={() => onComplete({ state, businessType: bt.value })}
                className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-left text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10 active:scale-[0.98]"
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
