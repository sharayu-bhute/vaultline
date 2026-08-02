"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong");
      }

      setText("");
      setRating(5);
      router.refresh(); // re-fetch the server-rendered list below
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-200 rounded-xl p-4 mb-10 flex flex-col gap-3"
    >
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-2xl leading-none ${
              n <= rating ? "text-[#EF9F27]" : "text-gray-200"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What did you think?"
        maxLength={500}
        rows={3}
        required
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="self-start bg-[#3C3489] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#26215C] transition-colors"
      >
        {loading ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}