"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ScanButtonProps {
  repoId: string;
  fullName: string;
}

export default function ScanButton({ repoId, fullName }: ScanButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId,
          fullName,
          checkHistory: true,
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
      <button
        onClick={handleClick}
        disabled={loading}
        className="mt-2 px-3 py-1.5 rounded bg-indigo-600 text-white text-sm disabled:opacity-50"
      >
        {loading ? "Starting scan…" : "Scan"}
      </button>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}