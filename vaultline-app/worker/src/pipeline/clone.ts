import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, mkdir } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import AdmZip from "adm-zip";
import type { ScanJobData } from "../queue.js";

const execFileAsync = promisify(execFile);

export interface CloneResult {
  repoDir: string;
  outputDir: string;
  cleanup: () => Promise<void>;
}

async function prepareWorkspace(scanId: string) {
  const workDir = process.env.WORK_DIR || os.tmpdir();
  await mkdir(workDir, { recursive: true });

  const base = await mkdtemp(path.join(workDir, `scan-${scanId}-`));
  const repoDir = path.join(base, "repo");
  const outputDir = path.join(base, "output");
  await mkdir(repoDir, { recursive: true });
  await mkdir(outputDir, { recursive: true });

  return {
    repoDir,
    outputDir,
    cleanup: () => rm(base, { recursive: true, force: true }),
  };
}

async function cloneFromGit(cloneUrl: string, repoDir: string, checkHistory: boolean) {
  const args = ["clone", "--no-tags", "--single-branch"];
  if (!checkHistory) args.push("--depth", "1");
  args.push(cloneUrl, repoDir);

  await execFileAsync("git", args, { timeout: 5 * 60 * 1000 });
}

async function extractZip(zipPath: string, repoDir: string) {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(repoDir, true);
  await rm(zipPath, { force: true });
}

export async function cloneRepo(job: {
  scanId: string;
  checkHistory: boolean;
  source: ScanJobData["source"];
}): Promise<CloneResult> {
  const { repoDir, outputDir, cleanup } = await prepareWorkspace(job.scanId);

  try {
    if (job.source.type === "git") {
      await cloneFromGit(job.source.cloneUrl, repoDir, job.checkHistory);
    } else {
      await extractZip(job.source.zipPath, repoDir);
    }
  } catch (err) {
    await cleanup();
    const reason = job.source.type === "git" ? "git clone failed" : "zip extraction failed";
    throw new Error(`${reason}: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { repoDir, outputDir, cleanup };
}