import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import LoadForm from "@/components/loads/LoadForm";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

const USD = (n) => (n ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const STATUSES = ["All", "Pending", "Assigned", "At Pickup", "In Transit", "Delivered", "Invoiced", "Completed", "Cancelled"];

export default function Loads() {
  const { toast } = useToast();
  const [loads, setLoads] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [l, s, c] = await Promise.all([
      base44.entities.Load.list("-created_date", 200),
      base44.entities.Shipper.list("-created_date", 200),
      base44.entities.Carrier.list("-created_date", 200),
    ]);
    setLoads(Array.isArray(l) ? l : []);
    setShippers(Array.isArray(s) ? s : []);
    setCarriers(Array.isArray(c) ? c : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const nameOf = (list, id) => list.find((x) => x.id === id)?.company_name || "—";

  const filtered = loads.filter((l) => {
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      l.load_number?.toLowerCase().includes(q) ||
      `${l.origin_city} ${l.destination_city}`.toLowerCase().includes(q) ||
      nameOf(shippers, l.shipper_id).toLowerCase().includes(q) ||
      nameOf(carriers, l.carrier_id).toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleDelete = async () => {
    try {
      await base44.entities.Load.delete(deleteId);
      toast({ title: "Load deleted." });
      setDeleteId(null);
      load();
    } catch (err) {
      toast({ title: "Failed to delete.", description: err.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Loads"
        description="Create, assign, and track every dispatched load."
        action={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> New Load
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search load #, lane, shipper..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All Statuses" : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Load #</TableHead>
              <TableHead className="hidden md:table-cell">Lane</TableHead>
              <TableHead className="hidden lg:table-cell">Shipper</TableHead>
              <TableHead className="hidden lg:table-cell">Carrier</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  No loads found.
                </TableCell>
              </TableRow>
            ) : filtered.map((l) => (
              <TableRow key={l.id} className="hover:bg-secondary/40">
                <TableCell className="font-medium">{l.load_number}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">
                  {l.origin_city}{l.origin_state ? `, ${l.origin_state}` : ""} → {l.destination_city}{l.destination_state ? `, ${l.destination_state}` : ""}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{nameOf(shippers, l.shipper_id)}</TableCell>
                <TableCell className="hidden lg:table-cell text-sm">{nameOf(carriers, l.carrier_id)}</TableCell>
                <TableCell className="font-semibold">{USD(l.rate)}</TableCell>
                <TableCell><StatusBadge status={l.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(l); setFormOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(l.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <LoadForm
        open={formOpen}
        onOpenChange={setFormOpen}
        load={editing}
        shippers={shippers}
        carriers={carriers}
        onSaved={load}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this load?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the load record. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}