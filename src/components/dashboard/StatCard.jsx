import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ icon: Icon, label, value, accent = "text-primary", sub }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        {Icon && (
          <div className={cn("rounded-lg p-2.5 bg-secondary", accent)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}