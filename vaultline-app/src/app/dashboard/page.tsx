import Navbar from "@/components/Navbar";
import RepoCard from "@/components/RepoCard";
import { mockRepos, mockScanStatusByRepoId } from "@/lib/mockData";

export default function DashboardPage() {
  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Repositories</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockRepos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              status={mockScanStatusByRepoId[repo.id]}
            />
          ))}
        </div>
      </main>
    </div>
  );
}