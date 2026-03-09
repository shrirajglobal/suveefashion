import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Eye, EyeOff, CheckCircle, Shield, Truck, Tag } from "lucide-react";

const benefits = [
  { icon: Tag, text: "Unlock wholesale prices & bulk discounts" },
  { icon: Shield, text: "GST-compliant invoices for your business" },
  { icon: Truck, text: "Priority dispatch & free shipping on large orders" },
  { icon: CheckCircle, text: "Access 850+ exclusive kurti designs" },
];

export default function Register() {
  const { t } = useLanguage();
  const navigate = useNavigate();
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
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, businessName, city, contactPerson, phone } = form;
    if (!email || !password || !businessName || !city || !contactPerson || !phone) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
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

    const { error: profileError } = await supabase.from("buyer_profiles").insert({
      user_id: authData.user.id,
      business_name: form.businessName.trim(),
      gst_number: form.gstNumber.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      contact_person: form.contactPerson.trim(),
      phone: form.phone.trim(),
      email: email.trim(),
      business_type: form.businessType,
    });

    setLoading(false);

    if (profileError) {
      toast({ title: "Profile creation failed", description: profileError.message, variant: "destructive" });
      return;
    }

    toast({
      title: "Registration successful! 🎉",
      description: "Please check your email to verify your account. Our team will review and approve your buyer access within 24-48 hours.",
    });
    navigate("/login");
  };

  return (
    <div className="py-12">
      <div className="container grid items-start gap-10 lg:grid-cols-5">
        {/* Benefits sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:col-span-2 lg:block"
        >
          <h2 className="font-display text-2xl font-bold text-foreground">Why register with Suvee?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Join 3700+ retailers across India who trust Suvee Fashion for their kurti sourcing.</p>
          <div className="mt-8 space-y-5">
            {benefits.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{text}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 rounded-xl bg-accent p-5">
            <p className="text-sm font-semibold text-foreground">⏱ Takes only 2 minutes</p>
            <p className="mt-1 text-xs text-muted-foreground">Fill the form, verify your email, and our team will approve you within 24 hours. No hidden charges.</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full gradient-maroon">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="font-display text-2xl">{t("cta.register_button")}</CardTitle>
              <CardDescription>
                Free registration • No hidden charges • Approved within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Business Name *</label>
                    <Input value={form.businessName} onChange={(e) => update("businessName", e.target.value)} maxLength={100} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Business Type *</label>
                    <Select value={form.businessType} onValueChange={(v) => update("businessType", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retailer">Retailer</SelectItem>
                        <SelectItem value="wholesaler">Wholesaler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Contact Person *</label>
                    <Input value={form.contactPerson} onChange={(e) => update("contactPerson", e.target.value)} maxLength={100} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Phone *</label>
                    <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} maxLength={15} placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">GST Number (optional)</label>
                  <Input value={form.gstNumber} onChange={(e) => update("gstNumber", e.target.value)} maxLength={15} placeholder="e.g., 22AAAAA0000A1Z5" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">City *</label>
                    <Input value={form.city} onChange={(e) => update("city", e.target.value)} maxLength={50} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">State</label>
                    <Input value={form.state} onChange={(e) => update("state", e.target.value)} maxLength={50} />
                  </div>
                </div>

                <hr className="my-2 border-border" />

                <div>
                  <label className="mb-1 block text-sm font-medium">Email *</label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={255} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Password *</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      maxLength={128}
                      placeholder="Min 6 characters"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Free Buyer Account →"}
                </Button>
              </form>

              {/* Mobile benefits */}
              <div className="mt-6 flex flex-wrap justify-center gap-3 lg:hidden">
                {benefits.map(({ text }, i) => (
                  <span key={i} className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">✓ {text.split(" ").slice(0, 4).join(" ")}</span>
                ))}
              </div>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
