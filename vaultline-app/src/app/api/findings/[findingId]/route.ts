import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ findingId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { findingId } = await params;
  const body = await req.json().catch(() => ({}));

  if (typeof body.ignored !== "boolean") {
    return NextResponse.json({ error: "ignored must be a boolean" }, { status: 400 });
  }

  const finding = await prisma.finding.update({
    where: { id: findingId },
    data: { ignored: body.ignored },
  });

  return NextResponse.json(finding);
}