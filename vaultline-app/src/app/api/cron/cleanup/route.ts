import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RETENTION_DAYS = 7;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const deleted = await prisma.scan.deleteMany({
    where: {
      saved: false,
      createdAt: { lt: cutoff },
    },
  });

  console.log(`[cron/cleanup] Deleted ${deleted.count} unsaved scans older than ${RETENTION_DAYS} days`);

  return NextResponse.json({ deletedCount: deleted.count });
}