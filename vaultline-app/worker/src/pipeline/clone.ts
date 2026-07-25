import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm , mkdir } from "node:fs/promises";
import path from "node:path";

const execFileAsync = promisify(execFile);

export interface CloneResult{
    repoDir: string;
    outputDir: string;
    cleanup: () => Promise<void>;
}

export async function cloneRepo(params:{
    cloneUrl: string;
    scanId: string;
    checkHistory: Boolean;
}) : Promise<CloneResult>{
    const workDir = process.env.WORK_DIR || "C:/vaultline-work";
    await mkdir(workDir,{ recursive: true});
    const base = await mkdtemp(path.join(workDir,`scan-${params.scanId}-`));
    const repoDir = path.join(base,"repo");
    const outputDir = path.join(base,"output");
    await mkdir(repoDir,{recursive:true});
    await mkdir(outputDir,{recursive:true});

    const args=["clone", "--n0-tags", "--single-branch"];
    if (!params.checkHistory) args.push("--depth","1");
    args.push(params.cloneUrl,repoDir);

    try{
        await execFileAsync("git", args, {timeout: 5*60* 1000});
    } catch (err) {
        await rm(base , { recursive: true, force: true});
        throw new Error(
            `git clone failed (private repo without access, or repo doesn't exist): ${
                err instanceof Error ? err.message : String(err)
            }`
        );
    }
    return{
        repoDir,
        outputDir,
        cleanup: () => rm(base, {recursive:true,force:true}),
    };
} 