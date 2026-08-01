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
      className="border border-dashed border-amber-300 rounded-2xl p-6 sm:p-8 w-full flex flex-col gap-4 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Scan a project</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload a zip archive or point us at a git repository.
        </p>
      </div>

      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("zip")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === "zip"
              ? "bg-[#26215C] text-white"
              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Upload .zip
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === "url"
              ? "bg-[#26215C] text-white"
              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
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
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <label className="border border-dashed border-gray-300 rounded-lg px-4 py-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <p className="text-sm text-gray-600">
              {file ? file.name : "Click to choose a .zip file"}
            </p>
          </label>
        </>
      ) : (
        <input
          type="url"
          placeholder="https://github.com/owner/repo.git"
          value={gitUrl}
          onChange={(e) => setGitUrl(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-[#26215C] text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-[#1c1846] transition-colors"
      >
        {loading ? "Starting…" : "Scan"}
      </button>
    </form>
  );
}