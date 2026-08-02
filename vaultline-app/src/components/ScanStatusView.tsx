"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Scan, Severity } from "@/types";

interface ScanStatusViewProps {
  scanId: string;
}

const STEPS = [
  { key: "cloning", label: "Cloning repository", detail: "Pulling the latest commit" },
  { key: "scanning", label: "Running security tools", detail: "Secrets, dependencies & code analysis" },
  { key: "reporting", label: "Generating report", detail: "Scoring and grouping findings" },
] as const;

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-amber-600",
  high: "bg-amber-400",
  medium: "bg-[#3C3489]",
  low: "bg-gray-400",
};

export default function ScanStatusView({ scanId }: ScanStatusViewProps) {
  const [scan, setScan] = useState<Scan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/scans/${scanId}`);
        if (!res.ok) {
          if (!cancelled) setError(`Scan not found (${res.status})`);
          return;
        }
        const data: Scan = await res.json();
        if (!cancelled) setScan(data);
      } catch {
        if (!cancelled) setError("Failed to reach the server");
      }
    }

    poll();
    const interval = setInterval(() => {
      setScan((current) => {
        if (current?.status === "completed" || current?.status === "failed") {
          clearInterval(interval);
        } else {
          poll();
        }
        return current;
      });
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [scanId]);

  const severityCounts = useMemo(() => {
    if (!scan) return null;
    const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const f of scan.findings) counts[f.severity]++;
    return counts;
  }, [scan]);

  if (error) {
    return (
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertIcon />
        </div>
        <p className="text-gray-900 font-medium mb-1">Something went wrong</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading scan…</p>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.key === scan.status);
  const progressPct =
    scan.status === "completed"
      ? 100
      : stepIndex >= 0
      ? Math.round(((stepIndex + 0.5) / STEPS.length) * 100)
      : 4;

  return (
    <div className="w-full max-w-md">
      <div className="relative bg-white border border-gray-200 rounded-3xl px-8 pt-9 pb-8 shadow-[0_1px_3px_rgba(16,24,40,0.06),0_8px_24px_-8px_rgba(60,52,137,0.12)] overflow-hidden">
        {/* faint corner accent */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(239,159,39,0.10),transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 w-48 h-48 rounded-full bg-[radial-gradient(circle,rgba(60,52,137,0.08),transparent_70%)]" />

        <div className="relative flex flex-col items-center text-center mb-7">
          <StatusIcon status={scan.status} />
          <h2 className="font-semibold text-gray-900 text-lg mt-4">
            {scan.status === "queued"
              ? "Waiting in queue"
              : scan.status === "completed"
              ? "Scan complete"
              : scan.status === "failed"
              ? "Scan failed"
              : "Scanning your repository"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {scan.status === "queued"
              ? `Position ${scan.queuePosition ?? "?"} — a slot will free up shortly`
              : scan.status === "completed"
              ? "Here's what we found"
              : scan.status === "failed"
              ? "We couldn't finish scanning this repository"
              : STEPS[stepIndex]?.detail}
          </p>
        </div>

        {/* progress bar */}
        {scan.status !== "failed" && (
          <div className="relative h-1.5 w-full rounded-full bg-gray-100 overflow-hidden mb-7">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                scan.status === "completed"
                  ? "bg-[#3C3489]"
                  : "bg-gradient-to-r from-[#3C3489] to-[#EF9F27]"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {scan.status === "queued" ? (
          <div className="flex items-center justify-center gap-1.5 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" />
          </div>
        ) : scan.status === "completed" ? (
          <div className="flex flex-col gap-5">
            {severityCounts && scan.findings.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {SEVERITY_ORDER.map((sev) => (
                  <div
                    key={sev}
                    className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 border border-gray-100 py-3"
                  >
                    <span className="text-lg font-semibold text-gray-900">
                      {severityCounts[sev]}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-500 capitalize">
                      <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[sev]}`} />
                      {sev}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500 -mt-2">
                No findings — this repository looks clean.
              </p>
            )}

            <Link
              href={`/report/${scan.id}`}
              className="w-full text-center bg-[#26215C] text-white font-medium text-sm rounded-xl py-2.5 hover:bg-[#1c1846] transition-colors"
            >
              View full report
            </Link>
          </div>
        ) : scan.status === "failed" ? (
          <Link
            href="/dashboard"
            className="w-full block text-center border border-gray-200 text-gray-700 font-medium text-sm rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
          >
            Back to dashboard
          </Link>
        ) : (
          <div className="flex flex-col gap-2.5">
            {STEPS.map((step, i) => {
              const state =
                i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                    state === "done"
                      ? "bg-indigo-50/70 text-[#26215C]"
                      : state === "active"
                      ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200"
                      : "text-gray-400"
                  }`}
                >
                  {state === "done" ? (
                    <CheckIcon />
                  ) : state === "active" ? (
                    <SpinnerIcon />
                  ) : (
                    <DashedIcon />
                  )}
                  <span className="flex-1 font-medium">{step.label}</span>
                  <span className="text-xs opacity-80">
                    {state === "done" ? "Done" : state === "active" ? "In progress" : "Queued"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

function StatusIcon({ status }: { status: Scan["status"] }) {
  if (status === "completed") {
    return (
      <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#26215C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l2.5 2.5L16 9" />
        </svg>
      </div>
    );
  }
  if (status === "failed") {
    return (
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
        <AlertIcon />
      </div>
    );
  }
  // queued / cloning / scanning / reporting
  return (
    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3C3489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 12 L12 5" />
        <path d="M12 12 L17 9" opacity="0.5" />
      </svg>
    </div>
  );
}
function AlertIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 9v4" />
      <path d="M10.3 3.9L2.5 17a1.5 1.5 0 0 0 1.3 2.2h16.4a1.5 1.5 0 0 0 1.3-2.2L13.7 3.9a1.5 1.5 0 0 0-2.6 0z" />
      <path d="M12 16.5h.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
  );
}

function DashedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeDasharray="3 3" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}