import { Finding } from "@/types";
import SeverityTag from "./SeverityTag";

interface FindingCardProps {
  finding: Finding;
  onToggleIgnore?: () => void;
}

const ACCENT_COLOR: Record<Finding["severity"], string> = {
  critical: "#D85A30", // coral — most urgent
  high: "#EF9F27",     // amber
  medium: "#7F77DD",   // indigo
  low: "#B4B2A9",      // gray
};

export default function FindingCard({ finding, onToggleIgnore }: FindingCardProps) {
  return (
    <div
      style={{ borderLeftColor: ACCENT_COLOR[finding.severity] }}
      className={`bg-white border border-gray-200 border-l-4 rounded-r-xl rounded-l-none p-4 ${
        finding.ignored ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-900">{finding.title}</h3>
        <div className="flex items-center gap-2">
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

      <p className="text-gray-700 mb-3 text-sm">{finding.description}</p>

      <p className="text-xs text-gray-500 mb-1 font-mono">
        {finding.filePath}
        {finding.lineNumber !== null && `:${finding.lineNumber}`}
      </p>

      <p className="text-xs text-gray-400 mb-2">
        Tool: {finding.tool}
        {finding.cveId && ` • ${finding.cveId}`}
        {finding.commitHash && ` • Commit: ${finding.commitHash}`}
      </p>

      <p className="text-sm bg-indigo-50 border border-indigo-100 rounded-lg p-2 mb-2 text-indigo-900">
        <span className="font-medium">Suggested fix: </span>
        {finding.suggestedFix}
      </p>

      {finding.ignored && (
        <span className="text-xs text-gray-400 italic">Marked as ignored</span>
      )}
    </div>
  );
}