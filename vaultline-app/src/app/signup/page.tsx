"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/logo";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Something went wrong");
      setLoading(false);
      return;
    }

    // Account created — sign in immediately so they land on the dashboard
    // without a second manual login step.
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      // Extremely unlikely right after a successful signup, but handle it
      // gracefully rather than assume it can't happen.
      router.push("/login");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-3xl grid md:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        {/* Left panel — brand + feature list */}
        <div className="hidden md:flex flex-col justify-between bg-amber-400 p-10">
          <Logo size={20} />
          <div>
            <p className="text-amber-900 text-xs font-medium tracking-wide mb-4">
              WHAT YOU GET
            </p>
            <ul className="flex flex-col gap-3">
              <FeatureItem text="Scan on every push, automatically" />
              <FeatureItem text="Secrets, dependency, and config checks" />
              <FeatureItem text="Free for public repos, forever" />
            </ul>
          </div>
          <p className="text-amber-800 text-xs">No credit card required</p>
        </div>

        {/* Right panel — form */}
        <div className="bg-white p-8 sm:p-10">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 mb-6">Takes about a minute.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <input
              type="password"
              placeholder="Password (min 9 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={9}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-950 text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-indigo-900 transition-colors"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="w-full border border-gray-200 py-2.5 rounded-lg font-medium text-sm mt-3 hover:bg-gray-50 transition-colors"
          >
            Sign up with GitHub
          </button>

          <p className="text-sm text-center mt-6 text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-amber-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-amber-950">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l3 3 5-6" />
      </svg>
      {text}
    </li>
  );
}