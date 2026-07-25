import type { NormalizedFinding, Severity } from "./types.js";

interface TrivyVuln {
    VulnerabilityID?: string;
    PkgName?: string;
    FixedVersion?: string;
    Severity?: string;
    Title?: string;
    Description?:string;
}

interface TrivyMiscongig{
    ID?: string;
    Title?: string;
    Description?: string;
    Severity?: string;
    Resolution?: string;
}

interface TrivySecret {
    RuleID?: string;
    Title?: string;
    StartLine?: number;
}

interface trivyResult {
    Target?: string;
    Vulnerabilities?: TrivyVuln[];
    Misconfigurations?: TrivyMiscongig[];
    Secrets?: TrivySecret[];
}

interface TrivyOutput {
    Results?: trivyResult[];
}

function mapSeverity(s: string | undefined) : Severity {
    switch((s ?? "").toUpperCase()){
    case "CRITICAL":
      return "critical";
    case "HIGH":
      return "high";
    case "MEDIUM":
      return "medium";
    default:
      return "low";       
    }
}

export function normalizeTrivy(raw : unknown) : NormalizedFinding[]{
    const results = (raw as TrivyOutput)?.Results;
    if(!Array.isArray(results)) return [];

    const findings: NormalizedFinding[]=[];
    for (const result of results){
        const target = result.Target ?? "unknown";
        for (const v of result.Vulnerabilities ?? []){
            findings.push({
                tool:"trivy",
                severity: mapSeverity(v.Severity),
                title: v.Title || `${v.PkgName ?? "dependency"} ${v.VulnerabilityID ?? ""}`.trim(),
                description : v.Description ?? "Known vulnerability in a project dependency.",
                filePath :target ,
                lineNumber : null,
                commitHash: null,
                cveId: v.VulnerabilityID ?? null,
                suggestedFix: v.FixedVersion 
                ? `Upgarde ${ v.PkgName} to ${v.FixedVersion}.`
                : "No fixed version published yet - track the advisory.",
            });
        }

        for (const m of result.Misconfigurations ?? []){
            findings.push({
                tool:"trivy",
                severity: mapSeverity(m.Severity),
                title: m.Title ?? m.ID ?? "Misconfiguration",
                description : m.Description ?? "Configuration issue detected.",
                filePath :target ,
                lineNumber : null,
                commitHash: null,
                cveId: null,
                suggestedFix: m.Resolution ?? null, 
            });
        }

        for (const s of result.Secrets ?? []) {
            findings.push({
                tool: "trivy",
                severity: "critical",
                title: `Hardcoded secret (2nd pass): ${s.RuleID ?? "unknown rule"}`,
                description: s.Title ?? "Trivy's secret scanner independently flagged this.",
                filePath: target,
                lineNumber: s.StartLine ?? null,
                commitHash: null,
                cveId: null,
                suggestedFix: "Rotate the credential and remove it from the file/history.",
            });
        }
    }
    return findings;
}