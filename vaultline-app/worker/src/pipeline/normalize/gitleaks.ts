import type { NormalizedFinding } from "./types.js";

interface GitleaksEntry{
    Decsription?: string;
    RuleID?: string;
    File?: string;
    StartLine?: number;
    Commit?: string;
}

export function normalizeGitleaks(raw: unknown): NormalizedFinding[]{
    if (!Array.isArray(raw))return[];
    return (raw as GitleaksEntry[]).map((entry) =>({
        tool:"gitleaks",
        severity:"critical",
        title: ` hardcoded secret: ${entry.RuleID ?? "unknown rule"}`,
        description:
          entry.Decsription ??
          "A hardcoded secret or credential was found committed to the repository.",
        filePath: entry.File ?? "unknown",
        lineNumber: entry.StartLine ?? null,
        commitHash: entry.Commit ?? null,
        cveId : null,
        suggestedFix:
            "Rotate/revoke this credential immediately, remove it from git history, " +
            "and add the file (or a pattern for it) to .gitignore.",
    }));
}