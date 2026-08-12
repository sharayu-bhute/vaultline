import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispatchScanWorkflow } from "@/lib/githubDispatch";
import { GITHUB_HOST } from "@/lib/config";
import { auth } from "../../../../auth";

interface TriggerScanBody {
  fullName: string;
  private?: boolean;
  language?: string | null;
  checkHistory?: boolean;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const accessToken = (session as typeof session & { accessToken?: string })
    ?.accessToken;

  if (!session?.user || !accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: TriggerScanBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.fullName) {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }

  const repo = await prisma.repo.upsert({
    where: { fullName: body.fullName },
    update: {},
    create: {
      fullName: body.fullName,
      name: body.fullName.split("/").pop() || body.fullName,
      private: body.private ?? false,
      language: body.language ?? null,
    },
  });

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });

  const scan = await prisma.scan.create({
    data: { repoId: repo.id, status: "queued", userId: user?.id },
  });

const cloneUrl = `https://x-access-token:${accessToken}@${GITHUB_HOST}/${body.fullName}.git`;

await dispatchScanWorkflow({
  scanId: scan.id,
  repoId: repo.id,
  fullName: body.fullName,
  checkHistory: body.checkHistory ?? true,
  source: { type: "git", cloneUrl },
});

return NextResponse.json({ scanId: scan.id });
}