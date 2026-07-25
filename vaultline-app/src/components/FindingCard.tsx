import { Finding } from "@/types";
import SeverityTag from "./SeverityTag";

interface FindingCardProps {
  finding: Finding;
}

export default function FindingCard({ finding }: FindingCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{finding.title}</h3>
        <SeverityTag severity={finding.severity} />
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