import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

// ─── REPLACE THESE WITH YOUR ACTUAL IDS ───
const FORMSPREE_ID = "xYzAbCdE"; // ← Your Formspree form ID
// ───────────────────────────────────────────

const BUYER_TYPES = [
  "Kurti Retailer",
  "Boutique Owner",
  "Home Seller",
  "Wholesaler",
  "Other",
] as const;

interface LeadFormProps {
  compact?: boolean;
}

export default function LeadCaptureForm({ compact = false }: LeadFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    buyerType: "",
    whatsapp: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.city.trim() || !formData.buyerType || !formData.whatsapp.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    // Basic phone validation
    const phone = formData.whatsapp.replace(/\D/g, "");
    if (phone.length < 10) {
      toast({ title: "Please enter a valid WhatsApp number", variant: "destructive" });
      return;
    }

    setLoading(true);

    // 1. Send to Formspree
    try {
      await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          city: formData.city.trim(),
          buyer_type: formData.buyerType,
          whatsapp: formData.whatsapp.trim(),
        }),
      });
    } catch {
      // Silently fail — WhatsApp redirect still works
    }

    // 2. Track GA4 conversion event
    trackEvent("catalogue_request", {
      buyer_type: formData.buyerType,
      city: formData.city.trim(),
    });

    // 3. Open WhatsApp with pre-filled message
    const waText = `Hi Suvee! I'm a ${formData.buyerType} from ${formData.city.trim()}. Please send me your latest kurti catalogue.`;
    window.open(
      `https://wa.me/919831640808?text=${encodeURIComponent(waText)}`,
      "_blank"
    );

    toast({ title: "Request sent! Check WhatsApp 🎉" });
    setLoading(false);
    setFormData({ name: "", city: "", buyerType: "", whatsapp: "" });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mx-auto w-full space-y-4 rounded-xl border border-border bg-card p-5 shadow-lg sm:p-6 ${compact ? "max-w-md" : "max-w-lg"}`}
    >
      <div className="space-y-1.5">
        <Label htmlFor="lead-name">Full Name</Label>
        <Input
          id="lead-name"
          placeholder="Your full name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lead-city">City / State</Label>
        <Input
          id="lead-city"
          placeholder="e.g. Kolkata, West Bengal"
          value={formData.city}
          onChange={(e) => handleChange("city", e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lead-type">I am a</Label>
        <Select value={formData.buyerType} onValueChange={(v) => handleChange("buyerType", v)}>
          <SelectTrigger id="lead-type">
            <SelectValue placeholder="Select your business type" />
          </SelectTrigger>
          <SelectContent>
            {BUYER_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lead-whatsapp">WhatsApp Number</Label>
        <Input
          id="lead-whatsapp"
          type="tel"
          placeholder="+91 98316 40808"
          value={formData.whatsapp}
          onChange={(e) => handleChange("whatsapp", e.target.value)}
          maxLength={15}
          required
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4 mr-2" />
        )}
        Get Free Catalogue on WhatsApp
      </Button>

      <p className="text-center text-[10px] text-muted-foreground">
        We'll send the catalogue to your WhatsApp. No spam, ever.
      </p>
    </motion.form>
  );
}
