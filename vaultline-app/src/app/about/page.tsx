import Logo from "@/components/logo";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo size={32} />
        </Link>
      </header>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5  px-6 text-sm font-medium text-gray-500 hover:text-[#26215C] transition-colors mb-4"
      >
        <ArrowLeftIcon />
        Back
      </Link>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold tracking-widest text-[#EF9F27] mb-3">
          ABOUT VAULTLINE
        </p>
        <h1 className="text-3xl font-semibold mb-4 text-gray-900">
          What Vaultline actually checks — and how
        </h1>
        <p className="text-gray-600 leading-relaxed mb-16">
          Vaultline scans a repository — from GitHub, a git URL, or a plain
          `.zip` upload — for hardcoded secrets, vulnerable dependencies, and
          exposed internal endpoints. It runs entirely inside a locked-down,
          disposable container, so scanning your code never means giving up
          control of it.
        </p>

        {/* How it works */}
        <h2 className="text-lg font-semibold mb-6 text-gray-900">How it works</h2>
        <div className="flex flex-col gap-4 mb-16">
          <PipelineStep
            number="1"
            title="You point us at a repo"
            text="Sign in with GitHub, paste a git URL, or upload a .zip — any of the three works the same way from here on."
          />
          <PipelineStep
            number="2"
            title="It's cloned and locked down"
            text="The code is checked out into a container with no network access, a read-only filesystem, and hard memory/CPU limits — it can't reach the internet or touch anything outside itself."
          />
          <PipelineStep
            number="3"
            title="Five tools run inside that sandbox"
            text="Secret detection, dependency CVE scanning, and a custom check for hardcoded URLs all run in parallel, entirely offline."
          />
          <PipelineStep
            number="4"
            title="The container is destroyed"
            text="Once scanning finishes, only the findings — file paths, line numbers, severities — are saved. Your actual source code never touches our database, and the container itself is deleted immediately."
          />
        </div>

        {/* What we check */}
        <h2 className="text-lg font-semibold mb-6 text-gray-900">What gets checked</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-16">
          <CheckCard
            tool="gitleaks"
            text="Hardcoded secrets and credentials, including ones committed and later removed from history."
          />
          <CheckCard
            tool="Trivy"
            text="Known CVEs in your dependencies, plus a second independent pass for secrets and misconfigurations."
          />
          <CheckCard
            tool="npm audit / pip-audit"
            text="Vulnerable versions of your JavaScript and Python packages."
          />
          <CheckCard
            tool="Custom URL scanner"
            text="Hardcoded internal URLs, dev endpoints, and credentials embedded directly in links."
          />
        </div>

        {/* AI Fix Assistant */}
        <h2 className="text-lg font-semibold mb-3 text-gray-900">Beyond detection</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Every finding comes with two AI-generated explanations, so a report
          is useful to whoever's reading it — not just the person who wrote
          the code.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-16">
          <CheckCard
            tool="Suggested fix"
            text="A specific, actionable remediation for the developer — the exact config, dependency version, or code change to make, not generic advice."
          />
          <CheckCard
            tool="Plain-English summary"
            text="A jargon-free explanation of what's wrong and why it matters, written for a non-technical reviewer."
          />
        </div>

        {/* Privacy */}
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-8 mb-16">
          <h2 className="text-lg font-semibold mb-3 text-gray-900">
            What we do — and don&apos;t — keep
          </h2>
          <ul className="flex flex-col gap-2 text-sm text-gray-600">
            <li>✓ Findings (file, line, severity, description) are stored so you can review a report later.</li>
            <li>✓ Your GitHub access token stays in your signed-in session — never written to our database.</li>
            <li>✓ Unsaved reports are automatically deleted after 7 days. Save one explicitly to keep it longer.</li>
            <li>✗ Your source code is never stored. It's deleted the moment a scan finishes, success or failure.</li>
            <li>✗ Scans never phone home — the sandbox has no network access while tools are running.</li>
            <li>✗ Findings are pattern-redacted before an AI fix suggestion is generated, so secret-looking text isn&apos;t sent to a third party unmasked.</li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-block bg-[#3C3489] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#26215C] transition-colors"
          >
            Scan your first repo
          </Link>
        </div>
      </main>
    </div>
  );
}

function PipelineStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-[#3C3489] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
        {number}
      </div>
      <div>
        <p className="font-medium text-gray-900 mb-1">{title}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function CheckCard({ tool, text }: { tool: string; text: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-[#3C3489] mb-1">{tool}</p>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
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