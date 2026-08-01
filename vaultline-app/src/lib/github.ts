export interface GitHubRepo {
    id :number;
    name: string;
    full_name: string,
    private:boolean;
    language: string | null;
}

export async function fetchGitHubRepos(accessToken: string): Promise<GitHubRepo[]> {
  const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  return res.json();
}
