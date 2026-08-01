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

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      router.push("/login");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute -inset-40 bg-[#7F77DD] opacity-25 blur-[130px] pointer-events-none select-none" />

      <header className="relative z-10 border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <Logo size={32} />
      </header>

      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl grid md:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          {/* Left panel — brand + feature list, matching landing hero gradient */}
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#3C3489] to-[#26215C] relative overflow-hidden p-10">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#EF9F27]/20 animate-float" />
            <div className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-white/5 animate-float" />

            <div className="relative z-10">
              <p className="text-white/70 text-sm font-semibold tracking-widest mb-6">
                WHAT YOU GET
              </p>
              <ul className="flex flex-col gap-4">
                <FeatureItem
                  icon={<BoltIcon />}
                  text="Scan on every push, automatically"
                />
                <FeatureItem
                  icon={<ShieldCheckIcon />}
                  text="Secrets, dependency, and config checks"
                />
                <FeatureItem
                  icon={<HeartIcon />}
                  text="Free for public repos, forever"
                />
              </ul>
            </div>
          </div>

          {/* Right panel — form */}
          <div className="bg-[#EEEDFE] p-8 sm:p-10">
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
                className="bg-[#26215C] text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 hover:bg-[#1c1846] transition-colors"
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
              <Link href="/login" className="font-medium text-[#3C3489]">
                Sign in
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
      <p className="text-white font-medium leading-snug pt-1.5">{text}</p>
    </li>
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

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}