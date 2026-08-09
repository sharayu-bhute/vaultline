import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../../auth";

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const SEVERITY_COLOR: Record<string, [number, number, number]> = {
  critical: [0.847, 0.353, 0.188], // #D85A30
  high: [0.937, 0.624, 0.153], // #EF9F27
  medium: [0.498, 0.467, 0.867], // #7F77DD
  low: [0.706, 0.698, 0.663], // #B4B2A9
};

// pdf-lib's built-in fonts only support WinAnsi — strip anything outside
// that range so unusual characters in scanned code don't crash generation.
function sanitize(text: string): string {
  return text.replace(/[^\x00-\xFF]/g, "?");
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of sanitize(text).split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { scanId } = await params;

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { findings: true, repo: true, user: true },
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found" }, { status: 404 });
  }
  if (scan.user?.email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdfDoc.embedFont(StandardFonts.Courier);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function newPage() {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  function ensureSpace(height: number) {
    if (y - height < MARGIN) newPage();
  }

  function drawLine(
    text: string,
    { font = regular, size = 10, color = rgb(0.1, 0.1, 0.1), gap = 4 }: Partial<{
      font: PDFFont;
      size: number;
      color: ReturnType<typeof rgb>;
      gap: number;
    }> = {}
  ) {
    ensureSpace(size + gap);
    page.drawText(sanitize(text), { x: MARGIN, y: y - size, size, font, color });
    y -= size + gap;
  }

  function drawWrapped(
    text: string,
    { font = regular, size = 9.5, color = rgb(0.2, 0.2, 0.2), gap = 3, lineGap = 2 }: Partial<{
      font: PDFFont;
      size: number;
      color: ReturnType<typeof rgb>;
      gap: number;
      lineGap: number;
    }> = {}
  ) {
    const lines = wrapText(text, font, size, CONTENT_WIDTH);
    for (const line of lines) {
      ensureSpace(size + lineGap);
      page.drawText(line, { x: MARGIN, y: y - size, size, font, color });
      y -= size + lineGap;
    }
    y -= gap;
  }

  // Header
  drawLine("Vaultline Security Report", { font: bold, size: 18, gap: 6 });
  drawLine(scan.repo.fullName, { font: bold, size: 13, color: rgb(0.15, 0.13, 0.36), gap: 4 });
  drawLine(
    `Scan status: ${scan.status}  •  ${scan.findings.length} finding(s)  •  Generated ${new Date().toLocaleDateString()}`,
    { size: 9, color: rgb(0.45, 0.45, 0.45), gap: 12 }
  );

  const counts = { critical: 0, high: 0, medium: 0, low: 0 } as Record<string, number>;
  for (const f of scan.findings) counts[f.severity] = (counts[f.severity] ?? 0) + 1;
  drawLine(
    `Critical ${counts.critical}   High ${counts.high}   Medium ${counts.medium}   Low ${counts.low}`,
    { font: bold, size: 10, gap: 16 }
  );

  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedFindings = [...scan.findings].sort((a, b) => order[a.severity] - order[b.severity]);

  for (const finding of sortedFindings) {
    ensureSpace(60); // keep a finding's header from being orphaned at page bottom

    const [r, g, b] = SEVERITY_COLOR[finding.severity] ?? [0.4, 0.4, 0.4];
    drawLine(`${finding.title}  [${finding.severity.toUpperCase()}]`, {
      font: bold,
      size: 11.5,
      color: rgb(r, g, b),
      gap: 3,
    });

    const loc = `${finding.filePath}${finding.lineNumber !== null ? `:${finding.lineNumber}` : ""}`;
    drawLine(loc, { font: mono, size: 8.5, color: rgb(0.4, 0.4, 0.4), gap: 2 });
    drawLine(
      `Tool: ${finding.tool}${finding.cveId ? `  •  ${finding.cveId}` : ""}`,
      { size: 8.5, color: rgb(0.55, 0.55, 0.55), gap: 6 }
    );

    drawWrapped(finding.plainSummary || finding.description, { gap: 6 });

    if (finding.suggestedFix) {
      drawLine("Suggested fix:", { font: bold, size: 9.5, color: rgb(0.15, 0.13, 0.36), gap: 2 });
      drawWrapped(finding.suggestedFix, { gap: 10 });
    } else {
      y -= 6;
    }
  }

  const pdfBytes = await pdfDoc.save();
  const filename = `${scan.repo.fullName.replace(/[^a-z0-9-_]/gi, "-")}-report.pdf`;

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(pdfBytes.length),
    },
  });
}