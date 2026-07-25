import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          {/* your turn: main headline, e.g. "Find security issues before they ship" */}
        </h1>
        <p className="text-gray-600 mb-8">
          {/* your turn: 1-2 sentence subtext explaining what it scans for */}
        </p>

        <Link
          href="/dashboard"
          className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
          Sign in with GitHub
        </Link>
      </div>
    </div>
  );
}