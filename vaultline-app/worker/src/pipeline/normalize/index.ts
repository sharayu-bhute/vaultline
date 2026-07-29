import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NormalizedFinding } from "./types.js";
import { normalizeGitleaks } from "./gitleaks.js";
import { normalizeSemgrep } from "./semgrep.js";
import { normalizeTrivy } from "./trivy.js";
import { normalizeNpmAudit } from "./npmAudit.js";
import { normalizePipAudit } from "./pipAudit.js";
import { normalizeUrlScan } from "./urlScan.js";

async function readJson(filePath : string): Promise<unknown>{
    try {
        const text = await readFile(filePath , "utf-8");
        return JSON.parse(text);
    } catch {
    return null ;
    }
}

function fingerprint(f:NormalizedFinding): string {
    return [
        f.tool =="trivy" || f.tool === "npm_audit" ? "dep" : f.tool,
        f.filePath,
        f.lineNumber,
        f.cveId,
        f.title,
    ]
    .join("::")
    .toLowerCase();
}

export async function normalizeAll(outputDir: string): Promise<NormalizedFinding[]>{
    const [gitleaksRaw, semgrepRaw, trivyRaw, npmRaw, pipRaw, urlScanRaw] = await Promise.all([
        readJson(path.join(outputDir, "gitleaks.json")),
        readJson(path.join(outputDir, "semgrep.json")),
        readJson(path.join(outputDir, "trivy.json")),
        readJson(path.join(outputDir, "npm-audit.json")),
        readJson(path.join(outputDir, "pip-audit.json")),
        readJson(path.join(outputDir, "url-scan.json")),
    ]);
    const all = [
        ...normalizeGitleaks(gitleaksRaw),
        ...normalizeSemgrep(semgrepRaw),
        ...normalizeTrivy(trivyRaw),
        ...normalizeNpmAudit(npmRaw),
        ...normalizePipAudit(pipRaw),
        ...normalizeUrlScan(urlScanRaw),
    ];

    const seen = new Set<string>();
    const deduped: NormalizedFinding[] = [];
    for (const f of all) {
        const key = fingerprint(f);
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(f);
    }

    const order = { critical: 0 , high: 1, medium: 2, low: 3};
    deduped.sort((a,b)=> order[a.severity]-order[b.severity]);

    return deduped;

}
