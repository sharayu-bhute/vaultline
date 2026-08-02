import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;
  const body = await req.json().catch(() => ({}));

  if (typeof body.saved !== "boolean") {
    return NextResponse.json({ error: "saved must be a boolean" }, { status: 400 });
  }

  const scan = await prisma.scan.update({
    where: { id: scanId },
    data: { saved: body.saved },
  });

  return NextResponse.json({ saved: scan.saved });
}