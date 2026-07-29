export type Tool = "gitleaks" | "semgrep" | "trivy" | "npm_audit" | "pip_audit" | "url_scan";
export type Severity = "critical" | "high" | "medium" | "low";

export interface NormalizedFinding {
  tool: Tool;
  severity: Severity;
  title: string;
  description: string;
  filePath: string;
  lineNumber: number | null;
  commitHash: string | null;
  cveId: string | null;
  suggestedFix: string | null;
}