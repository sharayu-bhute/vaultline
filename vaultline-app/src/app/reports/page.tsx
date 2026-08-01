import Navbar from "@/components/Navbar";
import Link from "next/link";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Saved reports
        </h1>

        {savedScans.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl px-6 py-12 text-center bg-white">
            <p className="text-gray-500">
              No saved reports yet. Open a scan and hit &quot;Save report&quot; to keep it here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {savedScans.map((scan) => (
              <Link
                key={scan.id}
                href={`/scan/${scan.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {scan.repo.fullName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {scan.findings.length} finding(s) • Status: {scan.status}
                  </p>
                </div>
                <span className="text-sm font-medium text-[#3C3489]">
                  View report →
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}