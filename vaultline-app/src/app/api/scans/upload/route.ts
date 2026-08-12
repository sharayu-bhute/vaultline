import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispatchScanWorkflow } from "@/lib/githubDispatch";
import { auth } from "../../../../../auth";
import { put } from "@vercel/blob";

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

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });

  const scan = await prisma.scan.create({
    data: { repoId: repo.id, status: "queued", userId: user?.id },
  });

  const blob = await put(`scan-uploads/${scan.id}.zip`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  await dispatchScanWorkflow({
    scanId: scan.id,
    repoId: repo.id,
    fullName,
    checkHistory: false,
    source: { type: "zip", zipUrl: blob.url },
  });

  return NextResponse.json({ scanId: scan.id });
}