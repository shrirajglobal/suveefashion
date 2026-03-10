import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { UserPlus, Eye, EyeOff, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

const REFERRAL_OPTIONS = ["YouTube", "Facebook", "WhatsApp", "Friends", "Others"];

export default function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    businessName: "",
    gstNumber: "",
    city: "",
    state: "West Bengal",
    contactPerson: "",
    phone: "",
    businessType: "retailer" as "retailer" | "wholesaler",
    referralSource: "",
    referralOther: "",
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const isStep1Valid = form.email.includes("@") && form.password.length >= 6;
  const isStep2Valid = !!form.businessName && !!form.contactPerson && !!form.phone && !!form.city && !!form.referralSource;

  const handleNext = () => {
    if (!isStep1Valid) {
      toast({ title: "Please fill email and password correctly", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep2Valid) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (authError) {
      setLoading(false);
      toast({ title: "Registration failed", description: authError.message, variant: "destructive" });
      return;
    }

    if (!authData.user) {
      setLoading(false);
      toast({ title: "Registration failed", description: "Could not create account", variant: "destructive" });
      return;
    }

    const referral = form.referralSource === "Others" ? (form.referralOther.trim() || "Others") : form.referralSource;

    // Call edge function to insert profile (bypasses RLS)
    const { error: fnError } = await supabase.functions.invoke("register-buyer", {
      body: {
        user_id: authData.user.id,
        business_name: form.businessName.trim(),
        gst_number: form.gstNumber.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        contact_person: form.contactPerson.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        business_type: form.businessType,
        referral_source: referral,
      },
    });

    setLoading(false);

    if (fnError) {
      toast({ title: "Profile creation failed", description: fnError.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Registration successful! 🎉",
      description: "Please check your email to verify your account. Our team will approve your buyer access within 24-48 hours.",
    });
    navigate("/login");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full gradient-maroon">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <h1 className="font-display text-xl font-bold text-foreground">Create Buyer Account</h1>
              <p className="mt-1 text-xs text-muted-foreground">Free • No hidden charges • Approved in 24 hours</p>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
                <span className={step >= 1 ? "text-primary" : ""}>① Account</span>
                <span className={step >= 2 ? "text-primary" : ""}>② Business Details</span>
              </div>
              <Progress value={step === 1 ? 50 : 100} className="h-1.5" />
            </div>

            <form onSubmit={handleRegister}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Email *</label>
                      <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@business.com" maxLength={255} />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Password *</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => update("password", e.target.value)}
                          placeholder="Min 6 characters"
                          maxLength={128}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {form.password.length > 0 && form.password.length < 6 && (
                        <p className="mt-1 text-xs text-destructive">At least 6 characters needed</p>
                      )}
                      {form.password.length >= 6 && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3 w-3" /> Looks good!</p>
                      )}
                    </div>
                    <Button type="button" className="w-full" onClick={handleNext} disabled={!isStep1Valid}>
                      Continue <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Business Name *</label>
                        <Input value={form.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="Your store name" maxLength={100} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Type *</label>
                        <Select value={form.businessType} onValueChange={(v) => update("businessType", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="retailer">Retailer</SelectItem>
                            <SelectItem value="wholesaler">Wholesaler</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Contact Person *</label>
                        <Input value={form.contactPerson} onChange={(e) => update("contactPerson", e.target.value)} placeholder="Your name" maxLength={100} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Phone *</label>
                        <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91 XXXXX XXXXX" maxLength={15} />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium">City *</label>
                        <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="e.g., Mumbai" maxLength={50} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">State</label>
                        <Input value={form.state} onChange={(e) => update("state", e.target.value)} maxLength={50} />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">GST Number <span className="text-muted-foreground font-normal">(optional)</span></label>
                      <Input value={form.gstNumber} onChange={(e) => update("gstNumber", e.target.value)} placeholder="22AAAAA0000A1Z5" maxLength={15} />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">How did you hear about us? *</label>
                      <Select value={form.referralSource} onValueChange={(v) => { update("referralSource", v); if (v !== "Others") update("referralOther", ""); }}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {REFERRAL_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.referralSource === "Others" && (
                        <Input className="mt-2" placeholder="Please specify" value={form.referralOther} onChange={(e) => update("referralOther", e.target.value)} maxLength={100} />
                      )}
                    </div>

                    <div className="flex gap-3 pt-1">
                      <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back
                      </Button>
                      <Button type="submit" className="flex-[2]" disabled={loading || !isStep2Valid}>
                        {loading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...</>
                        ) : (
                          "Create Account →"
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">Sign In</Link>
            </p>
          </CardContent>
        </Card>

        {/* Trust badges */}
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-accent px-3 py-1">✓ 850+ designs</span>
          <span className="rounded-full bg-accent px-3 py-1">✓ GST invoices</span>
          <span className="rounded-full bg-accent px-3 py-1">✓ Free shipping</span>
          <span className="rounded-full bg-accent px-3 py-1">✓ 3700+ retailers</span>
        </div>
      </motion.div>
    </div>
  );
}
