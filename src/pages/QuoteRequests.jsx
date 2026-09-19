import React, { useState, useEffect, useCallback } from "react";
import { Search, Inbox, Mail, Phone, Pencil, Trash2, ArrowRight, MapPin } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const STATUSES = ["New", "Contacted", "Quoted", "Converted", "Archived"];

export default function QuoteRequests() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [status, setStatus] = useState("New");
  const [notes, setNotes] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await base44.entities.QuoteRequest.list("-created_date", 200);
    setItems(Array.isArray(res) ? res : []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const openEdit = (q) => { setEditing(q); setStatus(q.status || "New"); setNotes(q.notes || ""); setFormOpen(true); };

  const saveStatus = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.QuoteRequest.update(editing.id, { status, notes });
      toast({ title: "Quote updated." }); setFormOpen(false); load();
    } catch (err) { toast({ title: "Failed to update.", description: err.message, variant: "destructive" }); }
  };

  const convertToShipper = async (q) => {
    try {
      await base44.entities.Shipper.create({
        company_name: q.company_name || q.contact_name,
        contact_name: q.contact_name, email: q.email, phone: q.phone || "",
        address: "", mc_number: "", status: "Active", credit_limit: null,
        notes: `Converted from quote request: ${q.origin} → ${q.destination}`,
      });
      await base44.entities.QuoteRequest.update(q.id, { status: "Converted" });
      toast({ title: "Converted to shipper account." }); load();
    } catch (err) { toast({ title: "Conversion failed.", description: err.message, variant: "destructive" }); }
  };

  const handleDelete = async () => {
    await base44.entities.QuoteRequest.delete(deleteId);
    toast({ title: "Quote deleted." }); setDeleteId(null); load();
  };

  const filtered = items.filter((q) => {
    const matchStatus = statusFilter === "All" || q.status === statusFilter;
    const s = search.toLowerCase();
    const matchSearch = !s || q.contact_name?.toLowerCase().includes(s) || q.company_name?.toLowerCase().includes(s) || q.email?.toLowerCase().includes(s);
    return matchStatus && matchSearch;
  });

  return (
    <DashboardLayout>
      <PageHeader title="Quote Requests" description="Inbound leads from your public website contact form." />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name, company, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>{["All", ...STATUSES].map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All Statuses" : s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-16 text-center text-muted-foreground">
          <Inbox className="h-10 w-10 mx-auto mb-2 opacity-40" /> No quote requests yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((q) => (
            <div key={q.id} className="rounded-xl border bg-card p-5 shadow-sm flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{q.contact_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{q.company_name || "—"}</p>
                </div>
                <StatusBadge status={q.status} />
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 shrink-0" />{q.email}</p>
                <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" />{q.phone || "—"}</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" />{q.origin || "?"} → {q.destination || "?"}</p>
              </div>
              {q.freight_description && <p className="mt-3 text-sm bg-secondary/60 rounded-md p-2 line-clamp-3">{q.freight_description}</p>}
              <div className="mt-auto pt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(q)} className="flex-1"><Pencil className="h-3.5 w-3.5 mr-1" /> Update</Button>
                {q.status !== "Converted" && (
                  <Button size="sm" onClick={() => convertToShipper(q)} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                    Convert <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setDeleteId(q.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Update Quote Request</DialogTitle></DialogHeader>
          <form onSubmit={saveStatus} className="space-y-4">
            {editing && (
              <div className="rounded-md bg-secondary/50 p-3 text-sm">
                <p className="font-medium">{editing.contact_name} — {editing.company_name || "—"}</p>
                <p className="text-muted-foreground">{editing.origin || "?"} → {editing.destination || "?"} · {editing.equipment_type}</p>
              </div>
            )}
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pricing, follow-ups, special requirements..." /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this quote request?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}