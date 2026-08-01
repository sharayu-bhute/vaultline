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
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute -inset-40 bg-[#7F77DD] opacity-25 blur-[130px] pointer-events-none select-none" />

      <header className="border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <Logo size={32} />
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-[#3C3489] to-[#26215C] relative overflow-hidden p-10 md:p-14 text-white">
         <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#EF9F27]/20 animate-float" />
          <div className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-white/5 animate-float" />

          <div className="relative z-10">
            <h1 className="text-4xl font-semibold mb-4 leading-tight">
              Ship code.
              <br />
              Not your secrets.
            </h1>
            <p className="text-white/70 mb-8 max-w-md leading-relaxed">
              Vaultline watches every commit for exposed keys, risky
              dependencies, and misconfigured infrastructure &mdash;
              automatically, before a reviewer ever sees it.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/signup"
                className="inline-block bg-white text-[#26215C] px-6 py-3 rounded-lg font-medium hover:bg-[#EEEDFE] transition-colors text-center"
              >
                Connect a repo
              </Link>
              <Link
                href="/login"
                className="inline-block border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors text-center"
              >
                Sign in
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <CapabilityTile icon={<KeyIcon />} label="Hardcoded secrets" sub="gitleaks" />
              <CapabilityTile icon={<PackageIcon />} label="Dependency CVEs" sub="Trivy" accent />
              <CapabilityTile icon={<LinkIcon />} label="Exposed endpoints" sub="Custom scanner" />
            </div>
          </div>
        </div>
      </main>
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



function CapabilityTile({
  icon,
  label,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 transition-all duration-200 hover:scale-105 hover:bg-white/20 cursor-default ${
        accent ? "bg-[#EF9F27]/20" : "bg-white/10"
      }`}
    >
      <div className={`mb-2 ${accent ? "text-[#EF9F27]" : "text-white/80"}`}>{icon}</div>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-white/60 mt-0.5">{sub}</p>
    </div>
  );
}

function KeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="15" r="4" />
      <path d="M9.5 12.5L20 2M20 2v5M20 2h-5" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 8L12 3 3 8l9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11 5" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L13 19" />
    </svg>
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