import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;
  const { saved } = await req.json();

  const scan = await prisma.scan.update({
    where: { id: scanId },
    data: { ...(saved !== undefined ? ({ saved } as any) : {}) },
  });

  return NextResponse.json({ saved: (scan as any).saved ?? saved });
}