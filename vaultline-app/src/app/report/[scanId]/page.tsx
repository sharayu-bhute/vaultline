import Navbar from "@/components/Navbar";
import FindingsList from "@/components/FindingsList";
import { prisma } from "@/lib/prisma";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { findings: true, repo: true },
  });

  if (!scan) {
    return (
      <div>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-red-600">Scan not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">{scan.repo.fullName}</h1>
        <p className="text-sm text-gray-500 mb-6">
          Scan status: {scan.status} • {scan.findings.length} finding(s)
        </p>

        <FindingsList findings={scan.findings} />
      </main>
    </div>
  );
}