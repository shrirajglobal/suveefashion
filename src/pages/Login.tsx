import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, Tag, ShoppingBag } from "lucide-react";

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const prefillEmail = (location.state as any)?.email || "";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);

    if (error) {
      // Better error messages
      if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Email not verified",
          description: "Please check your inbox and click the verification link before signing in.",
          variant: "destructive",
        });
      } else if (error.message.includes("Invalid login credentials")) {
        toast({
          title: "Invalid credentials",
          description: "Email or password is incorrect. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      }
      return;
    }

    // Check if buyer profile exists
    const userId = data.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("buyer_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profile) {
        // User exists but no profile — send to complete profile
        toast({
          title: "Almost there!",
          description: "Please complete your business profile to get started.",
        });
        navigate("/register");
        return;
      }
    }

    toast({ title: "Welcome back! 🎉" });
    navigate("/catalogues");
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full gradient-maroon">
              <LogIn className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="font-display text-2xl">{t("nav.login")}</CardTitle>
            <CardDescription>Sign in to access wholesale prices and place orders</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">{t("contact.email")}</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} placeholder="you@business.com" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={128}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In →"}
              </Button>
            </form>

            {/* Value reminder */}
            <div className="mt-6 rounded-xl bg-accent p-4">
              <p className="mb-2 text-xs font-semibold text-foreground">What you get as a Suvee buyer:</p>
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-2 text-xs text-muted-foreground"><Tag className="h-3 w-3 text-secondary" /> Wholesale prices up to 60% below MRP</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground"><ShoppingBag className="h-3 w-3 text-secondary" /> Access to 850+ exclusive designs</span>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Register as Buyer — Free
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
