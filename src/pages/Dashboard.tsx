import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Package, FlaskConical, User, Clock, CheckCircle, Truck, XCircle, Edit, FileText } from "lucide-react";

const statusColors: Record<string, string> = {
  placed: "bg-secondary text-secondary-foreground",
  confirmed: "bg-accent text-accent-foreground",
  dispatched: "bg-primary text-primary-foreground",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-destructive/10 text-destructive",
  requested: "bg-secondary text-secondary-foreground",
  approved: "bg-accent text-accent-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

const statusIcons: Record<string, any> = {
  placed: Clock,
  confirmed: CheckCircle,
  dispatched: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  requested: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

export default function Dashboard() {
  const { user, buyerStatus } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [ordersRes, samplesRes, profileRes] = await Promise.all([
      supabase.from("orders").select("*, order_items(*)").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("sample_requests").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("buyer_profiles").select("*").eq("user_id", user!.id).maybeSingle(),
    ]);
    setOrders(ordersRes.data ?? []);
    setSamples(samplesRes.data ?? []);
    setProfile(profileRes.data);
    if (profileRes.data) setProfileForm(profileRes.data);
    setLoading(false);
  };

  const updateProfile = async () => {
    const { error } = await supabase.from("buyer_profiles").update({
      business_name: profileForm.business_name,
      contact_person: profileForm.contact_person,
      phone: profileForm.phone,
      city: profileForm.city,
      state: profileForm.state,
      gst_number: profileForm.gst_number,
    }).eq("user_id", user!.id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      setEditingProfile(false);
      fetchData();
    }
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-5xl">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-3xl font-bold text-foreground">
          Buyer Dashboard
        </motion.h1>

        {buyerStatus === "pending" && (
          <Card className="mt-4 border-secondary bg-accent">
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-5 w-5 text-secondary" />
              <p className="text-sm font-medium">Your account is under review. You'll be able to place orders once approved.</p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="orders" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders"><Package className="mr-1 h-4 w-4" /> Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="samples"><FlaskConical className="mr-1 h-4 w-4" /> Samples ({samples.length})</TabsTrigger>
            <TabsTrigger value="profile"><User className="mr-1 h-4 w-4" /> Profile</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4 space-y-4">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3">No orders yet</p>
                {buyerStatus === "approved" && (
                  <Button className="mt-3" asChild><Link to="/catalogues">Browse Catalogues</Link></Button>
                )}
              </div>
            ) : (
              orders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Clock;
                return (
                  <Card key={order.id} className="border-0 shadow-md">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display text-base font-semibold text-foreground">Order #{order.order_number}</h3>
                          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge className={statusColors[order.status] || ""}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <span><strong>{order.total_items}</strong> items</span>
                        <span>Total: <strong>₹{Number(order.total_amount).toLocaleString()}</strong></span>
                      </div>
                      {order.tracking_info && (
                        <p className="mt-2 text-xs text-muted-foreground">Tracking: {order.tracking_info}</p>
                      )}
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mt-3 border-t border-border pt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Items:</p>
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
                );
              })
            )}
          </TabsContent>

          {/* Samples Tab */}
          <TabsContent value="samples" className="mt-4 space-y-4">
            {samples.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <FlaskConical className="mx-auto h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3">No sample requests yet</p>
              </div>
            ) : (
              samples.map((sample) => {
                const StatusIcon = statusIcons[sample.status] || Clock;
                return (
                  <Card key={sample.id} className="border-0 shadow-md">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="font-display text-sm font-semibold text-foreground">{sample.product_name}</h3>
                        <p className="text-xs text-muted-foreground">{new Date(sample.created_at).toLocaleDateString()}</p>
                        {sample.notes && <p className="mt-1 text-xs text-muted-foreground">{sample.notes}</p>}
                        {sample.admin_notes && <p className="mt-1 text-xs text-primary">Admin: {sample.admin_notes}</p>}
                      </div>
                      <Badge className={statusColors[sample.status] || ""}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {sample.status.charAt(0).toUpperCase() + sample.status.slice(1)}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4">
            {profile ? (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-lg">Business Profile</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setEditingProfile(!editingProfile)}>
                      <Edit className="mr-1 h-4 w-4" /> {editingProfile ? "Cancel" : "Edit"}
                    </Button>
                  </div>
                  <CardDescription>
                    Status: <Badge className={statusColors[profile.status] || ""}>{profile.status}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {editingProfile ? (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium">Business Name</label>
                          <Input value={profileForm.business_name || ""} onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })} maxLength={100} />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium">Contact Person</label>
                          <Input value={profileForm.contact_person || ""} onChange={(e) => setProfileForm({ ...profileForm, contact_person: e.target.value })} maxLength={100} />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium">Phone</label>
                          <Input value={profileForm.phone || ""} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} maxLength={15} />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium">GST Number</label>
                          <Input value={profileForm.gst_number || ""} onChange={(e) => setProfileForm({ ...profileForm, gst_number: e.target.value })} maxLength={15} />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium">City</label>
                          <Input value={profileForm.city || ""} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} maxLength={50} />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium">State</label>
                          <Input value={profileForm.state || ""} onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })} maxLength={50} />
                        </div>
                      </div>
                      <Button onClick={updateProfile}>Save Changes</Button>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div><span className="text-muted-foreground">Business:</span> <strong>{profile.business_name}</strong></div>
                      <div><span className="text-muted-foreground">Type:</span> <strong>{profile.business_type}</strong></div>
                      <div><span className="text-muted-foreground">Contact:</span> <strong>{profile.contact_person}</strong></div>
                      <div><span className="text-muted-foreground">Phone:</span> <strong>{profile.phone}</strong></div>
                      <div><span className="text-muted-foreground">Email:</span> <strong>{profile.email}</strong></div>
                      <div><span className="text-muted-foreground">GST:</span> <strong>{profile.gst_number || "N/A"}</strong></div>
                      <div><span className="text-muted-foreground">City:</span> <strong>{profile.city}</strong></div>
                      <div><span className="text-muted-foreground">State:</span> <strong>{profile.state}</strong></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>No profile found. <Link to="/register" className="text-primary hover:underline">Register as a buyer</Link></p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
