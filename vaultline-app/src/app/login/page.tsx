"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-3xl grid md:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        {/* Left panel — brand + testimonial */}
        <div className="hidden md:flex flex-col justify-between bg-indigo-950 p-10">
          <Logo size={20} variant="white" />
          <div>
            <p className="text-indigo-100 text-sm leading-relaxed mb-4">
              &ldquo;We caught a leaked production database key an hour after
              it was pushed. Would&apos;ve taken days to notice
              otherwise.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-amber-950 text-xs font-semibold">
                RS
              </div>
              <div>
                <p className="text-white text-sm font-medium">Riya Sharma</p>
                <p className="text-indigo-300 text-xs">
                  Staff engineer, Northline
                </p>
              </div>
            </div>
          </div>
          <p className="text-indigo-400 text-xs">
            Trusted by security teams at 300+ companies
          </p>
        </div>

        {/* Right panel — form */}
        <div className="bg-white p-8 sm:p-10 flex flex-col justify-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Sign in to check on your repos.
          </p>

          <button
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="w-full border border-gray-200 py-2.5 rounded-lg font-medium text-sm mb-4 hover:bg-gray-50 transition-colors"
          >
            Continue with GitHub
          </button>

          <div className="flex items-center gap-2 my-4 text-gray-400 text-xs">
            <div className="flex-1 h-px bg-gray-200" />
            or
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-400 text-amber-950 py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-amber-300 transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-gray-500">
            No account?{" "}
            <Link href="/signup" className="font-medium text-indigo-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}