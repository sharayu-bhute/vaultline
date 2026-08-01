import { prisma } from "@/lib/prisma";

const RETENTION_DAYS = 7;

async function cleanup() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const deleted = await prisma.scan.deleteMany({
    where: {
      saved: false,
      createdAt: { lt: cutoff },
    },
  });

  console.log(`Deleted ${deleted.count} unsaved scans older than ${RETENTION_DAYS} days`);
}

cleanup()
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());