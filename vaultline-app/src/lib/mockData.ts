import { Repo, Scan, Finding, ScanStatus  } from "@/types";

export const mockRepo: Repo = {
  id: "repo_1",
  name: "vaultline",
  fullName: "sharayu/vaultline",
  private: true,
  language: "TypeScript",
  lastScanId: "scan_1",
};

export const mockFindings: Finding[] = [
  {
    id: "finding_1",
    scanId: "scan_1",
    tool: "gitleaks",
    severity: "critical",
    title: "Hardcoded AWS secret key",
    description: "An AWS secret access key was found committed in plaintext.",
    filePath: "src/config/aws.ts",
    lineNumber: 14,
    commitHash: "a1b2c3d",
    cveId: null,
    suggestedFix: "Rotate the key immediately, remove from history, move to .env and add to .gitignore.",
    ignored: false,
  },
  {
    id: "finding_2",
    scanId: "scan_1",
    tool: "npm_audit",
    severity: "high",
    title: "Vulnerable dependency: lodash",
    description: "Installed lodash version has a known prototype pollution vulnerability.",
    filePath: "package.json",
    lineNumber: null,
    commitHash: null,
    cveId: "CVE-2021-23337",
    suggestedFix: "Upgrade lodash to ^4.17.21.",
    ignored: false,
  },
  {
    id: "finding_3",
    scanId: "scan_1",
    tool: "semgrep",
    severity: "medium",
    title: "Potential SQL injection",
    description: "User input is concatenated directly into a SQL query string.",
    filePath: "src/services/userService.ts",
    lineNumber: 42,
    commitHash: null,
    cveId: null,
    suggestedFix: "Use parameterized queries via Prisma instead of raw string concatenation.",
    ignored: false,
  },
];

export const mockScan: Scan = {
  id: "scan_1",
  repoId: "repo_1",
  status: "completed",
  queuePosition: null,
  startedAt: "2026-07-24T09:00:00Z",
  completedAt: "2026-07-24T09:03:12Z",
  findings: mockFindings,
};

export const mockRepos: Repo[] = [
  mockRepo, // your existing "vaultline" repo, status: completed
  {
    id: "repo_2",
    name: "payments-api",
    fullName: "sharayu/payments-api",
    private: true,
    language: "Python",
    lastScanId: "scan_2",
  },
  {
    id: "repo_3",
    name: "landing-site",
    fullName: "sharayu/landing-site",
    private: false,
    language: "JavaScript",
    lastScanId: null, // never scanned
  },
];

export const mockScanStatusByRepoId: Record<string, ScanStatus> = {
  repo_1: "completed",
  repo_2: "scanning",
  // repo_3 intentionally has no entry — it's never been scanned
};

export const mockScans: Scan[] = [
  mockScan, 
  {
    id: "scan_2",
    repoId: "repo_2",
    status: "scanning",
    queuePosition: null,
    startedAt: "2026-07-24T10:00:00Z",
    completedAt: null,
    findings: [], // still running, no results yet
  },
];
