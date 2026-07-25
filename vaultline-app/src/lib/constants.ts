import { Severity, ScanStatus } from "@/types";

export const SEVERITY_CONFIG: Record<Severity, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-600 text-white" },
  high:     { label: "High",     color: "bg-orange-500 text-white" },
  medium:   { label: "Medium",   color: "bg-amber-400 text-black" },
  low:      { label: "Low",      color: "bg-slate-400 text-white" },
};

export const STATUS_CONFIG: Record<ScanStatus, { label: string; color: string }> = {
  queued:    { label: "Queued",    color: "bg-slate-200 text-slate-700" },
  cloning:   { label: "Cloning",   color: "bg-blue-200 text-blue-800" },
  scanning:  { label: "Scanning",  color: "bg-blue-500 text-white" },
  reporting: { label: "Reporting", color: "bg-indigo-500 text-white" },
  completed: { label: "Completed", color: "bg-green-500 text-white" },
  failed:    { label: "Failed",    color: "bg-red-700 text-white" },
};