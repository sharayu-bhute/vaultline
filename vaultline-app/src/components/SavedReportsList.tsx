"use client";

import { useState } from "react";
import Link from "next/link";

export interface SavedReportItem {
  id: string;
  repoFullName: string;
  findingsCount: number;
  status: string;
}

export default function SavedReportsList({
  initialReports,
}: {
  initialReports: SavedReportItem[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setPendingId(id);
    try {
      const res = await fetch(`/api/scans/${id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved: false }),
      });
      if (res.ok) {
        setReports((current) => current.filter((r) => r.id !== id));
      }
    } finally {
      setPendingId(null);
      setConfirmId(null);
    }
  }

  if (reports.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 rounded-2xl px-6 py-12 text-center bg-white">
        <p className="text-gray-500">
          No saved reports yet. Open a scan and hit &quot;Save report&quot; to keep it here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reports.map((scan) => (
        <div
          key={scan.id}
          className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow"
        >
          <Link href={`/scan/${scan.id}`} className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {scan.repoFullName}
            </h2>
            <p className="text-sm text-gray-500">
              {scan.findingsCount} finding(s) • Status: {scan.status}
            </p>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/scan/${scan.id}`}
              className="hidden sm:inline text-sm font-medium text-[#3C3489] hover:text-[#26215C] transition-colors"
            >
              View report →
            </Link>

            {confirmId === scan.id ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden md:inline">Delete this report?</span>
                <button
                  onClick={() => handleDelete(scan.id)}
                  disabled={pendingId === scan.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-700 text-white hover:bg-amber-800 transition-colors disabled:opacity-50"
                >
                  {pendingId === scan.id ? "Deleting…" : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  disabled={pendingId === scan.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmId(scan.id)}
                aria-label="Delete saved report"
                title="Delete saved report"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-800 hover:bg-amber-50 transition-colors"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}