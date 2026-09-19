import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck, ShieldCheck, Clock, MapPinned, Phone, Mail, Menu, X,
  Package, Receipt, Headphones, ArrowRight, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { CONTACT_EMAIL, CONTACT_PHONE, sendContactEmail } from "@/lib/contact-email";

const SERVICES = [
  { icon: Package, title: "Full Truckload", desc: "Dedicated dry van, reefer, and flatbed capacity across the US and Canada with vetted carriers." },
  { icon: Truck, title: "LTL & Partial", desc: "Flexible less-than-truckload options to keep your freight moving cost-effectively." },
  { icon: MapPinned, title: "Cross-Border", desc: "Seamless US–Canada cross-border logistics with customs-savvy carriers and documentation." },
  { icon: Receipt, title: "Brokerage & Factoring", desc: "Rate negotiation, rate confirmations, invoicing, and carrier payouts handled end-to-end." },
];

const STATS = [
  { value: "12K+", label: "Loads Brokered" },
  { value: "48", label: "States & Provinces" },
  { value: "99.2%", label: "On-Time Pickup" },
  { value: "24/7", label: "Dispatch Support" },
];

const EQUIPMENT = ["Dry Van", "Reefer", "Flatbed", "Step Deck", "Power Only", "Tanker"];

export default function Home() {
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: "", contact_name: "", email: "", phone: "",
    origin: "", destination: "", equipment_type: "Dry Van",
    pickup_date: "", freight_description: "",
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.contact_name || !form.email) {
      toast({ title: "Please add your name and email.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.QuoteRequest.create({ ...form, status: "New" });
      await sendContactEmail(form);
      toast({ title: "Request received!", description: "Our dispatch team will reach out within 24 hours." });
      setForm({ company_name: "", contact_name: "", email: "", phone: "", origin: "", destination: "", equipment_type: "Dry Van", pickup_date: "", freight_description: "" });
    } catch (err) {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5"><Truck className="h-5 w-5 text-primary-foreground" /></div>
            <div>
              <span className="font-extrabold tracking-tight text-lg">UltraVibes</span>
              <span className="ml-1 text-xs font-medium text-muted-foreground hidden sm:inline">LLC</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#services" className="text-muted-foreground hover:text-foreground">Services</a>
            <a href="#why" className="text-muted-foreground hover:text-foreground">Why Us</a>
            <a href="#quote" className="text-muted-foreground hover:text-foreground">Get a Quote</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link to="/app">Dispatcher Login</Link>
            </Button>
            <Button asChild size="sm"><a href="#quote">Get a Quote</a></Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-3 space-y-1">
            <a href="#services" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium">Services</a>
            <a href="#why" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium">Why Us</a>
            <a href="#quote" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium">Get a Quote</a>
            <a href="#contact" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium">Contact</a>
            <Link to="/app" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-primary">Dispatcher Login</Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1920&q=80" alt="" className="h-full w-full" fittingType="fill" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/40" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
              <ShieldCheck className="h-3.5 w-3.5" /> Licensed & Bonded MC Broker
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Freight that moves.<br />Business that grows.
            </h1>
            <p className="mt-5 text-lg text-white/85">
              UltraVibes LLC is a US & Canada freight brokerage pairing shippers with pre-qualified carriers —
              full truckload, LTL, and cross-border — with live tracking and transparent billing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <a href="#quote">Request a Quote <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20">
                <a href="#services">Explore Services</a>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight">Full-service freight brokerage</h2>
            <p className="mt-3 text-muted-foreground">From single loads to dedicated lanes, we handle capacity, compliance, and paperwork so you don't have to.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="rounded-lg bg-primary/10 p-3 w-fit"><Icon className="h-6 w-6 text-primary" /></div>
                <h3 className="mt-4 font-semibold text-lg">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section id="why" className="bg-secondary/50 py-20 border-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Why shippers & carriers choose UltraVibes</h2>
            <p className="mt-3 text-muted-foreground">We treat every load like it's our own — with real dispatchers, real tracking, and real accountability.</p>
            <ul className="mt-6 space-y-4">
              {[
                "Pre-qualified, insured carriers verified by MC/DOT",
                "Live load status from pickup through delivery",
                "Auto-generated rate confirmations and invoices",
                "Cross-border expertise for US–Canada lanes",
                "Dedicated 24/7 dispatch support",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <Image src="https://images.unsplash.com/photo-1580674684097-8e3d7a5c5c9c?auto=format&fit=crop&w=1200&q=80" alt="Highway freight" className="w-full h-80 object-cover" fittingType="fill" />
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section id="quote" className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Get a freight quote</h2>
            <p className="mt-3 text-muted-foreground">Tell us about your load. A dispatcher will respond within 24 hours.</p>
          </div>
          <form onSubmit={submit} className="mt-10 rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="company_name">Company Name</Label>
                <Input id="company_name" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="Acme Logistics" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_name">Contact Name *</Label>
                <Input id="contact_name" value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} placeholder="Jane Doe" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@acme.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 123-4567" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" value={form.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Chicago, IL" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Toronto, ON" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="equipment_type">Equipment Type</Label>
                <Select value={form.equipment_type} onValueChange={(v) => set("equipment_type", v)}>
                  <SelectTrigger id="equipment_type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT.map((eq) => <SelectItem key={eq} value={eq}>{eq}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pickup_date">Pickup Date</Label>
                <Input id="pickup_date" type="date" value={form.pickup_date} onChange={(e) => set("pickup_date", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="freight_description">Freight Description</Label>
              <Textarea id="freight_description" value={form.freight_description} onChange={(e) => set("freight_description", e.target.value)} placeholder="Commodity, weight, pallets, special handling..." rows={3} />
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit Quote Request"}
            </Button>
          </form>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-accent p-1.5"><Truck className="h-5 w-5 text-accent-foreground" /></div>
              <span className="font-extrabold text-lg">UltraVibes LLC</span>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/70 max-w-sm">
              A US & Canada freight brokerage built on reliability, transparency, and real human dispatch — 24 hours a day.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-primary-foreground/80">
              <Clock className="h-4 w-4 text-accent" /> MC-licensed & bonded
            </div>
          </div>
          <div>
            <p className="font-semibold">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> {CONTACT_PHONE}</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> {CONTACT_EMAIL}</li>
              <li className="flex items-center gap-2"><Headphones className="h-4 w-4 text-accent" /> 24/7 dispatch desk</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Company</p>
            <ul className="mt-3 space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#services" className="hover:text-primary-foreground">Services</a></li>
              <li><a href="#quote" className="hover:text-primary-foreground">Get a Quote</a></li>
              <li><Link to="/app" className="hover:text-primary-foreground">Dispatcher Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-xs text-primary-foreground/60 flex flex-col sm:flex-row gap-2 justify-between">
            <p>© {new Date().getFullYear()} UltraVibes LLC. All rights reserved.</p>
            <p>US DOT licensed freight broker.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}