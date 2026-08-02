import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";

export async function GET() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { rating, text } = body;

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }
  if (typeof text !== "string" || text.trim().length < 5) {
    return NextResponse.json({ error: "Review text is too short" }, { status: 400 });
  }
  if (text.length > 500) {
    return NextResponse.json({ error: "Review text is too long (max 500 chars)" }, { status: 400 });
  }

  // Look up the user by their session email — auth() gives us the session
  // user, but Prisma's Review model needs a real User row id to link to.
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
  if (!user) {
    // Covers GitHub-only users who don't have a User row yet — see note below.
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: {
      userId: user.id,
      name: user.name || session.user.name || "Anonymous",
      rating,
      text: text.trim(),
    },
  });

  return NextResponse.json(review);
}