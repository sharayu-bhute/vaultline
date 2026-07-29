export type Severity = "critical" | "high" | "medium" | "low";

export type ScanStatus =
| "queued"
| "cloning"
| "scanning"
| "reporting"
| "completed"
| "failed";

export interface Repo {
    id: string;
    name: string;
    fullName: string;
    private: boolean;
    language: string | null;
    lastScanId: string | null;
}

export interface Finding {
    id: string;
    scanId: string;
    tool: "gitleaks" | "semgrep" | "trivy" | "npm_audit" | "pip_audit" | "url_scan";
    severity: Severity;
    title: string;
    description: string;
    filePath: string;
    lineNumber: number | null;
    commitHash : string | null;
    cveId: string | null;
    suggestedFix: string | null;
    ignored: boolean; 
}

export interface Scan {
    id: string;
    repoId: string;
    status: ScanStatus;
    queuePosition: number | null;
    startedAt: string | null;
    completedAt: string | null;
    findings: Finding[];
}