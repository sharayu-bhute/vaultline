import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getScanQueue } from "@/lib/queue";
import { auth } from "../../../../../auth";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const projectName = formData.get("name") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.name.endsWith(".zip")) {
    return NextResponse.json({ error: "Only .zip files are accepted" }, { status: 400 });
  }

  if (file.size > 100 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 });
  }

  const fullName = projectName?.trim() || file.name.replace(/\.zip$/, "");

  const repo = await prisma.repo.upsert({
    where: { fullName },
    update: {},
    create: { fullName, name: fullName, private: true, language: null },
  });

  const scan = await prisma.scan.create({
    data: { repoId: repo.id, status: "queued" },
  });


  const uploadDir = process.env.UPLOAD_DIR || "C:/vaultline-work/uploads";
  await mkdir(uploadDir, { recursive: true });
  const zipPath = path.join(uploadDir, `${scan.id}.zip`);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(zipPath, buffer);

  const queue = getScanQueue();
  const job = await queue.add(
    "scan",
    {
      scanId: scan.id,
      repoId: repo.id,
      fullName,
      checkHistory: false, 
      source: { type: "zip" as const, zipPath },
    },
    { removeOnComplete: 500, removeOnFail: 500 }
  );

  const waitingCount = await queue.getWaitingCount();
  await prisma.scan.update({
    where: { id: scan.id },
    data: { queuePosition: waitingCount },
  });

  return NextResponse.json({ scanId: scan.id, jobId: job.id, queuePosition: waitingCount });
}