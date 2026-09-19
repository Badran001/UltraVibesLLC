import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, Building2, Phone, Mail } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

const empty = { company_name: "", contact_name: "", email: "", phone: "", address: "", mc_number: "", status: "Active", credit_limit: "", notes: "" };

export default function Shippers() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await base44.entities.Shipper.list("-created_date", 200);
    setItems(Array.isArray(res) ? res : []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const openNew = () => { setEditing(null); setForm(empty); setFormOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...empty, ...s, credit_limit: s.credit_limit ?? "" }); setFormOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_name || !form.email) {
      toast({ title: "Company, contact, and email are required.", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, credit_limit: form.credit_limit === "" ? null : Number(form.credit_limit) };
      if (editing) { await base44.entities.Shipper.update(editing.id, payload); toast({ title: "Shipper updated." }); }
      else { await base44.entities.Shipper.create(payload); toast({ title: "Shipper added." }); }
      setFormOpen(false); load();
    } catch (err) { toast({ title: "Failed to save.", description: err.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await base44.entities.Shipper.delete(deleteId);
    toast({ title: "Shipper deleted." }); setDeleteId(null); load();
  };

  const filtered = items.filter((s) => {
    const q = search.toLowerCase();
    return !q || s.company_name?.toLowerCase().includes(q) || s.contact_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <PageHeader title="Shippers" description="Your customer accounts with credit and contact management."
        action={<Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Shipper</Button>} />

      <div className="relative mb-4 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search shippers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">MC Number</TableHead>
              <TableHead className="hidden lg:table-cell">Credit Limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-40" /> No shippers found.
              </TableCell></TableRow>
            ) : filtered.map((s) => (
              <TableRow key={s.id} className="hover:bg-secondary/40">
                <TableCell>
                  <p className="font-medium">{s.company_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone || "—"}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  <p>{s.contact_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</p>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{s.mc_number || "—"}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{s.credit_limit ? `$${s.credit_limit.toLocaleString()}` : "—"}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Shipper" : "Add Shipper"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Company Name *</Label><Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Contact Name *</Label><Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Address</Label><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>MC Number</Label><Input value={form.mc_number} onChange={(e) => set("mc_number", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Credit Limit ($)</Label><Input type="number" value={form.credit_limit} onChange={(e) => set("credit_limit", e.target.value)} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Active", "Inactive", "Prospect"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this shipper?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}