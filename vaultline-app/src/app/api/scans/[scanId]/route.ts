import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"

export async function GET(
    _req: NextRequest,
    {params}: {params: Promise<{ scanId: string}>}
) {
    const { scanId } = await params ;
    const scan = await prisma.scan.findUnique({
        where:{id:scanId},
        include:{findings:true},
    });

    if (!scan){
        return NextResponse.json({error: " Scan not found"},{status: 404});
    }

    return NextResponse.json(scan);
}