import Navbar from "@/components/Navbar";
import FindingCard from "@/components/FindingCard";
import { mockScans, mockRepos } from "@/lib/mockData";

export default async function ReportPage({params,}: {params: Promise<{ scanId: string }>;})
 {
  const { scanId } = await params;

  const scan = mockScans.find((s) => s.id === scanId);
  const repo = scan ? mockRepos.find((r) => r.id === scan.repoId) : undefined;

  if (!scan || !repo) {
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
        <h1 className="text-2xl font-bold mb-1">{repo.fullName}</h1>
        <p className="text-sm text-gray-500 mb-6">
          Scan status: {scan.status} • {scan.findings.length} finding(s)
        </p>

        <div className="flex flex-col gap-4">
          {scan.findings.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      </main>
    </div>
  );
}