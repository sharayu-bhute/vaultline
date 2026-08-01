import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ findingId: string }> }
) {
  const { findingId } = await params;

  const finding = await prisma.finding.findUnique({ where: { id: findingId } });
  if (!finding) {
    return NextResponse.json({ error: "Finding not found" }, { status: 404 });
  }

  if (finding.plainSummary) {
    return NextResponse.json({ plainSummary: finding.plainSummary });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
            content: `Rewrite this security finding for someone with no security background. 2-4 short sentences. No jargon, no code, no CVE IDs. Explain: what's wrong, why it matters, in plain everyday language.\n\n${finding.description}`,
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