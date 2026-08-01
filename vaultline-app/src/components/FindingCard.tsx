"use client";

import { useState } from "react";
import { Finding } from "@/types";
import SeverityTag from "./SeverityTag";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface FindingCardProps {
  finding: Finding;
  onToggleIgnore?: () => void;
}

const ACCENT_COLOR: Record<Finding["severity"], string> = {
  critical: "#D85A30",
  high: "#EF9F27",
  medium: "#7F77DD",
  low: "#B4B2A9",
};

function parseSections(description: string) {
  const parts = description.split(/^##\s+/m).filter(Boolean);
  if (parts.length <= 1) return { details: description, poc: null };

  const sections: Record<string, string> = {};
  for (const part of parts) {
    const [firstLine, ...rest] = part.split("\n");
    sections[firstLine.trim().toLowerCase()] = rest.join("\n").trim();
  }

  const poc = sections["poc"] ?? sections["proof of concept"] ?? sections["exploit"] ?? null;
  const detailKeys = Object.keys(sections).filter(
    (k) => k !== "poc" && k !== "proof of concept" && k !== "exploit"
  );
  const details = detailKeys.map((k) => `**${k}**\n\n${sections[k]}`).join("\n\n") || null;

  return { details, poc };
}

export default function FindingCard({ finding, onToggleIgnore }: FindingCardProps) {
  const findingWithAi = finding as Finding & {
    plainSummary?: string | null;
    suggestedFix?: string | null;
  };

  const [showTechnical, setShowTechnical] = useState(false);
  const [plainSummary, setPlainSummary] = useState<string | null>(findingWithAi.plainSummary ?? null);
  const [loadingSimple, setLoadingSimple] = useState(false);
  const [suggestedFix, setSuggestedFix] = useState<string | null>(findingWithAi.suggestedFix ?? null);
  const [loadingFix, setLoadingFix] = useState(false);
  const { details, poc } = parseSections(finding.description);

  async function fetchPlainSummary() {
    setLoadingSimple(true);
    try {
      const res = await fetch(`/api/findings/${finding.id}/simplify`, { method: "POST" });
      const data = await res.json();
      setPlainSummary(data.plainSummary);
    } finally {
      setLoadingSimple(false);
    }
  }

    async function fetchSuggestedFix() {
      setLoadingFix(true);
      try {
        const res = await fetch(`/api/findings/${finding.id}/suggest-fix`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ force: !!suggestedFix }),
        });
        const data = await res.json();
        setSuggestedFix(data.suggestedFix);
      } finally {
        setLoadingFix(false);
      }
    }

  return (
    <div
      style={{ borderLeftColor: ACCENT_COLOR[finding.severity] }}
      className={`bg-white border border-gray-200 border-l-4 rounded-r-xl rounded-l-none p-4 ${
        finding.ignored ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2 gap-3">
        <h3 className="text-base font-semibold text-gray-900">{finding.title}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <SeverityTag severity={finding.severity} />
          {onToggleIgnore && (
            <button
              onClick={onToggleIgnore}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 hover:bg-gray-50"
            >
              {finding.ignored ? "Unignore" : "Ignore"}
            </button>
          )}
        </div>
      </div>

      {plainSummary ? (
        <p className="text-sm text-gray-800 mb-3 leading-relaxed bg-[#EEEDFE] border border-[#3C3489]/10 rounded-lg p-3">
          {plainSummary}
        </p>
      ) : (
        <button
          onClick={fetchPlainSummary}
          disabled={loadingSimple}
          className="flex items-center gap-1.5 text-sm font-medium text-[#3C3489] hover:text-[#26215C] mb-3 disabled:opacity-50"
        >
          <SparkleIcon />
          {loadingSimple ? "Simplifying…" : "Explain this in plain English"}
        </button>
      )}

      <p className="text-xs text-gray-500 mb-1 font-mono">
        {finding.filePath}
        {finding.lineNumber !== null && `:${finding.lineNumber}`}
      </p>

      <p className="text-xs text-gray-400 mb-3">
        Tool: {finding.tool}
        {finding.cveId && ` • ${finding.cveId}`}
        {finding.commitHash && ` • Commit: ${finding.commitHash}`}
      </p>

      {suggestedFix ? (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-indigo-900">Suggested fix</span>
            <button
              onClick={fetchSuggestedFix}
              disabled={loadingFix}
              className="flex items-center gap-1 text-xs font-medium text-[#3C3489] hover:text-[#26215C] disabled:opacity-50"
            >
              <RefreshIcon spinning={loadingFix} />
              {loadingFix ? "Regenerating…" : "Regenerate with AI"}
            </button>
          </div>
          <div className="markdown-body text-sm text-indigo-900">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{suggestedFix}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <button
          onClick={fetchSuggestedFix}
          disabled={loadingFix}
          className="flex items-center gap-1.5 text-sm font-medium text-[#3C3489] hover:text-[#26215C] mb-3 disabled:opacity-50"
        >
          <WrenchIcon />
          {loadingFix ? "Generating fix…" : "Generate suggested fix"}
        </button>
      )}

      {(details || poc) && (
        <>
          <button
            onClick={() => setShowTechnical((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            <CodeIcon />
            {showTechnical ? "Hide technical details" : "View technical details"}
          </button>

          {showTechnical && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-4">
              {details && (
                <div className="markdown-body text-sm text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{details}</ReactMarkdown>
                </div>
              )}
              {poc && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                    Proof of concept
                  </p>
                  <div className="markdown-body text-sm text-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{poc}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {finding.ignored && (
        <span className="text-xs text-gray-400 italic mt-2 block">Marked as ignored</span>
      )}
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 10-5.4 5.4L2 19v3h3l7.3-7.3a4 4 0 005.4-5.4z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 18l6-6-6-6" />
      <path d="M8 6l-6 6 6 6" />
    </svg>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spinning ? "animate-spin" : ""}
      aria-hidden="true"
    >
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}