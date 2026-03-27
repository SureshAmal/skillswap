import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      university: true,
      major: true,
      avatarUrl: true,
      credits: true,
      createdAt: true,
      skills: {
        include: { skill: true },
      },
      certificates: {
        include: { skill: true },
      },
      sessionsAsTeacher: {
        where: { status: "COMPLETED" },
        select: { id: true },
      },
      sessionsAsLearner: {
        where: { status: "COMPLETED" },
        select: { id: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      ...user,
      completedSessionsCount: user.sessionsAsTeacher.length + user.sessionsAsLearner.length,
    },
  });
}
