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
