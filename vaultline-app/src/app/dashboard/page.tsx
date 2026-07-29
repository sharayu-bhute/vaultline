import Navbar from "@/components/Navbar";
import ScanButton from "@/components/ScanButton";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { fetchGitHubRepos } from "@/lib/github";
import UploadScanForm from "@/components/AddProjectForm";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  const accessToken = (session as typeof session & { accessToken?: string })
    ?.accessToken;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Your repositories
        </h1>

        {accessToken ? (
          <GitHubRepoList accessToken={accessToken} />
        ) : (
          <p className="text-gray-500">
            Sign in with GitHub to see your repositories here, or use the
            upload option below.
          </p>
        )}
      </main>
    </div>
  );
}

async function GitHubRepoList({ accessToken }: { accessToken: string }) {
  try {
    const repos = await fetchGitHubRepos(accessToken);

    if (repos.length === 0) {
      return (
        <p className="text-gray-500">
          No repositories found on your GitHub account.
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {repo.name}
            </h2>
            <p className="text-sm text-gray-500 mb-1">{repo.full_name}</p>
            <p className="text-sm text-gray-500 mb-1">
              {repo.language ? `Language: ${repo.language}` : "Language: N/A"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {repo.private ? "Private repository" : "Public repository"}
            </p>
            <ScanButton
              fullName={repo.full_name}
              private={repo.private}
              language={repo.language}
            />
          </div>
        ))}
        <div className="md:col-span-2 mt-4">
          <UploadScanForm />
        </div>
      </div>
    );
  } catch {
    return (
      <p className="text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm">
        Couldn&apos;t load your GitHub repositories. Try signing out and back in.
      </p>
    );
  }
}