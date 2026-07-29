"use client";

import { useState } from "react";
import type { Finding, Severity } from "@/types";
import FindingCard from "./FindingCard";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

export default function FindingsList({ findings: initial }: { findings: Finding[] }) {
  const [findings, setFindings] = useState(initial);
  const [activeSeverity, setActiveSeverity] = useState<Severity | "all">("all");
  const [showIgnored, setShowIgnored] = useState(false);

  async function toggleIgnored(findingId: string, ignored: boolean) {
    // Optimistic update — flip it in the UI immediately, roll back only if
    // the request actually fails, rather than waiting on a round trip.
    setFindings((prev) =>
      prev.map((f) => (f.id === findingId ? { ...f, ignored } : f))
    );

    try {
      const res = await fetch(`/api/findings/${findingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ignored }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Roll back on failure.
      setFindings((prev) =>
        prev.map((f) => (f.id === findingId ? { ...f, ignored: !ignored } : f))
      );
    }
  }

  const visible = findings.filter((f) => {
    if (!showIgnored && f.ignored) return false;
    if (activeSeverity !== "all" && f.severity !== activeSeverity) return false;
    return true;
  });

  const counts = SEVERITY_ORDER.reduce<Record<Severity, number>>(
    (acc, s) => {
      acc[s] = findings.filter((f) => f.severity === s && !f.ignored).length;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setActiveSeverity("all")}
          className={`px-3 py-1 rounded-full text-sm ${
            activeSeverity === "all" ? "bg-slate-900 text-white" : "border"
          }`}
        >
          All ({findings.filter((f) => !f.ignored).length})
        </button>
        {SEVERITY_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSeverity(s)}
            className={`px-3 py-1 rounded-full text-sm capitalize ${
              activeSeverity === s ? "bg-slate-900 text-white" : "border"
            }`}
          >
            {s} ({counts[s]})
          </button>
        ))}

        <label className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
          <input
            type="checkbox"
            checked={showIgnored}
            onChange={(e) => setShowIgnored(e.target.checked)}
          />
          Show ignored
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="text-gray-500 text-sm">No findings match this filter.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onToggleIgnore={() => {
                toggleIgnored(finding.id, !finding.ignored);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}