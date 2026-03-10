import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import casualImg from "@/assets/category-casual.jpg";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    wsp: number | null;
    pcs_per_set: number;
    image_url: string | null;
    fabric: string | null;
  } | null;
}

export default function Cart() {
  const { user, buyerStatus, discountPercent } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (buyerStatus !== "approved") { navigate("/catalogues"); return; }
    fetchCart();
  }, [user, buyerStatus]);

  const fetchCart = async () => {
    const { data } = await supabase
      .from("cart_items")
      .select("*, product:products(id, name, wsp, pcs_per_set, image_url, fabric)")
      .eq("user_id", user!.id);
    setItems((data as any) ?? []);
    setLoading(false);
  };

  const getUnitPrice = (product: CartItem["product"]): number => {
    if (!product) return 0;
    const wsp = Number(product.wsp) || 0;
    if (discountPercent > 0) {
      return Math.round(wsp * (1 - discountPercent / 100) * 100) / 100;
    }
    return wsp;
  };

  const updateQuantity = async (itemId: string, newQty: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item?.product) return;
    const step = item.product.pcs_per_set || 1;
    // Snap to nearest valid multiple
    const snapped = Math.max(step, Math.round(newQty / step) * step);
    await supabase.from("cart_items").update({ quantity: snapped }).eq("id", itemId);
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity: snapped } : i)));
  };

  const removeItem = async (itemId: string) => {
    await supabase.from("cart_items").delete().eq("id", itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    toast({ title: "Item removed from cart" });
  };

  const totalAmount = items.reduce((sum, item) => {
    const price = getUnitPrice(item.product);
    return sum + price * item.quantity;
  }, 0);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    if (items.length === 0) return;
    setSubmitting(true);

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user!.id,
        order_number: "temp",
        total_amount: totalAmount,
        total_items: totalItems,
        shipping_address: shippingAddress.trim() || null,
        notes: notes.trim() || null,
      })
      .select()
      .single();

    if (orderErr || !order) {
      toast({ title: "Failed to place order", description: orderErr?.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product?.name ?? "Unknown",
      quantity: item.quantity,
      unit_price: getUnitPrice(item.product),
      total_price: getUnitPrice(item.product) * item.quantity,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
    if (itemsErr) {
      toast({ title: "Order created but items failed", description: itemsErr.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    await supabase.from("cart_items").delete().eq("user_id", user!.id);
    toast({ title: "Order placed successfully! 🎉", description: `Order #${order.order_number}. We'll confirm it shortly.` });
    setSubmitting(false);
    navigate("/dashboard");
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><p className="text-muted-foreground">Loading cart...</p></div>;

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-4xl">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-3xl font-bold text-foreground">
          <ShoppingCart className="mr-2 inline h-8 w-8" /> Your Cart
        </motion.h1>

        {items.length === 0 ? (
          <div className="mt-12 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/40" />
            <p className="mt-4 text-lg text-muted-foreground">Your cart is empty</p>
            <Button className="mt-4" asChild><Link to="/catalogues">Browse Catalogues</Link></Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => {
                const unitPrice = getUnitPrice(item.product);
                const wsp = Number(item.product?.wsp) || 0;
                const step = item.product?.pcs_per_set || 1;
                const hasDiscount = discountPercent > 0 && wsp > 0;
                return (
                  <Card key={item.id} className="border-0 shadow-md">
                    <CardContent className="flex gap-4 p-4">
                      <img
                        src={item.product?.image_url || casualImg}
                        alt={item.product?.name}
                        className="h-24 w-20 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-display text-sm font-semibold text-foreground">{item.product?.name}</h3>
                        {item.product?.fabric && <p className="text-xs text-muted-foreground">{item.product.fabric}</p>}
                        <div className="mt-1">
                          {hasDiscount ? (
                            <p className="text-sm">
                              <span className="text-muted-foreground line-through">₹{wsp}</span>{" "}
                              <span className="font-semibold text-foreground">₹{unitPrice}</span>{" "}
                              <span className="text-xs text-green-600">({discountPercent}% off)</span>{" "}
                              <span className="text-xs text-muted-foreground">+ GST (5%)</span>
                            </p>
                          ) : (
                            <p className="text-sm font-semibold text-foreground">₹{unitPrice} / pc <span className="text-xs font-normal text-muted-foreground">+ GST (5%)</span></p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{step} pcs/set</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - step)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || step)}
                            className="h-7 w-20 text-center text-sm"
                            min={step}
                            step={step}
                          />
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + step)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-destructive" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="mt-1 text-xs font-medium text-secondary">Subtotal: ₹{(unitPrice * item.quantity).toLocaleString()} + GST</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div>
              <Card className="border-0 shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Items</span>
                    <span className="font-medium">{totalItems} pcs</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your Discount</span>
                      <span className="font-medium text-green-600">{discountPercent}% off</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">₹{totalAmount.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">+ GST (5%)</span></span>
                  </div>
                  <hr className="border-border" />
                  <div>
                    <label className="mb-1 block text-xs font-medium">Shipping Address</label>
                    <Textarea value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} rows={2} maxLength={500} placeholder="Enter delivery address" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium">Order Notes</label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={500} placeholder="Any special instructions" />
                  </div>
                  <p className="text-xs text-muted-foreground">Payment: Bank Transfer / COD (confirmed after order placement)</p>
                  <Button className="w-full" size="lg" disabled={submitting} onClick={placeOrder}>
                    {submitting ? "Placing Order..." : "Place Order"} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
