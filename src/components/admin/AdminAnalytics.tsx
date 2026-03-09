import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["hsl(345, 60%, 30%)", "hsl(38, 70%, 50%)", "hsl(350, 40%, 70%)", "hsl(30, 30%, 60%)", "hsl(200, 40%, 50%)"];

export default function AdminAnalytics() {
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [ordersByMonth, setOrdersByMonth] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [inquiryConversion, setInquiryConversion] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    const [ordersRes, orderItemsRes, inquiriesRes] = await Promise.all([
      supabase.from("orders").select("id, status, created_at, total_amount"),
      supabase.from("order_items").select("product_name, quantity, total_price"),
      supabase.from("inquiries").select("status"),
    ]);

    const orders = ordersRes.data ?? [];
    const items = orderItemsRes.data ?? [];
    const inquiries = inquiriesRes.data ?? [];

    // Orders by status
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
    setOrdersByStatus(Object.entries(statusCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

    // Orders by month
    const monthCounts: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach((o) => {
      const month = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (!monthCounts[month]) monthCounts[month] = { orders: 0, revenue: 0 };
      monthCounts[month].orders++;
      monthCounts[month].revenue += Number(o.total_amount);
    });
    setOrdersByMonth(Object.entries(monthCounts).map(([month, data]) => ({ month, ...data })));

    // Top products by quantity
    const productTotals: Record<string, number> = {};
    items.forEach((item) => { productTotals[item.product_name] = (productTotals[item.product_name] || 0) + item.quantity; });
    setTopProducts(
      Object.entries(productTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, qty]) => ({ name: name.length > 20 ? name.slice(0, 20) + "…" : name, qty }))
    );

    // Inquiry conversion
    const inqStatus: Record<string, number> = {};
    inquiries.forEach((i) => { inqStatus[i.status] = (inqStatus[i.status] || 0) + 1; });
    setInquiryConversion(Object.entries(inqStatus).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));

    setLoading(false);
  };

  if (loading) return <p className="py-8 text-center text-muted-foreground">Loading analytics...</p>;

  const noData = ordersByStatus.length === 0 && topProducts.length === 0;
  if (noData) return <p className="py-12 text-center text-muted-foreground">No data yet. Analytics will populate as orders and inquiries come in.</p>;

  return (
    <div className="mt-4 grid gap-6 md:grid-cols-2">
      {/* Orders by Status */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={ordersByStatus} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ordersByMonth}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(345, 60%, 30%)" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-4">Top Products by Quantity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
              <Tooltip />
              <Bar dataKey="qty" fill="hsl(38, 70%, 50%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Inquiry Conversion */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-4">Inquiry Conversion</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={inquiryConversion} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {inquiryConversion.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
