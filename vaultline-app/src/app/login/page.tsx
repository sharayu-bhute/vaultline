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
  const [githubLoading, setGithubLoading] = useState(false);

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

  function handleGithubSignIn() {
    setGithubLoading(true);
    signIn("github", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <header className="relative z-10 border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <Logo size={32} />
      </header>
      <div className="absolute -inset-40 bg-[#7F77DD] opacity-25 blur-[130px] pointer-events-none select-none" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl grid md:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          {/* Left panel — brand + testimonial + feature list */}
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#3C3489] to-[#26215C] relative overflow-hidden p-10">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#EF9F27]/20 animate-float" />
            <div className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-white/5 animate-float" />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <QuoteIcon />
                <p className="text-white/80 text-lg leading-relaxed mt-3">
                  <i>
                    We caught a leaked production database key an hour after
                    it was pushed. Would&apos;ve taken days to notice
                    otherwise.
                  </i>
                </p>
                <QuoteIcon />
              </div>

              <div>
                <div className="h-px bg-white/10 mb-6" />
                <ul className="flex flex-col gap-4">
                  <FeatureItem
                    icon={<BoltIcon />}
                    text="Scans every push in seconds"
                  />
                  <FeatureItem
                    icon={<ShieldCheckIcon />}
                    text="Secrets, CVEs, and config in one place"
                  />
                  <FeatureItem
                    icon={<LinkIcon />}
                    text="Catches exposed endpoints before prod"
                  />
                </ul>
              </div>
            </div>
          </div>

          {/* Right panel — form */}
          <div className="bg-[#EEEDFE] p-8 sm:p-10 flex flex-col justify-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Sign in to check on your repos.
            </p>

            <button
              onClick={handleGithubSignIn}
              disabled={githubLoading}
              className="w-full border border-gray-200 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {githubLoading ? "Redirecting to GitHub…" : "Continue with GitHub"}
            </button>

            {githubLoading && (
              <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-400">
                <Spinner />
                <span>Taking you to GitHub</span>
              </div>
            )}

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
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="bg-[#26215C] text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-[#1c1846] transition-colors"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="text-sm text-center mt-6 text-gray-500">
              No account?{" "}
              <Link href="/signup" className="font-medium text-[#3C3489]">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-white/90">
        {icon}
      </div>
      <p className="text-white font-medium leading-snug pt-1.5 text-sm">{text}</p>
    </li>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 5" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L13 19" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#EF9F27]/60" aria-hidden="true">
      <path d="M7 8c-1.7 0-3 1.3-3 3v5h5v-5H6c0-1.1.9-2 2-2V8zM17 8c-1.7 0-3 1.3-3 3v5h5v-5h-3c0-1.1.9-2 2-2V8z" />
    </svg>
  );
}