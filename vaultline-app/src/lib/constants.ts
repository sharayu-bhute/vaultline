import { Severity, ScanStatus } from "@/types";

export const SEVERITY_CONFIG: Record<Severity, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-amber-100 text-amber-900" },
  high:     { label: "High",     color: "bg-amber-50 text-amber-800" },
  medium:   { label: "Medium",   color: "bg-indigo-100 text-indigo-900" },
  low:      { label: "Low",      color: "bg-gray-100 text-gray-700" },
};

export const STATUS_CONFIG: Record<ScanStatus, { label: string; color: string }> = {
  queued:    { label: "Queued",    color: "bg-gray-100 text-gray-700" },
  cloning:   { label: "Cloning",   color: "bg-indigo-100 text-indigo-800" },
  scanning:  { label: "Scanning",  color: "bg-indigo-600 text-white" },
  reporting: { label: "Reporting", color: "bg-amber-400 text-amber-950" },
  completed: { label: "Completed", color: "bg-indigo-950 text-white" },
  failed:    { label: "Failed",    color: "bg-amber-700 text-white" },
};