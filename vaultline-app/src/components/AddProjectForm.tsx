"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProjectForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"zip" | "url">("zip");
  const [file, setFile] = useState<File | null>(null);
  const [gitUrl, setGitUrl] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "zip" && !file) {
      setError("Choose a .zip file first");
      return;
    }
    if (mode === "url" && !gitUrl.trim()) {
      setError("Enter a git URL first");
      return;
    }

    setLoading(true);

    try {
      let res: Response;

      if (mode === "zip") {
        const formData = new FormData();
        formData.append("file", file as File);
        if (name.trim()) formData.append("name", name.trim());
        res = await fetch("/api/scans/upload", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/scans/url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gitUrl: gitUrl.trim() }),
        });
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      const { scanId } = await res.json();
      router.push(`/scan/${scanId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-dashed border-amber-300 bg-amber-50/40 rounded-xl p-4 max-w-md flex flex-col gap-3"
    >
      <h2 className="font-semibold text-gray-900">Scan a project</h2>

      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("zip")}
          className={`px-3 py-1.5 rounded-lg ${
            mode === "zip"
              ? "bg-indigo-950 text-white"
              : "border border-gray-200 text-gray-600"
          }`}
        >
          Upload .zip
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`px-3 py-1.5 rounded-lg ${
            mode === "url"
              ? "bg-indigo-950 text-white"
              : "border border-gray-200 text-gray-600"
          }`}
        >
          Git URL
        </button>
      </div>

      {mode === "zip" ? (
        <>
          <input
            type="text"
            placeholder="Project name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          />
          <input
            type="file"
            accept=".zip"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </>
      ) : (
        <input
          type="url"
          placeholder="https://github.com/owner/repo.git"
          value={gitUrl}
          onChange={(e) => setGitUrl(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        />
      )}

      {error && <p className="text-sm text-amber-800">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-950 text-white py-2 rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-indigo-900 transition-colors"
      >
        {loading ? "Starting…" : "Scan"}
      </button>
    </form>
  );
}