import json
import os
import re
import sys

REPO = sys.argv[1] if len(sys.argv) > 1 else "/repo"
OUT = sys.argv[2] if len(sys.argv) > 2 else "/output/url-scan.json"

INCLUDE_EXT = {
    ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".go", ".rb", ".php",
    ".env", ".json", ".yml", ".yaml", ".xml", ".properties", ".txt", ".md",
    ".html", ".sh", ".conf", ".cfg", ".ini",
}
SKIP_DIRS = {
    ".git", "node_modules", "vendor", "dist", "build", ".next",
    "__pycache__", ".venv", "venv",
    ".agents", ".claude", ".windsurf", ".vscode", ".cursor", ".idea",
}
SKIP_FILES = {"package-lock.json", "yarn.lock", "pnpm-lock.yaml"}

URL_RE = re.compile(r"https?://[^\s\"'<>)\]}]+")
CRED_IN_URL_RE = re.compile(r"://[^/\s]+:[^/\s@]+@")  # user:pass@host
KEY_PARAM_RE = re.compile(r"[?&](api[_-]?key|token|secret|access[_-]?key)=[^&\s\"']+", re.I)
INTERNAL_HOST_RE = re.compile(
    r"://(localhost|127\.0\.0\.1|0\.0\.0\.0|"
    r"10\.\d+\.\d+\.\d+|"
    r"192\.168\.\d+\.\d+|"
    r"172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|"
    r"[\w.-]+\.(local|internal|corp))",
    re.I,
)

findings = []

for root, dirs, files in os.walk(REPO):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for fname in files:
        if fname in SKIP_FILES:
            continue
        ext = os.path.splitext(fname)[1]
        if ext not in INCLUDE_EXT:
            continue

        fpath = os.path.join(root, fname)
        rel_path = os.path.relpath(fpath, REPO)

        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                for line_no, line in enumerate(f, start=1):
                    for match in URL_RE.finditer(line):
                        url = match.group(0).rstrip(".,;:")

                        has_creds = bool(CRED_IN_URL_RE.search(url))
                        has_key_param = bool(KEY_PARAM_RE.search(url))
                        is_internal = bool(INTERNAL_HOST_RE.search(url))

                        if has_creds or has_key_param:
                            severity = "critical"
                        elif is_internal:
                            severity = "high"
                        else:
                            severity = "low"

                        findings.append({
                            "file": rel_path,
                            "line": line_no,
                            "url": url,
                            "severity": severity,
                            "reason": (
                                "Credentials embedded in URL" if has_creds else
                                "API key/token in URL query string" if has_key_param else
                                "Internal/private host exposed" if is_internal else
                                "Hardcoded URL found in source"
                            ),
                        })
        except (OSError, UnicodeDecodeError):
            continue 

with open(OUT, "w") as f:
    json.dump({"findings": findings}, f)