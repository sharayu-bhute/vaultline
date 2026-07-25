import type { NormalizedFinding, Severity } from "./types.js";

interface NpmVia {
    title?: string;
    url?: string;
    cve?: string[];
}

interface NpmVuln {
    name?: string;
    severity?: string;
    range?: string;
    fixAvailable?: boolean | { name: string; version: string};
    via?: (string | NpmVia)[];
}

interface NpmAuditOutput {
  vulnerabilities?: Record<string, NpmVuln>;
}

function mapSeverity(s: string | undefined): Severity {
  switch (s) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "moderate":
      return "medium";
    default:
      return "low";
  }
}

export function normalizeNpmAudit(raw:unknown): NormalizedFinding[]{
    const vulns = (raw as NpmAuditOutput)?.vulnerabilities;
    if(!vulns || typeof vulns !== "object") return [];

    const findings : NormalizedFinding[] =[];

    for (const [pkgName, vuln] of Object.entries(vulns)) {
        const viaDetail = (vuln.via ?? []).find((v): v is NpmVia => typeof v === "object");
        const cve = viaDetail?.cve?.[0] ?? null;

        findings.push({
        tool: "npm_audit",
        severity: mapSeverity(vuln.severity),
        title: viaDetail?.title ?? `Vulnerable dependency: ${vuln.name ?? pkgName}`,
        description: viaDetail?.url
            ? `Known vulnerability affecting ${vuln.name ?? pkgName} (${vuln.range ?? "range unknown"}). Advisory: ${viaDetail.url}`
            : `Known vulnerability affecting ${vuln.name ?? pkgName} (${vuln.range ?? "range unknown"}).`,
        filePath: "package.json",
        lineNumber: null,
        commitHash: null,
        cveId: cve,
        suggestedFix:
            typeof vuln.fixAvailable === "object"
            ? `Upgrade ${vuln.fixAvailable.name} to ${vuln.fixAvailable.version}.`
            : vuln.fixAvailable
            ? "Run `npm audit fix` to apply the available patch."
            : "No automatic fix available yet - check the advisory for guidance.",
        });
    }

    return findings;
}