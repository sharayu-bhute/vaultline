"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Scan } from "@/types";

interface ScanStatusViewProps {
  scanId: string;
}

const STEPS = [
  { key: "cloning", label: "Cloning repository" },
  { key: "scanning", label: "Running security tools" },
  { key: "reporting", label: "Generating report" },
] as const;

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

  if (error) {
    return (
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <p className="text-amber-800">{error}</p>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  const stepIndex = STEPS.findIndex((s) => s.key === scan.status);

  return (
    <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
          <RadarIcon />
        </div>
        <h2 className="font-semibold text-gray-900">
          {scan.status === "queued"
            ? `Queued — position ${scan.queuePosition ?? "?"}`
            : "Scanning your repository"}
        </h2>
      </div>

      {scan.status === "queued" ? (
        <p className="text-center text-sm text-gray-500">
          Waiting for a scan slot to free up.
        </p>
      ) : scan.status === "completed" ? (
        <p className="text-center text-indigo-800 font-medium">
          Scan complete —{" "}
          <Link href={`/report/${scan.id}`} className="underline text-amber-700">
            view report
          </Link>
        </p>
      ) : scan.status === "failed" ? (
        <p className="text-center text-amber-800 font-medium">Scan failed.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {STEPS.map((step, i) => {
            const state =
              i < stepIndex ? "done" : i === stepIndex ? "active" : "pending";
            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                  state === "done"
                    ? "bg-indigo-50 text-indigo-900"
                    : state === "active"
                    ? "bg-amber-50 text-amber-900"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                {state === "done" ? (
                  <CheckIcon />
                ) : state === "active" ? (
                  <SpinnerIcon />
                ) : (
                  <DashedIcon />
                )}
                <span className="flex-1">{step.label}</span>
                <span className="text-xs">
                  {state === "done" ? "Done" : state === "active" ? "In progress" : "Queued"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RadarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3C3489" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12 L12 5" />
      <path d="M12 12 L17 9" opacity="0.5" />
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}