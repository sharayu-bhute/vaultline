import Navbar from "@/components/Navbar";
import ScanStatusView from "@/components/ScanStatusView";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mt-8 flex flex-col items-center gap-4 py-16">
          <ScanStatusView scanId={scanId} />
        </div>
      </main>
    </div>
  );
}