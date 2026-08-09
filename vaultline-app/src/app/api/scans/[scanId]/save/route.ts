import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../../auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { scanId } = await params;
  const body = await req.json().catch(() => ({}));

  if (typeof body.saved !== "boolean") {
    return NextResponse.json({ error: "saved must be a boolean" }, { status: 400 });
  }

  const existing = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { user: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }
  if (existing.user?.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const scan = await prisma.scan.update({
    where: { id: scanId },
    data: { saved: body.saved },
  });

  return NextResponse.json({ saved: scan.saved });
}