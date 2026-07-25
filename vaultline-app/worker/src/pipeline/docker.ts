import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface RunSandBoxedScanParams {
    repoDir : string;
    outputDir: string;
    scanId: string;
}

export async function runSandboxedScan({
    repoDir,
    outputDir,
    scanId,
}: RunSandBoxedScanParams): Promise<void> {
    const image = process.env.SCANNER_IMAGE || "vaultline-scanner: latest";
    const memory = process.env.CONTAINER_MEMORY || "1g";
    const cpus = process.env.CONTAINER_CUPS || "1";
    const timeoutMs = Number(process.env.CONTAINER_TIMEOUT_MS || 10*60*1000);
    const containerName = `vaultline-scan-${scanId}`;

    const args = [
        "run",
        "--rm",
        "--name", containerName,
        "--network", "none",
        "--cap-drop", "ALL",
        "--security-opt", "no-new-privileges",
        "--pids-limit", "512",
        "--read-only",
        "--tmpfs", "/tmp:rw,noexec,nosuid,size=512m",
        "--memory", memory,
        "--memory-swap", memory,
        "--cpus", cpus,
        "-v", `${repoDir}:/repo:ro`,
        "-v", `${outputDir}:/output:rw`,
        image,
    ];

    try{
        await execFileAsync("docker" , args, {
            timeout: timeoutMs,
            maxBuffer: 1024*1024*64,
        });
    } catch (err){
       await execFileAsync("docker", ["rm", "-f", containerName]).catch(() => {});
       throw new Error(
         `scan container failed or timed out: ${err instanceof Error ? err.message : String(err)}` 
       );
    }
}