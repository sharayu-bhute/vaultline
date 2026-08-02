import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../auth";
import ReviewForm from "@/components/ReviewForm";
import Link from "next/dist/client/link";
import Logo from "@/components/logo";

export default async function ReviewsPage() {
  const session = await auth();
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div>
      <header className="border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo size={32} />
        </Link>
      </header>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5  px-6 text-sm font-medium text-gray-500 hover:text-[#26215C] transition-colors">
          <ArrowLeftIcon />
          Back
        </Link>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Reviews</h1>
        {avgRating && (
          <p className="text-gray-500 mb-8">
            {avgRating} average · {reviews.length} review{reviews.length !== 1 && "s"}
          </p>
        )}

        {session?.user ? (
          <ReviewForm />
        ) : (
          <p className="text-sm text-gray-500 border border-gray-200 rounded-lg p-4 mb-10">
            Sign in to leave your own review.
          </p>
        )}

        <div className="flex flex-col gap-4 mt-10">
          {reviews.length === 0 && (
            <p className="text-gray-400 text-sm">No reviews yet — be the first.</p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">{r.name}</p>
                <Stars rating={r.rating} />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-[#EF9F27]">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < rating ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}