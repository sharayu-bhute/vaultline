"use client";

import { useState } from "react";

export default function ReportActions({
  scanId,
  initialSaved,
}: {
  scanId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [savingLoading, setSavingLoading] = useState(false);

  async function toggleSave() {
    setSavingLoading(true);
    const next = !saved;
    try {
      const res = await fetch(`/api/scans/${scanId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved: next }),
      });
      if (res.ok) setSaved(next);
    } finally {
      setSavingLoading(false);
    }
  }

  function downloadPdf() {
    window.print();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleSave}
        disabled={savingLoading}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
          saved
            ? "bg-[#EEEDFE] text-[#26215C] border border-[#3C3489]/20"
            : "bg-[#26215C] text-white hover:bg-[#1c1846]"
        }`}
      >
        {savingLoading ? "Saving…" : saved ? "Saved ✓" : "Save report"}
      </button>

      <button
        onClick={downloadPdf}
        className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Download PDF
      </button>
    </div>
  );
}