import { Queue } from "bullmq";
import { Redis as IORedis } from "ioredis";

export const SCAN_QUEUE_NAME = "scan-queue";

export interface ScanJobData {
  scanId: string;
  repoId: string;
  fullName: string;
  cloneUrl: string;
  checkHistory: boolean;
}

let connection: IORedis | null = null;
let queue: Queue<ScanJobData> | null = null;

function getConnection() {
  if (!connection) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL is not set");
    connection = new IORedis(url, { maxRetriesPerRequest: null });
  }
  return connection;
}

export function getScanQueue() {
  if (!queue) {
    queue = new Queue<ScanJobData>(SCAN_QUEUE_NAME, { connection: getConnection() });
  }
  return queue;
}