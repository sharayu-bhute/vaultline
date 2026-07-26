import Navbar from "@/components/Navbar";
import RepoCard from "@/components/RepoCard";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  const repos = await prisma.repo.findMany({
    orderBy: { name: "asc" },
  });

  const statusByRepoId: Record<string, string> = {};
  for (const repo of repos) {
    if (repo.lastScanId) {
      const scan = await prisma.scan.findUnique({
        where: { id: repo.lastScanId },
        select: { status: true },
      });
      if (scan) statusByRepoId[repo.id] = scan.status;
    }
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Repositories</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              status={statusByRepoId[repo.id] as never}
            />
          ))}
        </div>
      </main>
    </div>
  );
}