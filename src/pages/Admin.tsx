import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, Package, ShoppingCart, MessageSquare } from "lucide-react";
import AdminBuyers from "@/components/admin/AdminBuyers";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminInquiries from "@/components/admin/AdminInquiries";

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ buyers: 0, pendingBuyers: 0, products: 0, orders: 0, inquiries: 0 });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) { navigate("/"); return; }
    if (user && isAdmin) fetchStats();
  }, [user, isAdmin, loading]);

  const fetchStats = async () => {
    const [buyers, pendingBuyers, products, orders, inquiries] = await Promise.all([
      supabase.from("buyer_profiles").select("id", { count: "exact", head: true }),
      supabase.from("buyer_profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("inquiries").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      buyers: buyers.count ?? 0,
      pendingBuyers: pendingBuyers.count ?? 0,
      products: products.count ?? 0,
      orders: orders.count ?? 0,
      inquiries: inquiries.count ?? 0,
    });
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin) return null;

  const statCards = [
    { label: "Total Buyers", value: stats.buyers, icon: Users, color: "text-primary" },
    { label: "Pending Approvals", value: stats.pendingBuyers, icon: Users, color: "text-secondary" },
    { label: "Products", value: stats.products, icon: Package, color: "text-accent-foreground" },
    { label: "Orders", value: stats.orders, icon: ShoppingCart, color: "text-primary" },
    { label: "Inquiries", value: stats.inquiries, icon: MessageSquare, color: "text-secondary" },
  ];

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-6xl">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-3xl font-bold text-foreground">
          <LayoutDashboard className="mr-2 inline h-8 w-8" /> Admin Panel
        </motion.h1>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          {statCards.map((s) => (
            <Card key={s.label} className="border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <s.icon className={`mx-auto h-6 w-6 ${s.color}`} />
                <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="buyers" className="mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="buyers"><Users className="mr-1 h-4 w-4" /> Buyers</TabsTrigger>
            <TabsTrigger value="products"><Package className="mr-1 h-4 w-4" /> Products</TabsTrigger>
            <TabsTrigger value="orders"><ShoppingCart className="mr-1 h-4 w-4" /> Orders</TabsTrigger>
            <TabsTrigger value="inquiries"><MessageSquare className="mr-1 h-4 w-4" /> Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="buyers"><AdminBuyers onUpdate={fetchStats} /></TabsContent>
          <TabsContent value="products"><AdminProducts onUpdate={fetchStats} /></TabsContent>
          <TabsContent value="orders"><AdminOrders /></TabsContent>
          <TabsContent value="inquiries"><AdminInquiries /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
