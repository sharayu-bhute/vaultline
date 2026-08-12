import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redactSecrets } from "@/lib/redact";
import { auth } from "../../../../../../auth";
import { GROQ_API_URL } from "@/lib/config";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ findingId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { findingId } = await params;
  const body = await req.json().catch(() => ({}));
  const force = body?.force === true;

  const finding = await prisma.finding.findUnique({
    where: { id: findingId },
    include: { scan: { include: { user: true } } },
  });
  if (!finding) {
    return NextResponse.json({ error: "Finding not found" }, { status: 404 });
  }
  if (finding.scan.user?.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (finding.plainSummary && !force) {
    return NextResponse.json({ plainSummary: finding.plainSummary });
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Rewrite this security finding for someone with no security background. 2-4 short sentences. No jargon, no code, no CVE IDs. Explain: what's wrong, why it matters, in plain everyday language.

Stick to the facts given below. If the description is thin (e.g. just a file path or a URL) and doesn't describe a specific mechanism, say plainly and briefly what was found — do NOT invent an attack scenario, impact, or mechanism that isn't stated.

Finding: ${finding.title}
Tool: ${finding.tool}
Severity: ${finding.severity}
Description: ${redactSecrets(finding.description)}`,
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const plainSummary =
      data.choices?.[0]?.message?.content?.trim() ?? "Unable to simplify this finding.";

    await prisma.finding.update({
      where: { id: findingId },
      data: { plainSummary },
    });

    return NextResponse.json({ plainSummary });
  } catch (err) {
    return NextResponse.json(
      { error: "Couldn't generate a simplified explanation. Try again later." },
      { status: 500 }
    );
  }
}