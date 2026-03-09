import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Clock, CheckCircle, Truck, XCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];

const statusColors: Record<string, string> = {
  placed: "bg-secondary text-secondary-foreground",
  confirmed: "bg-accent text-accent-foreground",
  dispatched: "bg-primary text-primary-foreground",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-destructive/10 text-destructive",
};

const statusFlow: OrderStatus[] = ["placed", "confirmed", "dispatched", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, [filter]);

  const fetchOrders = async () => {
    let q = supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setOrders(data ?? []);
    setLoading(false);
  };

  const updateOrder = async (id: string, updates: { status?: OrderStatus; tracking_info?: string }) => {
    const { error } = await supabase.from("orders").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Order updated!" });
      fetchOrders();
    }
  };

  if (loading) return <p className="py-8 text-center text-muted-foreground">Loading orders...</p>;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {statusFlow.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{orders.length} order(s)</span>
      </div>

      {orders.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No orders found</p>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">#{order.order_number}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  <p className="text-sm mt-1"><strong>{order.total_items}</strong> items · <strong>₹{Number(order.total_amount).toLocaleString()}</strong></p>
                  {order.shipping_address && <p className="text-xs text-muted-foreground mt-1">📍 {order.shipping_address}</p>}
                  {order.notes && <p className="text-xs text-muted-foreground">📝 {order.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={statusColors[order.status] || ""}>{order.status}</Badge>
                  <Select value={order.status} onValueChange={(v) => updateOrder(order.id, { status: v as OrderStatus })}>
                    <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statusFlow.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="Tracking info"
                      defaultValue={order.tracking_info || ""}
                      className="h-8 w-44 text-xs"
                      onBlur={(e) => {
                        if (e.target.value !== (order.tracking_info || "")) {
                          updateOrder(order.id, { tracking_info: e.target.value });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              {order.order_items && order.order_items.length > 0 && (
                <div className="mt-3 border-t border-border pt-3">
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>₹{Number(item.total_price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
