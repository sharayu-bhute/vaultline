1.24/7/26
    src/prisma.ts — DB connection (via PrismaPg adapter)

2.25/7/26
    Docker + Redis running locally
    worker/ scaffolded (package.json, tsconfig.json, .env)
    src/queue.ts — BullMQ/Redis connection + job contract
    src/pipeline/clone.ts — clones repo to disk
    src/pipeline/docker.ts — spins up the locked-down container
    src/pipeline/normalize/*.ts (all 5 tools) + index.ts — raw JSON → Finding[]
    src/pipeline/runScan.ts — orchestrates the whole lifecycle
    src/index.ts — the actual worker process

3. 26/7/26
    worker/Dockerfile.scanner + worker/docker/entrypoint.sh — built the vaultline-scanner image (gitleaks, trivy, npm audit, pip-audit)
    Fixed sandbox issues: git "dubious ownership", HOME write permissions, trivy DB cache ownership
    Dropped semgrep from the pipeline (sandbox-incompatible RPC subprocess crash) — 4-tool pipeline now stable
    Manual end-to-end test of the scanner container — confirmed clean output for all 5 tool JSON files
    Fixed clone.ts typo (--n0-tags → --no-tags)
    Ran the full worker for the first time — queue → clone → docker → normalize → Postgres write, fully automated
    src/lib/prisma.ts (Next.js) — DB connection via PrismaPg adapter
    src/lib/queue.ts (Next.js) — BullMQ producer, mirrors worker's queue contract
    src/app/api/scans/route.ts — POST creates a Scan row + enqueues the job
    src/app/api/scans/[scanId]/route.ts — GET polls scan status + findings
    Verified full production path end-to-end via Postman: real API → real DB → real queue → real worker → real Docker scan → real findings write-back

4.28/7/26
    worked on:
        1. normal signin/login
        2. github sign in
        3. repo fetching
        4. history switch btn 