"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ScanButtonProps {
  fullName: string;
  private?: boolean;
  language?: string | null;
}

export default function ScanButton({ fullName, private: isPrivate, language }: ScanButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkHistory, setCheckHistory] = useState(false); // fast scan by default

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          private: isPrivate,
          language,
          checkHistory,
        }),
      });

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
    <div>
      <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <input
          type="checkbox"
          checked={checkHistory}
          onChange={(e) => setCheckHistory(e.target.checked)}
          disabled={loading}
          className="accent-indigo-700"
        />
        Check full commit history (slower, catches secrets removed later)
      </label>

      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-indigo-950 text-white text-sm font-medium disabled:opacity-50 hover:bg-indigo-900 transition-colors"
      >
        {loading ? "Starting scan…" : "Run scan"}
      </button>
      {error && (
        <p className="text-sm text-amber-800 mt-1">{error}</p>
      )}
    </div>
  );
}