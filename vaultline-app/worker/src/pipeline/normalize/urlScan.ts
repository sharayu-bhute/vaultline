import type { NormalizedFinding, Severity } from "./types.js";

interface UrlScanEntry {
  file?: string;
  line?: number;
  url?: string;
  severity?: string;
  reason?: string;
}
interface UrlScanOutput {
  findings?: UrlScanEntry[];
}

function mapSeverity(s: string | undefined): Severity {
  switch (s) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "low":
      return "low";
    default:
      return "medium";
  }
}

export function normalizeUrlScan(raw: unknown): NormalizedFinding[] {
  const findings = (raw as UrlScanOutput)?.findings;
  if (!Array.isArray(findings)) return [];

  return findings.map((entry) => ({
    tool: "url_scan",
    severity: mapSeverity(entry.severity),
    title: entry.reason ?? "Hardcoded URL found",
    description: entry.url
      ? `Found in source: ${entry.url}`
      : "A hardcoded URL was found in the source code.",
    filePath: entry.file ?? "unknown",
    lineNumber: entry.line ?? null,
    commitHash: null,
    cveId: null,
    suggestedFix:
      entry.severity === "critical"
        ? "Remove this credential/key from source and load it from an environment variable or secret manager instead."
        : entry.severity === "high"
        ? "Confirm this internal endpoint isn't meant to stay private, and move it to configuration if it varies by environment."
        : "Consider moving hardcoded URLs to configuration if they change between environments.",
  }));
}