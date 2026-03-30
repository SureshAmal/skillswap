import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await verifySession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [asTeacher, asLearner] = await Promise.all([
    prisma.session.findMany({
      where: { teacherId: session.userId },
      include: {
        skill: { select: { name: true } },
        teacher: { select: { name: true } },
        learner: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.session.findMany({
      where: { learnerId: session.userId },
      include: {
        skill: { select: { name: true } },
        teacher: { select: { name: true } },
        learner: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const sessions = [
    ...asTeacher.map((s) => ({ ...s, role: "teacher" as const })),
    ...asLearner.map((s) => ({ ...s, role: "learner" as const })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return NextResponse.json({ sessions });
}

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { teacherId, skillId, scheduledAt } = body;

    if (!teacherId || !skillId || !scheduledAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (teacherId === session.userId) {
      return NextResponse.json(
        { error: "Cannot book a session with yourself" },
        { status: 400 },
      );
    }

    // Verify teacher teaches this skill
    const teacherHasSkill = await prisma.userSkill.findFirst({
      where: { userId: teacherId, skillId: skillId, type: "TEACH" },
    });

    if (!teacherHasSkill) {
      return NextResponse.json(
        { error: "Instructor does not teach this skill" },
        { status: 400 },
      );
    }

    const newSession = await prisma.session.create({
      data: {
        learnerId: session.userId,
        teacherId,
        skillId,
        scheduledAt: new Date(scheduledAt),
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Session requested successfully",
      session: newSession,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
