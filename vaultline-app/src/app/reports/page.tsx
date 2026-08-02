import Navbar from "@/components/Navbar";
import Link from "next/link";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SavedReportsList from "@/components/SavedReportsList";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  const savedScans = await prisma.scan.findMany({
    where: { saved: true },
    include: { repo: true, findings: true },
    orderBy: { createdAt: "desc" },
  });

  const reports = savedScans.map((scan) => ({
    id: scan.id,
    repoFullName: scan.repo.fullName,
    findingsCount: scan.findings.length,
    status: scan.status,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#26215C] transition-colors mb-4"
        >
          <ArrowLeftIcon />
          Back
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Saved reports
        </h1>

        <SavedReportsList initialReports={reports} />
      </main>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}