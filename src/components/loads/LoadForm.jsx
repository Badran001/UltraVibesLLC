import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const EQUIPMENT = ["Dry Van", "Reefer", "Flatbed", "Step Deck", "Power Only", "Tanker"];

const empty = {
  load_number: "", shipper_id: "", carrier_id: "", origin_city: "", origin_state: "",
  destination_city: "", destination_state: "", pickup_date: "", delivery_date: "",
  equipment_type: "Dry Van", weight: "", commodity: "", rate: "", status: "Pending",
  bol_url: "", rate_conf_url: "", notes: "",
};

export default function LoadForm({ open, onOpenChange, load, shippers, carriers, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const isEdit = !!load;

  useEffect(() => {
    if (open) setForm(load ? { ...empty, ...load, weight: load.weight ?? "", rate: load.rate ?? "" } : empty);
  }, [open, load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.load_number || !form.origin_city || !form.destination_city || !form.rate) {
      toast({ title: "Load #, origin, destination, and rate are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        weight: form.weight === "" ? null : Number(form.weight),
        rate: Number(form.rate),
      };
      if (isEdit) {
        await base44.entities.Load.update(load.id, payload);
        toast({ title: "Load updated." });
      } else {
        await base44.entities.Load.create(payload);
        toast({ title: "Load created." });
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast({ title: "Failed to save load.", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${load.load_number}` : "New Load"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Load Number *</Label>
              <Input value={form.load_number} onChange={(e) => set("load_number", e.target.value)} placeholder="UV-1001" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Pending", "Assigned", "At Pickup", "In Transit", "Delivered", "Invoiced", "Completed", "Cancelled"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Shipper</Label>
              <Select value={form.shipper_id || "none"} onValueChange={(v) => set("shipper_id", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {shippers.map((s) => <SelectItem key={s.id} value={s.id}>{s.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Carrier</Label>
              <Select value={form.carrier_id || "none"} onValueChange={(v) => set("carrier_id", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {carriers.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Origin City *</Label>
              <Input value={form.origin_city} onChange={(e) => set("origin_city", e.target.value)} placeholder="Chicago" />
            </div>
            <div className="space-y-1.5">
              <Label>Origin State</Label>
              <Input value={form.origin_state} onChange={(e) => set("origin_state", e.target.value)} placeholder="IL" />
            </div>
            <div className="space-y-1.5">
              <Label>Pickup Date</Label>
              <Input type="date" value={form.pickup_date?.slice(0, 10) || ""} onChange={(e) => set("pickup_date", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Destination City *</Label>
              <Input value={form.destination_city} onChange={(e) => set("destination_city", e.target.value)} placeholder="Toronto" />
            </div>
            <div className="space-y-1.5">
              <Label>Dest. State</Label>
              <Input value={form.destination_state} onChange={(e) => set("destination_state", e.target.value)} placeholder="ON" />
            </div>
            <div className="space-y-1.5">
              <Label>Delivery Date</Label>
              <Input type="date" value={form.delivery_date?.slice(0, 10) || ""} onChange={(e) => set("delivery_date", e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Equipment</Label>
              <Select value={form.equipment_type} onValueChange={(v) => set("equipment_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EQUIPMENT.map((eq) => <SelectItem key={eq} value={eq}>{eq}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Weight (lbs)</Label>
              <Input type="number" value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="42000" />
            </div>
            <div className="space-y-1.5">
              <Label>Rate ($) *</Label>
              <Input type="number" value={form.rate} onChange={(e) => set("rate", e.target.value)} placeholder="2500" />
            </div>
            <div className="space-y-1.5">
              <Label>Commodity</Label>
              <Input value={form.commodity} onChange={(e) => set("commodity", e.target.value)} placeholder="Beverages" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>BOL Document URL</Label>
              <Input value={form.bol_url} onChange={(e) => set("bol_url", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label>Rate Confirmation URL</Label>
              <Input value={form.rate_conf_url} onChange={(e) => set("rate_conf_url", e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : isEdit ? "Save Changes" : "Create Load"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}