import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Percent, Edit2 } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-destructive/10 text-destructive",
};

export default function AdminBuyers({ onUpdate }: { onUpdate: () => void }) {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [discountInputs, setDiscountInputs] = useState<Record<string, string>>({});
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);

  useEffect(() => { fetchBuyers(); }, [filter]);

  const fetchBuyers = async () => {
    let q = supabase.from("buyer_profiles").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter as any);
    const { data } = await q;
    setBuyers(data ?? []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: "approved" | "rejected", discountPercent?: number) => {
    const updateData: any = { status };
    if (status === "approved" && discountPercent !== undefined) {
      updateData.discount_percent = discountPercent;
    }
    const { error } = await supabase.from("buyer_profiles").update(updateData).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Buyer ${status}!${status === "approved" && discountPercent ? ` Discount: ${discountPercent}%` : ""}` });
      setDiscountInputs((prev) => { const n = { ...prev }; delete n[id]; return n; });
      setEditingDiscount(null);
      fetchBuyers();
      onUpdate();
    }
  };

  const updateDiscount = async (id: string) => {
    const val = parseFloat(discountInputs[id] || "0");
    if (isNaN(val) || val < 0 || val > 100) {
      toast({ title: "Discount must be between 0 and 100", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("buyer_profiles").update({ discount_percent: val }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Discount updated to ${val}%` });
      setEditingDiscount(null);
      fetchBuyers();
    }
  };

  if (loading) return <p className="py-8 text-center text-muted-foreground">Loading buyers...</p>;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{buyers.length} buyer(s)</span>
      </div>

      {buyers.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No buyers found</p>
      ) : (
        buyers.map((b) => (
          <Card key={b.id} className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">{b.business_name}</h3>
                  <p className="text-xs text-muted-foreground">{b.contact_person} · {b.phone} · {b.email}</p>
                  <p className="text-xs text-muted-foreground">{b.city}, {b.state} · {b.business_type} · GST: {b.gst_number || "N/A"}</p>
                  {b.referral_source && <p className="text-xs text-muted-foreground">Heard via: {b.referral_source}</p>}
                  <p className="text-xs text-muted-foreground">Registered: {new Date(b.created_at).toLocaleDateString()}</p>
                  {b.status === "approved" && (
                    <p className="mt-1 text-xs font-medium text-green-700">
                      <Percent className="mr-1 inline h-3 w-3" />
                      Discount: {b.discount_percent || 0}%
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[b.status] || ""}>{b.status}</Badge>
                    {b.status === "pending" && (
                      <>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Discount %"
                            className="h-8 w-24 text-xs"
                            value={discountInputs[b.id] || ""}
                            onChange={(e) => setDiscountInputs((prev) => ({ ...prev, [b.id]: e.target.value }))}
                          />
                        </div>
                        <Button size="sm" variant="default" onClick={() => updateStatus(b.id, "approved", parseFloat(discountInputs[b.id] || "0"))}>
                          <CheckCircle className="mr-1 h-3 w-3" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, "rejected")}>
                          <XCircle className="mr-1 h-3 w-3" /> Reject
                        </Button>
                      </>
                    )}
                    {b.status === "rejected" && (
                      <Button size="sm" variant="default" onClick={() => updateStatus(b.id, "approved")}>
                        <CheckCircle className="mr-1 h-3 w-3" /> Approve
                      </Button>
                    )}
                    {b.status === "approved" && (
                      <>
                        {editingDiscount === b.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              className="h-8 w-20 text-xs"
                              value={discountInputs[b.id] ?? String(b.discount_percent || 0)}
                              onChange={(e) => setDiscountInputs((prev) => ({ ...prev, [b.id]: e.target.value }))}
                            />
                            <Button size="sm" variant="default" onClick={() => updateDiscount(b.id)}>
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingDiscount(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => { setEditingDiscount(b.id); setDiscountInputs((prev) => ({ ...prev, [b.id]: String(b.discount_percent || 0) })); }}>
                            <Edit2 className="mr-1 h-3 w-3" /> Edit Discount
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, "rejected")}>
                          <XCircle className="mr-1 h-3 w-3" /> Revoke
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
