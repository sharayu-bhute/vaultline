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
      <div className="grid grid-cols-4 gap-2 mb-5">
        <SummaryTile label="Critical" value={counts.critical} tone="amber-strong" />
        <SummaryTile label="High" value={counts.high} tone="amber" />
        <SummaryTile label="Medium" value={counts.medium} tone="indigo" />
        <SummaryTile label="Low" value={counts.low} tone="gray" />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setActiveSeverity("all")}
          className={`px-3 py-1 rounded-full text-sm ${
            activeSeverity === "all"
              ? "bg-indigo-950 text-white"
              : "border border-gray-200 text-gray-600"
          }`}
        >
          All ({findings.filter((f) => !f.ignored).length})
        </button>
        {SEVERITY_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSeverity(s)}
            className={`px-3 py-1 rounded-full text-sm capitalize ${
              activeSeverity === s
                ? "bg-indigo-950 text-white"
                : "border border-gray-200 text-gray-600"
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
            className="accent-indigo-700"
          />
          Show ignored
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="text-gray-500 text-sm">No findings match this filter.</p>
      ) : (
        <div className="flex flex-col gap-3">
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

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber-strong" | "amber" | "indigo" | "gray";
}) {
  const styles = {
    "amber-strong": "bg-amber-100 text-amber-900",
    amber: "bg-amber-50 text-amber-800",
    indigo: "bg-indigo-100 text-indigo-900",
    gray: "bg-gray-100 text-gray-700",
  }[tone];

  return (
    <div className={`rounded-lg px-3 py-2 text-center ${styles}`}>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}