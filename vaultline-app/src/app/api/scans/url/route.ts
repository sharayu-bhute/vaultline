import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getScanQueue } from "@/lib/queue";
import { auth } from "../../../../../auth";

interface TriggerUrlScanBody {
  gitUrl: string;
  checkHistory?: boolean;
}

function isSafeGitUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") return false;

  const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
  if (blockedHosts.includes(parsed.hostname)) return false;
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(parsed.hostname)) return false;

  return true;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: TriggerUrlScanBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.gitUrl || !isSafeGitUrl(body.gitUrl)) {
    return NextResponse.json(
      { error: "Please provide a valid https:// git URL" },
      { status: 400 }
    );
  }

  const fullName = body.gitUrl
    .replace(/^https:\/\//, "")
    .replace(/\.git$/, "")
    .split("/")
    .slice(-2)
    .join("/");

  const repo = await prisma.repo.upsert({
    where: { fullName },
    update: {},
    create: { fullName, name: fullName, private: false, language: null },
  });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });

  const scan = await prisma.scan.create({
    data: { repoId: repo.id, status: "queued", userId: user?.id },
  });

  const queue = getScanQueue();
  const job = await queue.add(
    "scan",
    {
      scanId: scan.id,
      repoId: repo.id,
      fullName,
      checkHistory: body.checkHistory ?? false,
      source: { type: "git" as const, cloneUrl: body.gitUrl },
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