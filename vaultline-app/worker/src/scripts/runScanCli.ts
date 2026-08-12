import { writeFile, mkdtemp } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { runScan } from "../pipeline/runScan.js";
import type { ScanJobData } from "../queue.js";

function getArg(name: string): string {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1 || !process.argv[idx + 1]) {
    throw new Error(`Missing required --${name} argument`);
  }
  return process.argv[idx + 1];
}

async function downloadZipToTemp(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download zip from blob: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const dir = await mkdtemp(path.join(os.tmpdir(), "vaultline-zip-"));
  const zipPath = path.join(dir, "source.zip");
  await writeFile(zipPath, buffer);
  return zipPath;
}

async function main() {
  const scanId = getArg("scanId");
  const repoId = getArg("repoId");
  const fullName = getArg("fullName");
  const checkHistory = getArg("checkHistory") === "true";
  const sourceType = getArg("sourceType");
  const sourceValue = getArg("sourceValue");

  let source: ScanJobData["source"];
  if (sourceType === "git") {
    source = { type: "git", cloneUrl: sourceValue };
  } else if (sourceType === "zip") {
    console.log("[runScanCli] downloading zip from blob storage...");
    const zipPath = await downloadZipToTemp(sourceValue);
    source = { type: "zip", zipPath };
  } else {
    throw new Error(`Unknown sourceType: ${sourceType}`);
  }

  const job: ScanJobData = { scanId, repoId, fullName, checkHistory, source };

  console.log(`[runScanCli] starting scan ${scanId} (${fullName})`);
  await runScan(job);
  console.log(`[runScanCli] finished scan ${scanId}`);
}

main().catch((err) => {
  console.error("[runScanCli] fatal error:", err);
  process.exit(1);
});