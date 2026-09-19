import React from "react";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  // Load statuses
  "Pending": "bg-amber-100 text-amber-800 border-amber-200",
  "Assigned": "bg-blue-100 text-blue-800 border-blue-200",
  "At Pickup": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "In Transit": "bg-purple-100 text-purple-800 border-purple-200",
  "Delivered": "bg-teal-100 text-teal-800 border-teal-200",
  "Invoiced": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Completed": "bg-green-100 text-green-800 border-green-200",
  "Cancelled": "bg-red-100 text-red-800 border-red-200",
  // Quote
  "New": "bg-amber-100 text-amber-800 border-amber-200",
  "Contacted": "bg-blue-100 text-blue-800 border-blue-200",
  "Quoted": "bg-purple-100 text-purple-800 border-purple-200",
  "Converted": "bg-green-100 text-green-800 border-green-200",
  "Archived": "bg-slate-100 text-slate-700 border-slate-200",
  // Generic status
  "Active": "bg-green-100 text-green-800 border-green-200",
  "Inactive": "bg-slate-100 text-slate-700 border-slate-200",
  "Prospect": "bg-blue-100 text-blue-800 border-blue-200",
  "Blacklisted": "bg-red-100 text-red-800 border-red-200",
  "Valid": "bg-green-100 text-green-800 border-green-200",
  "Expiring": "bg-amber-100 text-amber-800 border-amber-200",
  "Expired": "bg-red-100 text-red-800 border-red-200",
  "None": "bg-slate-100 text-slate-700 border-slate-200",
  // Invoice
  "Draft": "bg-slate-100 text-slate-700 border-slate-200",
  "Sent": "bg-blue-100 text-blue-800 border-blue-200",
  "Paid": "bg-green-100 text-green-800 border-green-200",
  "Overdue": "bg-red-100 text-red-800 border-red-200",
  "Void": "bg-slate-100 text-slate-700 border-slate-200",
};

export default function StatusBadge({ status, className }) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", style, className)}>
      {status}
    </span>
  );
}