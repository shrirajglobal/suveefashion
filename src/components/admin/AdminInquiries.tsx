import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  new: "bg-secondary text-secondary-foreground",
  contacted: "bg-accent text-accent-foreground",
  converted: "bg-green-100 text-green-800",
};

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInquiries(); }, [filter]);

  const fetchInquiries = async () => {
    let q = supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setInquiries(data ?? []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Inquiry marked as ${status}` });
      fetchInquiries();
    }
  };

  if (loading) return <p className="py-8 text-center text-muted-foreground">Loading inquiries...</p>;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{inquiries.length} inquiry(ies)</span>
      </div>

      {inquiries.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No inquiries found</p>
      ) : (
        inquiries.map((inq) => (
          <Card key={inq.id} className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">{inq.business_name}</h3>
                  <p className="text-xs text-muted-foreground">{inq.contact_person} · {inq.phone} {inq.email && `· ${inq.email}`}</p>
                  {inq.products_interested && <p className="text-xs text-muted-foreground mt-1">Interested in: {inq.products_interested}</p>}
                  {inq.expected_quantity && <p className="text-xs text-muted-foreground">Qty: {inq.expected_quantity}</p>}
                  {inq.message && <p className="text-xs text-muted-foreground mt-1">"{inq.message}"</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(inq.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[inq.status] || ""}>{inq.status}</Badge>
                  {inq.status === "new" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(inq.id, "contacted")}>Mark Contacted</Button>
                      <Button size="sm" variant="default" onClick={() => updateStatus(inq.id, "converted")}>Converted</Button>
                    </>
                  )}
                  {inq.status === "contacted" && (
                    <Button size="sm" variant="default" onClick={() => updateStatus(inq.id, "converted")}>Converted</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
