import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getScanQueue } from "@/lib/queue";

interface TriggerScanBody {
    repoId: string;
    fullName: string;
    checkHistory?: boolean;
    accessToken: string;
}

export async function POST(req: NextRequest){
    let body: TriggerScanBody;
    try{ body = await req.json();

    } catch {
        return NextResponse.json({error: "INvalid Jon body" }, {status: 400 });
    }
    if (!body.repoId || !body.fullName || !body.accessToken ){
        return NextResponse.json (
            { error :" repoId, fullName, and accessToken are requires" },
            {status: 400}
        );
    }

    const repo = await prisma.repo.findUnique({ where: { id: body.repoId }});
    if (!repo) {
        return NextResponse.json( { error : "Repo not found"},{status: 404});
    }

    const scan = await prisma.scan.create({
        data: { repoId: repo.id, status: "queued"},
    });

    const queue = getScanQueue();
    const cloneUrl = `https://x-access-token:${body.accessToken}@github.com/${body.fullName}.git`;

    const job = await queue.add(
        "scan",
        {
            scanId : scan.id,
            repoId : repo.id,
            fullName : body.fullName,
            cloneUrl,
            checkHistory: body.checkHistory ?? true,
        },
        { removeOnComplete: 500, removeOnFail: 500}
    );

    const waitingCount = await queue.getWaitingCount();
    await prisma.scan.update({
        where:{id:scan.id},
        data:{queuePosition:waitingCount},
    });

    return NextResponse.json({scanId: scan.id , jobId: job.id, queuePosition: waitingCount});
}