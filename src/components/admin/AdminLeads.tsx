import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  name: string;
  city: string;
  buyer_type: string;
  whatsapp: string;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = ["new", "contacted", "converted"] as const;
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  converted: "bg-green-100 text-green-800",
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setLeads((data as Lead[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status } as any).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      toast({ title: "Updated" });
    }
  };

  const filtered = leads.filter((l) => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.city.toLowerCase().includes(search.toLowerCase()) || l.whatsapp.includes(search);
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const exportCSV = () => {
    const header = "Name,City,Buyer Type,WhatsApp,Status,Date\n";
    const rows = filtered.map((l) => `"${l.name}","${l.city}","${l.buyer_type}","${l.whatsapp}","${l.status}","${new Date(l.created_at).toLocaleDateString()}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, city, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLeads}><RefreshCw className="mr-1 h-4 w-4" /> Refresh</Button>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="mr-1 h-4 w-4" /> Export CSV</Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</p>

      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No leads found</TableCell></TableRow>
              ) : filtered.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.city}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{lead.buyer_type}</Badge></TableCell>
                  <TableCell>
                    <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">{lead.whatsapp}</a>
                  </TableCell>
                  <TableCell>
                    <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                      <SelectTrigger className={`h-7 w-28 text-xs ${STATUS_COLORS[lead.status] || ""}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
