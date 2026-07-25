import { Worker } from "bullmq";
import { SCAN_QUEUE_NAME, createRedisconnection,type ScanJobData } from "./queue.js";
import { runScan } from "./pipeline/runScan.js"

const concurrency = Number(process.env.WORKER_CONCURRENCY || 2);

const worker = new Worker<ScanJobData>(
    SCAN_QUEUE_NAME,
    async (job) => {
        console.log(`[worker] starting scan ${ job.data.scanId } (${job.data.fullName})`);
        await runScan(job.data);
        console.log(`[worker] finished scan ${ job.data.scanId }`);
    },
    {
        connection: createRedisconnection(),
        concurrency,
    }
);

worker.on("error",(err)=>{
    console.error("[worker] internal error:",err);
});

console.log(`[worker] listening on queue "${SCAN_QUEUE_NAME}" with concurrency ${concurrency}`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    console.log(`[worker] received ${signal}, closing...`);
    await worker.close();
    process.exit(0);
  });
}