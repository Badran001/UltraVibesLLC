import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Truck, Building2, FileText, Inbox,
  Menu, X, Truck as TruckIcon, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";

const NAV = [
  { label: "Dashboard", path: "/app", icon: LayoutDashboard },
  { label: "Loads", path: "/app/loads", icon: Package },
  { label: "Carriers", path: "/app/carriers", icon: Truck },
  { label: "Shippers", path: "/app/shippers", icon: Building2 },
  { label: "Invoices", path: "/app/invoices", icon: FileText },
  { label: "Quote Requests", path: "/app/quotes", icon: Inbox },
];

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
    } catch (e) {}
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between border-b bg-sidebar px-4 py-3">
        <Link to="/app" className="flex items-center gap-2 text-sidebar-foreground font-bold">
          <TruckIcon className="h-6 w-6 text-sidebar-primary" />
          UltraVibes
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="text-sidebar-foreground hover:bg-sidebar-accent">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 bg-sidebar text-sidebar-foreground transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-sidebar-primary p-1.5">
                <TruckIcon className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <p className="font-bold leading-tight text-sidebar-foreground">UltraVibes</p>
                <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Freight Brokerage</p>
              </div>
            </Link>
          </div>

          <nav className="flex flex-col gap-1 p-3">
            {NAV.map(({ label, path, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground">
                {user?.full_name?.[0]?.toUpperCase() || "D"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.full_name || "Dispatcher"}</p>
                <p className="text-xs text-sidebar-foreground/60">Dispatcher</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}