import { Finding } from "@/types";
import SeverityTag from "./SeverityTag";

interface FindingCardProps {
  finding: Finding;
  onToggleIgnore?: () => void;
}

export default function FindingCard({ finding, onToggleIgnore }: FindingCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 ${
        finding.ignored ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{finding.title}</h3>
        <div className="flex items-center gap-2">
          <SeverityTag severity={finding.severity} />
          {onToggleIgnore && (
            <button
              onClick={onToggleIgnore}
              className="text-xs border rounded px-2 py-1 text-gray-600 hover:bg-gray-50"
            >
              {finding.ignored ? "Unignore" : "Ignore"}
            </button>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-3">{finding.description}</p>

      <p className="text-sm text-gray-500 mb-1">
        {finding.filePath}
        {finding.lineNumber !== null && `:${finding.lineNumber}`}
      </p>

      <p className="text-xs text-gray-400 mb-2">
        Tool: {finding.tool}
        {finding.cveId && ` • ${finding.cveId}`}
        {finding.commitHash && ` • Commit: ${finding.commitHash}`}
      </p>

      <p className="text-sm bg-slate-50 border rounded p-2 mb-2">
        <span className="font-medium">Suggested fix: </span>
        {finding.suggestedFix}
      </p>

      {finding.ignored && (
        <span className="text-xs text-gray-400 italic">Marked as ignored</span>
      )}
    </div>
  );
}