import { prisma } from "../prisma.js";
import { cloneRepo } from "./clone.js";
import { runSandboxedScan } from "./docker.js";
import { normalizeAll } from "./normalize/index.js";
import type { ScanJobData } from "../queue.js";

export async function runScan(job: ScanJobData): Promise<void> {
  const { scanId } = job;

  await prisma.scan.update({
    where: { id: scanId },
    data: { status: "cloning", startedAt: new Date(), queuePosition: null },
  });

  let clone: Awaited<ReturnType<typeof cloneRepo>>;
  try {
    clone = await cloneRepo({
      cloneUrl: job.cloneUrl,
      scanId,
      checkHistory: job.checkHistory,
    });
  } catch (err) {
    await markFailed(scanId, err);
    return;
  }

  try {
    await prisma.scan.update({ where: { id: scanId }, data: { status: "scanning" } });

    await runSandboxedScan({
      repoDir: clone.repoDir,
      outputDir: clone.outputDir,
      scanId,
    });

    await prisma.scan.update({ where: { id: scanId }, data: { status: "reporting" } });

    const findings = await normalizeAll(clone.outputDir);

    await prisma.$transaction([
      prisma.finding.deleteMany({ where: { scanId } }), 
      prisma.finding.createMany({
        data: findings.map((f) => ({ ...f, scanId })),
      }),
      prisma.scan.update({
        where: { id: scanId },
        data: { status: "completed", completedAt: new Date() },
      }),
      prisma.repo.update({
        where: { id: job.repoId },
        data: { lastScanId: scanId },
      }),
    ]);
  } catch (err) {
    await markFailed(scanId, err);
  } finally {
    await clone.cleanup().catch(() => {});
  }
}

async function markFailed(scanId: string, err: unknown) {
  console.error(`[scan ${scanId}] failed:`, err);
  await prisma.scan
    .update({
      where: { id: scanId },
      data: { status: "failed", completedAt: new Date() },
    })
    .catch(() => {});
}