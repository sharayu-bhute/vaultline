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
      <main className="max-w-6xl mx-auto px-4 py-10 flex flex-col gap-10">
        <UploadScanForm />

        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Your repositories
          </h1>

          {accessToken ? (
            <GitHubRepoList accessToken={accessToken} />
          ) : (
            <div className="border border-dashed border-gray-300 rounded-2xl px-6 py-12 text-center bg-white">
              <p className="text-gray-500">
                Sign in with GitHub to see your repositories here, or use the
                upload option.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

async function GitHubRepoList({ accessToken }: { accessToken: string }) {
  try {
    const repos = await fetchGitHubRepos(accessToken);

    if (repos.length === 0) {
      return (
        <div className="border border-dashed border-gray-300 rounded-2xl px-6 py-12 text-center bg-white">
          <p className="text-gray-500">
            No repositories found on your GitHub account.
          </p>
        </div>
      );
    }

    return (
      <div className="max-h-[600px] overflow-y-auto pr-2 -mr-2 flex flex-col gap-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-gray-900">
                {repo.name}
              </h2>
              <p className="text-sm text-gray-500">{repo.full_name}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>
                  {repo.language ? `Language: ${repo.language}` : "Language: N/A"}
                </span>
                <span className="text-gray-300">•</span>
                <span>{repo.private ? "Private repository" : "Public repository"}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <ScanButton
                fullName={repo.full_name}
                private={repo.private}
                language={repo.language}
              />
            </div>
          </div>
        ))}
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