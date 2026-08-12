interface DispatchScanParams {
  scanId: string;
  repoId: string;
  fullName: string;
  checkHistory: boolean;
  source: { type: "git"; cloneUrl: string } | { type: "zip"; zipUrl: string };
}

export async function dispatchScanWorkflow(params: DispatchScanParams): Promise<void> {
  const token = process.env.GH_DISPATCH_TOKEN;
  const owner = process.env.GH_REPO_OWNER;
  const repo = process.env.GH_REPO_NAME;

  if (!token || !owner || !repo) {
    throw new Error("GH_DISPATCH_TOKEN, GH_REPO_OWNER, and GH_REPO_NAME must be set");
  }

  const sourceType = params.source.type;
  const sourceValue = params.source.type === "git" ? params.source.cloneUrl : params.source.zipUrl;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/scan.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          scan_id: params.scanId,
          repo_id: params.repoId,
          full_name: params.fullName,
          check_history: String(params.checkHistory),
          source_type: sourceType,
          source_value: sourceValue,
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to dispatch scan workflow: ${res.status} ${text}`);
  }
}