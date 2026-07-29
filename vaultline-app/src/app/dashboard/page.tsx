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
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Repositories</h1>

        {accessToken ? (
          <GitHubRepoList accessToken={accessToken} />
        ) : (
          <p className="text-gray-500">
            Sign in with GitHub to see your repositories here, or use the
            upload option below. {/* upload flow coming next */}
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
      return <p className="text-gray-500">No repositories found on your GitHub account.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map((repo) => (
          <div key={repo.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{repo.name}</h2>
            <p className="text-gray-600 mb-2">{repo.full_name}</p>
            <p className="text-gray-600 mb-4">
              {repo.language ? `Language: ${repo.language}` : "Language: N/A"}
            </p>
            <p className="text-gray-600 mb-4">
              {repo.private ? "Private Repository" : "Public Repository"}
            </p>
            <ScanButton
              fullName={repo.full_name}
              private={repo.private}
              language={repo.language}
            />
          </div>
        ))}
        <div className="mt-8">
          <UploadScanForm />
        </div>
      </div>
      
    );
  } catch {
    return (
      <p className="text-red-600">
        Couldn&apos;t load your GitHub repositories. Try signing out and back in.
      </p>
    );
  }
}