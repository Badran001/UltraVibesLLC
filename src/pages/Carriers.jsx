import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, Truck, Phone, Mail } from "lucide-react";
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

const EQUIPMENT = ["Dry Van", "Reefer", "Flatbed", "Step Deck", "Power Only", "Tanker"];
const empty = { company_name: "", contact_name: "", email: "", phone: "", mc_number: "", dot_number: "", equipment_type: "Dry Van", insurance_status: "Valid", insurance_expiry: "", status: "Active", notes: "" };

export default function Carriers() {
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
    const res = await base44.entities.Carrier.list("-created_date", 200);
    setItems(Array.isArray(res) ? res : []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const openNew = () => { setEditing(null); setForm(empty); setFormOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...empty, ...c, insurance_expiry: c.insurance_expiry?.slice(0, 10) || "" }); setFormOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_name || !form.phone) {
      toast({ title: "Company, contact, and phone are required.", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      if (editing) { await base44.entities.Carrier.update(editing.id, form); toast({ title: "Carrier updated." }); }
      else { await base44.entities.Carrier.create(form); toast({ title: "Carrier added." }); }
      setFormOpen(false); load();
    } catch (err) { toast({ title: "Failed to save.", description: err.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await base44.entities.Carrier.delete(deleteId);
    toast({ title: "Carrier deleted." }); setDeleteId(null); load();
  };

  const filtered = items.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.company_name?.toLowerCase().includes(q) || c.mc_number?.toLowerCase().includes(q) || c.contact_name?.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout>
      <PageHeader title="Carriers" description="Your vetted carrier network with MC/DOT and insurance tracking."
        action={<Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Carrier</Button>} />

      <div className="relative mb-4 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search carriers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">MC / DOT</TableHead>
              <TableHead className="hidden lg:table-cell">Equipment</TableHead>
              <TableHead>Insurance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                <Truck className="h-10 w-10 mx-auto mb-2 opacity-40" /> No carriers found.
              </TableCell></TableRow>
            ) : filtered.map((c) => (
              <TableRow key={c.id} className="hover:bg-secondary/40">
                <TableCell>
                  <p className="font-medium">{c.company_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  <p>{c.contact_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</p>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{c.mc_number || "—"} / {c.dot_number || "—"}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{c.equipment_type}</TableCell>
                <TableCell><StatusBadge status={c.insurance_status} /></TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Carrier" : "Add Carrier"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Company Name *</Label><Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Contact Name *</Label><Input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>MC Number</Label><Input value={form.mc_number} onChange={(e) => set("mc_number", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>DOT Number</Label><Input value={form.dot_number} onChange={(e) => set("dot_number", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Equipment</Label>
                <Select value={form.equipment_type} onValueChange={(v) => set("equipment_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EQUIPMENT.map((eq) => <SelectItem key={eq} value={eq}>{eq}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Insurance Status</Label>
                <Select value={form.insurance_status} onValueChange={(v) => set("insurance_status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Valid", "Expiring", "Expired", "None"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Insurance Expiry</Label><Input type="date" value={form.insurance_expiry} onChange={(e) => set("insurance_expiry", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Active", "Inactive", "Blacklisted"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
          <AlertDialogHeader><AlertDialogTitle>Delete this carrier?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}