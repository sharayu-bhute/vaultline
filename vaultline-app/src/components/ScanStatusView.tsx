"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Scan } from "@/types";

interface ScanStatusViewProps {
  scanId: string;
}

export default function ScanStatusView({ scanId }: ScanStatusViewProps) {
  const [scan, setScan] = useState<Scan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/scans/${scanId}`);
        if (!res.ok) {
          if (!cancelled) setError(`Scan not found (${res.status})`);
          return;
        }
        const data: Scan = await res.json();
        if (!cancelled) setScan(data);
      } catch {
        if (!cancelled) setError("Failed to reach the server");
      }
    }

    poll(); 
    const interval = setInterval(() => {
      setScan((current) => {
        if (current?.status === "completed" || current?.status === "failed") {
          clearInterval(interval);
        } else {
          poll();
        }
        return current;
      });
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [scanId]);

  if (error) return <p className="text-lg text-red-600">{error}</p>;
  if (!scan) return <p className="text-lg">Loading…</p>;

  return (
    <>
      {scan.status === "queued" && (
        <p className="text-lg">Queued — position {scan.queuePosition ?? "?"}</p>
      )}
      {scan.status === "cloning" && <p className="text-lg">Cloning repository…</p>}
      {scan.status === "scanning" && <p className="text-lg">Running security tools…</p>}
      {scan.status === "reporting" && <p className="text-lg">Generating report…</p>}
      {scan.status === "completed" && (
        <p className="text-lg text-green-600">
          Scan complete —{" "}
          <Link href={`/report/${scan.id}`} className="underline text-indigo-600">
            view report
          </Link>
        </p>
      )}
      {scan.status === "failed" && <p className="text-lg text-red-600">Scan failed.</p>}
    </>
  );
}