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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-amber-800">Scan not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-1">
            <h1 className="text-xl font-semibold text-gray-900">
              {scan.repo.fullName}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Scan status: {scan.status} • {scan.findings.length} finding(s)
          </p>

          <FindingsList findings={scan.findings} />
        </div>
      </main>
    </div>
  );
}