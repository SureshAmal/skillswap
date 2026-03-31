import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

// POST /api/reviews — Submit a review for a completed session
export async function POST(req: Request) {
  const session = await verifySession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { sessionId, rating, comment } = await req.json();

    if (!sessionId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "sessionId and rating (1-5) are required" },
        { status: 400 }
      );
    }

    // Verify the session exists, is COMPLETED, and the user participated
    const sessionRecord = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!sessionRecord) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (sessionRecord.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed sessions" },
        { status: 400 }
      );
    }

    if (
      sessionRecord.teacherId !== session.userId &&
      sessionRecord.learnerId !== session.userId
    ) {
      return NextResponse.json(
        { error: "You did not participate in this session" },
        { status: 403 }
      );
    }

    // Check for existing review
    const existing = await prisma.review.findUnique({
      where: {
        sessionId_reviewerId: {
          sessionId,
          reviewerId: session.userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this session" },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        sessionId,
        reviewerId: session.userId,
        rating: Math.round(rating),
        comment: comment?.trim() || null,
      },
    });

    return NextResponse.json({ review });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET /api/reviews?userId=xxx — Get all reviews for a specific user
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId param is required" },
      { status: 400 }
    );
  }

  // Get reviews where userId was either teacher or learner
  const reviews = await prisma.review.findMany({
    where: {
      session: {
        OR: [{ teacherId: userId }, { learnerId: userId }],
      },
      NOT: { reviewerId: userId }, // only reviews FROM others, not self
    },
    include: {
      reviewer: { select: { name: true, avatarUrl: true } },
      session: {
        select: {
          skill: { select: { name: true } },
          teacherId: true,
          learnerId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Calculate average rating
  const avg =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : 0;

  return NextResponse.json({
    reviews,
    averageRating: Math.round(avg * 10) / 10,
    totalReviews: reviews.length,
  });
}
