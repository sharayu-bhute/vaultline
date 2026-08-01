import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ findingId: string }> }
) {
  const { findingId } = await params;
  const body = await req.json().catch(() => ({}));
  const force = body?.force === true;

  const finding = await prisma.finding.findUnique({ where: { id: findingId } });
  if (!finding) {
    return NextResponse.json({ error: "Finding not found" }, { status: 404 });
  }

  if (finding.suggestedFix && !force) {
    return NextResponse.json({ suggestedFix: finding.suggestedFix });
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
            content: `You are a security engineer. Given this vulnerability finding, write a concise, actionable fix recommendation for a developer.

Rules:
- 2-5 sentences, or a short bullet list if there are multiple steps
- Be specific about what to change (config, code pattern, dependency version, etc.)
- No filler like "it is recommended that..." — just say what to do
- If a code fix is short (under 5 lines), include it in a markdown code block
- Do not repeat the vulnerability description back

File: ${finding.filePath}${finding.lineNumber ? `:${finding.lineNumber}` : ""}
Tool: ${finding.tool}

Finding:
${finding.description}`,
          },
        ],
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const suggestedFix =
      data.choices?.[0]?.message?.content?.trim() ?? "Unable to generate a fix suggestion.";

    await prisma.finding.update({
      where: { id: findingId },
      data: { suggestedFix },
    });

    return NextResponse.json({ suggestedFix });
  } catch (err) {
    return NextResponse.json(
      { error: "Couldn't generate a fix suggestion. Try again later." },
      { status: 500 }
    );
  }
}