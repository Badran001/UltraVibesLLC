import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Truck, Building2, FileText, Inbox, DollarSign, ArrowRight, Clock } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

const USD = (n) => (n ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function Dashboard() {
  const [loads, setLoads] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Load.list("-created_date", 100),
      base44.entities.Carrier.list("-created_date", 100),
      base44.entities.Shipper.list("-created_date", 100),
      base44.entities.Invoice.list("-created_date", 100),
      base44.entities.QuoteRequest.list("-created_date", 100),
    ])
      .then(([l, c, s, i, q]) => {
        setLoads(Array.isArray(l) ? l : []);
        setCarriers(Array.isArray(c) ? c : []);
        setShippers(Array.isArray(s) ? s : []);
        setInvoices(Array.isArray(i) ? i : []);
        setQuotes(Array.isArray(q) ? q : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeLoads = loads.filter((l) => ["Assigned", "At Pickup", "In Transit", "Delivered"].includes(l.status));
  const openQuotes = quotes.filter((q) => q.status === "New" || q.status === "Contacted");
  const unpaidInvoices = invoices.filter((i) => i.status === "Sent" || i.status === "Overdue");
  const outstanding = unpaidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
  const recentLoads = [...loads].slice(0, 6);

  return (
    <DashboardLayout>
      <PageHeader title="Dispatch Overview" description="Live snapshot of your freight brokerage operations." />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Package} label="Active Loads" value={activeLoads.length} sub={`${loads.length} total`} />
            <StatCard icon={Truck} label="Carriers" value={carriers.length} sub={`${carriers.filter((c) => c.status === "Active").length} active`} accent="text-accent" />
            <StatCard icon={Inbox} label="Open Quotes" value={openQuotes.length} sub={`${quotes.length} total requests`} />
            <StatCard icon={DollarSign} label="Outstanding A/R" value={USD(outstanding)} sub={`${unpaidInvoices.length} unpaid invoices`} accent="text-accent" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-semibold">Recent Loads</h2>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/app/loads">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="divide-y">
                {recentLoads.length === 0 ? (
                  <p className="p-6 text-sm text-muted-foreground text-center">No loads yet.</p>
                ) : recentLoads.map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-4 p-4 hover:bg-secondary/50">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{l.load_number}</p>
                      <p className="text-xs text-muted-foreground truncate">{l.origin_city}, {l.origin_state} → {l.destination_city}, {l.destination_state}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold">{USD(l.rate)}</span>
                      <StatusBadge status={l.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border bg-card shadow-sm p-5">
                <h2 className="font-semibold flex items-center gap-2"><Inbox className="h-4 w-4 text-accent" /> New Quote Requests</h2>
                <div className="mt-3 space-y-3">
                  {openQuotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No open quotes.</p>
                  ) : openQuotes.slice(0, 4).map((q) => (
                    <div key={q.id} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{q.contact_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{q.origin} → {q.destination}</p>
                      </div>
                      <StatusBadge status={q.status} />
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link to="/app/quotes">Manage Quotes</Link>
                </Button>
              </div>

              <div className="rounded-xl border bg-card shadow-sm p-5">
                <h2 className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> Unpaid Invoices</h2>
                <div className="mt-3 space-y-3">
                  {unpaidInvoices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">All invoices paid.</p>
                  ) : unpaidInvoices.slice(0, 4).map((i) => (
                    <div key={i.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{i.invoice_number}</p>
                        <p className="text-xs text-muted-foreground">Due {i.due_date || "—"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{USD(i.amount)}</span>
                        <StatusBadge status={i.status} />
                      </div>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link to="/app/invoices">View Invoices</Link>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}