import { auth } from "../../auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          Find security issues before they ship
        </h1>
        <p className="text-gray-600 mb-8">
          Vaultline scans your repositories for hardcoded secrets, vulnerable
          dependencies, and misconfigurations — automatically, on every push.
        </p>

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/login"
            className="inline-block bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors w-64 text-center"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-block border px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors w-64 text-center"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}