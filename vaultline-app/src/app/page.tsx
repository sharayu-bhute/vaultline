import { auth } from "../../auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/logo";


export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <Logo size={22} />
        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
          <span>Product</span>
          <span>Pricing</span>
          <span>Docs</span>
        </nav>
        <Link
          href="/signup"
          className="bg-indigo-950 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-indigo-900 transition-colors"
        >
          Get started
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              Scans finish in under 90 seconds
            </span>
            <h1 className="text-4xl font-semibold text-gray-900 mb-4 leading-tight">
              Ship code.
              <br />
              Not your secrets.
            </h1>
            <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
              Vaultline watches every commit for exposed keys, risky
              dependencies, and misconfigured infrastructure &mdash;
              automatically, before a reviewer ever sees it.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-block bg-indigo-950 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-900 transition-colors text-center"
              >
                Connect a repo
              </Link>
              <Link
                href="/login"
                className="inline-block border border-indigo-200 text-indigo-950 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-center"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Illustrative scan-output card */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-white">
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
              <ScanIcon /> Scan output
            </div>
            <div className="flex flex-col gap-2">
              <OutputRow tone="indigo" text="No exposed secrets found" ok />
              <OutputRow tone="amber" text="2 outdated dependencies" />
              <OutputRow tone="neutral" text="Config checks passed" ok />
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 mt-16 border border-gray-200 rounded-2xl overflow-hidden">
          <Stat value="1,204" label="Secrets caught" color="text-indigo-700" />
          <Stat value="312" label="Repos protected" color="text-amber-700" border />
          <Stat value="98%" label="Fixed before merge" color="text-gray-900" />
        </div>
      </main>
    </div>
  );
}

function Stat({
  value,
  label,
  color,
  border,
}: {
  value: string;
  label: string;
  color: string;
  border?: boolean;
}) {
  return (
    <div
      className={`p-5 text-center ${border ? "border-x border-gray-200" : ""}`}
    >
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function OutputRow({
  tone,
  text,
  ok,
}: {
  tone: "indigo" | "amber" | "neutral";
  text: string;
  ok?: boolean;
}) {
  const bg =
    tone === "indigo"
      ? "bg-indigo-50 text-indigo-900"
      : tone === "amber"
      ? "bg-amber-50 text-amber-900"
      : "bg-gray-50 text-gray-700";

  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${bg}`}>
      {ok ? <CheckIcon /> : <WarnIcon />}
      {text}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 9v4M12 17h.01M10.3 3.9L2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}