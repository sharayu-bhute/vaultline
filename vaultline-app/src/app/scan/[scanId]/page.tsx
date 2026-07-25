import Navbar from "@/components/Navbar";
import { mockScans, mockRepos } from "@/lib/mockData";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
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

        <div className="mt-8 flex flex-col items-center gap-4 py-16">
          {scan.status === "queued" && (
            <p className="text-lg">
              Queued — position {scan.queuePosition ?? "?"}
            </p>
          )}
          {scan.status === "cloning" && <p className="text-lg">Cloning repository…</p>}
          {scan.status === "scanning" && <p className="text-lg">Running security tools…</p>}
          {scan.status === "reporting" && <p className="text-lg">Generating report…</p>}
          {scan.status === "completed" && (
            <p className="text-lg text-green-600">
              Scan complete —{" "}
              <a href={`/report/${scan.id}`} className="underline text-indigo-600">
                view report
              </a>
            </p>
          )}
          {scan.status === "failed" && (
            <p className="text-lg text-red-600">Scan failed.</p>
          )}
        </div>
      </main>
    </div>
  );
}