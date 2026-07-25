import type { NormalizedFinding, Severity } from "./types.js";

interface SemgrepResult {
    check_id?: string;
    path?: string;
    start?: { line?: number};
    extra?:{
        message?: string;
        severity?: string;
        fix?: string;
    };
}

interface SemgrepOutput {
    results?: SemgrepResult[];
}

function mapSeverity(s:string | undefined): Severity{
    switch (s) {
        case "ERROR":
            return "high";
        case "WARNING":
            return "medium";
        default:
            return "low";
    }
}

export function normalizeSemgrep(raw: unknown) : NormalizedFinding[] {
    const results = (raw as SemgrepOutput)?.results;
    if(!Array.isArray(results)) return [];

 return results.map((r) => ({
    tool: "semgrep",
    severity: mapSeverity(r.extra?.severity),
    title: r.check_id ?? "Semgrep finding",
    description: r.extra?.message ?? "Semgrep flagged a code-level issue.",
    filePath: r.path ?? "unknown",
    lineNumber: r.start?.line ?? null,
    commitHash: null,
    cveId: null,
    suggestedFix: r.extra?.fix ?? null,
  }));
}