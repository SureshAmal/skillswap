import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ sessions });
}
