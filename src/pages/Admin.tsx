import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Users, Package, ShoppingCart, MessageSquare, BarChart3, Image, Brain, FolderOpen, FileDown, ShieldCheck, Contact } from "lucide-react";
import AdminLeads from "@/components/admin/AdminLeads";
import AdminBuyers from "@/components/admin/AdminBuyers";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminInquiries from "@/components/admin/AdminInquiries";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminInsights from "@/components/admin/AdminInsights";
import AdminBanners from "@/components/admin/AdminBanners";
import AdminCatalogueDownload from "@/components/admin/AdminCatalogueDownload";
import AdminSubAdmins from "@/components/admin/AdminSubAdmins";

export default function Admin() {
  const { user, isAdmin, isSubAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ buyers: 0, pendingBuyers: 0, products: 0, orders: 0, inquiries: 0 });

  const hasAccess = isAdmin || isSubAdmin;

  useEffect(() => {
    if (!loading && (!user || !hasAccess)) { navigate("/"); return; }
    if (user && isAdmin) fetchStats();
  }, [user, isAdmin, isSubAdmin, loading]);

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
  if (!hasAccess) return null;

  const statCards = [
    { label: "Total Buyers", value: stats.buyers, icon: Users, color: "text-primary" },
    { label: "Pending Approvals", value: stats.pendingBuyers, icon: Users, color: "text-secondary" },
    { label: "Products", value: stats.products, icon: Package, color: "text-accent-foreground" },
    { label: "Orders", value: stats.orders, icon: ShoppingCart, color: "text-primary" },
    { label: "Inquiries", value: stats.inquiries, icon: MessageSquare, color: "text-secondary" },
  ];

  // Sub-admin only sees Categories, Products, Catalogue
  const subAdminDefaultTab = "categories";

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-6xl">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-3xl font-bold text-foreground">
          <LayoutDashboard className="mr-2 inline h-8 w-8" /> {isAdmin ? "Admin Panel" : "Sub-Admin Panel"}
        </motion.h1>

        {isAdmin && (
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
        )}

        <Tabs defaultValue={isAdmin ? "buyers" : subAdminDefaultTab} className="mt-8">
          <TabsList className="flex w-full overflow-x-auto scrollbar-hide h-auto p-1">
            {isAdmin && <TabsTrigger value="buyers" className="flex-shrink-0 px-2 sm:px-3"><Users className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Buyers</span></TabsTrigger>}
            <TabsTrigger value="categories" className="flex-shrink-0 px-2 sm:px-3"><FolderOpen className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Categories</span></TabsTrigger>
            <TabsTrigger value="products" className="flex-shrink-0 px-2 sm:px-3"><Package className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Products</span></TabsTrigger>
            {isAdmin && <TabsTrigger value="banners" className="flex-shrink-0 px-2 sm:px-3"><Image className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Banners</span></TabsTrigger>}
            <TabsTrigger value="catalogue" className="flex-shrink-0 px-2 sm:px-3"><FileDown className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Catalogue</span></TabsTrigger>
            {isAdmin && <TabsTrigger value="orders" className="flex-shrink-0 px-2 sm:px-3"><ShoppingCart className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Orders</span></TabsTrigger>}
            {isAdmin && <TabsTrigger value="inquiries" className="flex-shrink-0 px-2 sm:px-3"><MessageSquare className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Inquiries</span></TabsTrigger>}
            {isAdmin && <TabsTrigger value="insights" className="flex-shrink-0 px-2 sm:px-3"><Brain className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Insights</span></TabsTrigger>}
            {isAdmin && <TabsTrigger value="analytics" className="flex-shrink-0 px-2 sm:px-3"><BarChart3 className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Analytics</span></TabsTrigger>}
            {isAdmin && <TabsTrigger value="subadmins" className="flex-shrink-0 px-2 sm:px-3"><ShieldCheck className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Sub-Admins</span></TabsTrigger>}
          </TabsList>

          {isAdmin && <TabsContent value="buyers"><AdminBuyers onUpdate={fetchStats} /></TabsContent>}
          <TabsContent value="categories"><AdminCategories /></TabsContent>
          <TabsContent value="products"><AdminProducts onUpdate={fetchStats} /></TabsContent>
          {isAdmin && <TabsContent value="banners"><AdminBanners /></TabsContent>}
          <TabsContent value="catalogue"><AdminCatalogueDownload /></TabsContent>
          {isAdmin && <TabsContent value="orders"><AdminOrders /></TabsContent>}
          {isAdmin && <TabsContent value="inquiries"><AdminInquiries /></TabsContent>}
          {isAdmin && <TabsContent value="insights"><AdminInsights /></TabsContent>}
          {isAdmin && <TabsContent value="analytics"><AdminAnalytics /></TabsContent>}
          {isAdmin && <TabsContent value="subadmins"><AdminSubAdmins /></TabsContent>}
        </Tabs>
      </div>
    </div>
  );
}
