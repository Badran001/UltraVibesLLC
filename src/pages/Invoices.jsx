import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, FileText, DollarSign } from "lucide-react";
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

const USD = (n) => (n ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
const STATUSES = ["Draft", "Sent", "Paid", "Overdue", "Void"];
const empty = { invoice_number: "", load_id: "", shipper_id: "", amount: "", status: "Draft", issue_date: "", due_date: "", paid_date: "", notes: "" };

export default function Invoices() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loads, setLoads] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [inv, l, s] = await Promise.all([
      base44.entities.Invoice.list("-created_date", 200),
      base44.entities.Load.list("-created_date", 200),
      base44.entities.Shipper.list("-created_date", 200),
    ]);
    setItems(Array.isArray(inv) ? inv : []);
    setLoads(Array.isArray(l) ? l : []);
    setShippers(Array.isArray(s) ? s : []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const openNew = () => { setEditing(null); setForm({ ...empty, issue_date: new Date().toISOString().slice(0, 10) }); setFormOpen(true); };
  const openEdit = (i) => { setEditing(i); setForm({ ...empty, ...i, amount: i.amount ?? "", issue_date: i.issue_date?.slice(0, 10) || "", due_date: i.due_date?.slice(0, 10) || "", paid_date: i.paid_date?.slice(0, 10) || "" }); setFormOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.invoice_number || !form.amount) {
      toast({ title: "Invoice number and amount are required.", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) { await base44.entities.Invoice.update(editing.id, payload); toast({ title: "Invoice updated." }); }
      else { await base44.entities.Invoice.create(payload); toast({ title: "Invoice created." }); }
      setFormOpen(false); load();
    } catch (err) { toast({ title: "Failed to save.", description: err.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await base44.entities.Invoice.delete(deleteId);
    toast({ title: "Invoice deleted." }); setDeleteId(null); load();
  };

  const loadNum = (id) => loads.find((l) => l.id === id)?.load_number || "—";
  const shipperName = (id) => shippers.find((s) => s.id === id)?.company_name || "—";

  const filtered = items.filter((i) => {
    const matchStatus = statusFilter === "All" || i.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || i.invoice_number?.toLowerCase().includes(q) || shipperName(i.shipper_id).toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalPaid = items.filter((i) => i.status === "Paid").reduce((s, i) => s + (i.amount || 0), 0);
  const totalOutstanding = items.filter((i) => i.status === "Sent" || i.status === "Overdue").reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <DashboardLayout>
      <PageHeader title="Invoices" description="Bill shippers and track payments."
        action={<Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New Invoice</Button>} />

      <div className="grid gap-4 sm:grid-cols-2 mb-5">
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="rounded-lg bg-green-100 p-2.5"><DollarSign className="h-5 w-5 text-green-700" /></div>
          <div><p className="text-sm text-muted-foreground">Total Paid</p><p className="text-xl font-bold">{USD(totalPaid)}</p></div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2.5"><DollarSign className="h-5 w-5 text-amber-700" /></div>
          <div><p className="text-sm text-muted-foreground">Outstanding</p><p className="text-xl font-bold">{USD(totalOutstanding)}</p></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoice # or shipper..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>{["All", ...STATUSES].map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All Statuses" : s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead className="hidden md:table-cell">Load</TableHead>
              <TableHead className="hidden lg:table-cell">Shipper</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" /> No invoices found.
              </TableCell></TableRow>
            ) : filtered.map((i) => (
              <TableRow key={i.id} className="hover:bg-secondary/40">
                <TableCell className="font-medium">{i.invoice_number}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{loadNum(i.load_id)}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{shipperName(i.shipper_id)}</TableCell>
                <TableCell className="font-semibold">{USD(i.amount)}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{i.due_date?.slice(0, 10) || "—"}</TableCell>
                <TableCell><StatusBadge status={i.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Invoice" : "New Invoice"}</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Invoice Number *</Label><Input value={form.invoice_number} onChange={(e) => set("invoice_number", e.target.value)} placeholder="INV-1001" /></div>
              <div className="space-y-1.5"><Label>Amount ($) *</Label><Input type="number" step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="2500.00" /></div>
              <div className="space-y-1.5"><Label>Load</Label>
                <Select value={form.load_id || "none"} onValueChange={(v) => set("load_id", v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Select load" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">None</SelectItem>{loads.map((l) => <SelectItem key={l.id} value={l.id}>{l.load_number}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Shipper</Label>
                <Select value={form.shipper_id || "none"} onValueChange={(v) => set("shipper_id", v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Select shipper" /></SelectTrigger>
                  <SelectContent><SelectItem value="none">None</SelectItem>{shippers.map((s) => <SelectItem key={s.id} value={s.id}>{s.company_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Issue Date</Label><Input type="date" value={form.issue_date} onChange={(e) => set("issue_date", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Paid Date</Label><Input type="date" value={form.paid_date} onChange={(e) => set("paid_date", e.target.value)} /></div>
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
          <AlertDialogHeader><AlertDialogTitle>Delete this invoice?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}