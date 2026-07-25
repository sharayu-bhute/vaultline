import type { NormalizedFinding } from "./types.js";

interface PipVuln {
  id?: string;
  fix_versions?: string[];
  description?: string;
}
interface PipDependency {
  name?: string;
  version?: string;
  vulns?: PipVuln[];
}
interface PipAuditOutput {
  dependencies?: PipDependency[];
}

export function normalizePipAudit(raw: unknown): NormalizedFinding[] {
  const deps = Array.isArray(raw)
    ? (raw as PipDependency[])
    : (raw as PipAuditOutput)?.dependencies ?? [];

  const findings: NormalizedFinding[] = [];

  for (const dep of deps) {
    for (const vuln of dep.vulns ?? []) {
      findings.push({
        tool: "pip_audit",
        severity: "high",
        title: `Vulnerable dependency: ${dep.name ?? "unknown"} (${vuln.id ?? "no id"})`,
        description:
          vuln.description ??
          `Known vulnerability affecting ${dep.name ?? "unknown"} ${dep.version ?? ""}.`,
        filePath: "requirements.txt",
        lineNumber: null,
        commitHash: null,
        cveId: vuln.id ?? null,
        suggestedFix: vuln.fix_versions?.length
          ? `Upgrade ${dep.name} to ${vuln.fix_versions[0]}.`
          : "No fixed version published yet - track the advisory.",
      });
    }
  }

  return findings;
}