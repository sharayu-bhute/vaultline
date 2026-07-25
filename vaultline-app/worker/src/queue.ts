import { Queue, QueueEvents } from "bullmq";
import { Redis as IORedis } from "ioredis";

export const SCAN_QUEUE_NAME = "scan-queue";

export interface ScanJobData{
    scanId: string;
    repoId: string;
    fullName: string;
    cloneUrl: string;
    checkHistory: Boolean;
}

export function createRedisconnection(){
    const url = process.env.REDIS_URl;
    if(!url) throw new Error("REDIS_URL is not set");
    return new IORedis(url,{maxRetriesPerRequest:null});
}

export function getScanQueue(connection = createRedisconnection()){
    return new Queue<ScanJobData>(SCAN_QUEUE_NAME,{ connection});
}

export function getScanQueueEvents(connection = createRedisconnection()){
    return new QueueEvents(SCAN_QUEUE_NAME,{ connection });
}

