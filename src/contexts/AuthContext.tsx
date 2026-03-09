import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  buyerStatus: "pending" | "approved" | "rejected" | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  buyerStatus: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [buyerStatus, setBuyerStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserMeta = async (u: User) => {
    // Check buyer profile status
    const { data: profile } = await supabase
      .from("buyer_profiles")
      .select("status")
      .eq("user_id", u.id)
      .maybeSingle();
    
    setBuyerStatus(profile?.status ?? null);

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.id);
    
    setIsAdmin(roles?.some((r) => r.role === "admin") ?? false);
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
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, buyerStatus, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
