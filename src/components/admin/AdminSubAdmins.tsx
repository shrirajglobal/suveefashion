import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Trash2, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SubAdmin {
  user_id: string;
  email: string;
}

export default function AdminSubAdmins() {
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchSubAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-sub-admin", {
        body: { action: "list" },
      });
      if (error) throw error;
      setSubAdmins(data.subAdmins || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const handleAdd = async () => {
    if (!email.trim()) return;
    setAdding(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-sub-admin", {
        body: { action: "add", email: email.trim().toLowerCase() },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      toast({ title: "Sub-admin added", description: `${email} now has sub-admin access.` });
      setEmail("");
      fetchSubAdmins();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (userId: string, userEmail: string) => {
    if (!confirm(`Remove sub-admin access for ${userEmail}?`)) return;
    try {
      const { data, error } = await supabase.functions.invoke("manage-sub-admin", {
        body: { action: "remove", user_id: userId },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      toast({ title: "Removed", description: `${userEmail} is no longer a sub-admin.` });
      fetchSubAdmins();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> Add Sub-Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Sub-admins can manage Categories, Products, and Catalogues only. Enter the email of a registered user.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="max-w-sm"
            />
            <Button onClick={handleAdd} disabled={adding || !email.trim()}>
              {adding ? "Adding..." : "Add Sub-Admin"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Current Sub-Admins
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : subAdmins.length === 0 ? (
            <p className="text-muted-foreground">No sub-admins yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subAdmins.map((sa) => (
                  <TableRow key={sa.user_id}>
                    <TableCell>{sa.email}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(sa.user_id, sa.email)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
