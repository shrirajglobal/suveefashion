import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  buyerStatus: "pending" | "approved" | "rejected" | null;
  discountPercent: number;
  businessName: string | null;
  isAdmin: boolean;
  isSubAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  buyerStatus: null,
  discountPercent: 0,
  businessName: null,
  isAdmin: false,
  isSubAdmin: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [buyerStatus, setBuyerStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserMeta = async (u: User) => {
    try {
      // Check buyer profile status
      const { data: profile } = await supabase
        .from("buyer_profiles")
        .select("status, discount_percent, business_name")
        .eq("user_id", u.id)
        .maybeSingle();
      
      setBuyerStatus(profile?.status ?? null);
      setDiscountPercent(Number(profile?.discount_percent) || 0);
      setBusinessName(profile?.business_name ?? null);

      // Check admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.id);
      
      setIsAdmin(roles?.some((r) => r.role === "admin") ?? false);
      setIsSubAdmin(roles?.some((r) => r.role === "sub_admin") ?? false);
    } catch (err) {
      console.error("fetchUserMeta error:", err);
      setBuyerStatus(null);
      setDiscountPercent(0);
      setBusinessName(null);
      setIsAdmin(false);
      setIsSubAdmin(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        // Use setTimeout to avoid Supabase auth deadlock
        setTimeout(() => fetchUserMeta(u), 0);
      } else {
        setBuyerStatus(null);
        setDiscountPercent(0);
        setBusinessName(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchUserMeta(u);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBuyerStatus(null);
    setDiscountPercent(0);
    setBusinessName(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, buyerStatus, discountPercent, businessName, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
