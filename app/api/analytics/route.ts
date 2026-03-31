import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await verifySession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.userId;

  // Fetch all user data in parallel
  const [user, teachSessions, learnSessions, allSessions, unreadMessages] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, credits: true, createdAt: true },
      }),
      prisma.session.findMany({
        where: { teacherId: userId },
        include: {
          skill: { select: { name: true } },
          learner: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.session.findMany({
        where: { learnerId: userId },
        include: {
          skill: { select: { name: true } },
          teacher: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.session.findMany({
        where: {
          OR: [{ teacherId: userId }, { learnerId: userId }],
        },
        select: { status: true, createdAt: true, teacherId: true, learnerId: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.message.count({
        where: { receiverId: userId, read: false },
      }),
    ]);

  // Stats
  const completedTeach = teachSessions.filter(
    (s) => s.status === "COMPLETED"
  ).length;
  const completedLearn = learnSessions.filter(
    (s) => s.status === "COMPLETED"
  ).length;
  const totalCompleted = completedTeach + completedLearn;
  const pendingCount = allSessions.filter((s) => s.status === "PENDING").length;
  const scheduledCount = allSessions.filter(
    (s) => s.status === "SCHEDULED"
  ).length;

  // Upcoming sessions (SCHEDULED, future date)
  const now = new Date();
  const upcoming = [
    ...teachSessions
      .filter(
        (s) => s.status === "SCHEDULED" && s.scheduledAt && new Date(s.scheduledAt) > now
      )
      .map((s) => ({
        id: s.id,
        skill: s.skill.name,
        with: s.learner.name,
        role: "teacher" as const,
        scheduledAt: s.scheduledAt!,
      })),
    ...learnSessions
      .filter(
        (s) => s.status === "SCHEDULED" && s.scheduledAt && new Date(s.scheduledAt) > now
      )
      .map((s) => ({
        id: s.id,
        skill: s.skill.name,
        with: s.teacher.name,
        role: "learner" as const,
        scheduledAt: s.scheduledAt!,
      })),
  ].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  // Credit history simulation from session data
  // Build a timeline of credit events
  const creditTimeline: { date: string; earned: number; spent: number }[] = [];
  const monthMap = new Map<string, { earned: number; spent: number }>();

  allSessions
    .filter((s) => s.status === "COMPLETED")
    .forEach((s) => {
      const month = new Date(s.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      const entry = monthMap.get(month) || { earned: 0, spent: 0 };
      if (s.teacherId === userId) {
        entry.earned += 1;
      } else {
        entry.spent += 1;
      }
      monthMap.set(month, entry);
    });

  monthMap.forEach((value, key) => {
    creditTimeline.push({ date: key, ...value });
  });

  // Gamification badges
  const badges: { name: string; icon: string; description: string }[] = [];

  if (completedTeach >= 5) {
    badges.push({
      name: "Top Mentor",
      icon: "🏆",
      description: "Completed 5+ teaching sessions",
    });
  }
  if (completedLearn >= 5) {
    badges.push({
      name: "Avid Learner",
      icon: "📚",
      description: "Completed 5+ learning sessions",
    });
  }
  if (totalCompleted >= 10) {
    badges.push({
      name: "Skill Master",
      icon: "⭐",
      description: "10+ completed sessions total",
    });
  }
  if (completedTeach >= 1 && completedLearn >= 1) {
    badges.push({
      name: "Two-Way Swapper",
      icon: "🔄",
      description: "Both taught and learned",
    });
  }
  if (totalCompleted === 0 && allSessions.length > 0) {
    badges.push({
      name: "Newcomer",
      icon: "🌱",
      description: "Just getting started",
    });
  }
  if (totalCompleted === 0 && allSessions.length === 0) {
    badges.push({
      name: "Explorer",
      icon: "🧭",
      description: "Ready to start swapping skills",
    });
  }

  return NextResponse.json({
    user,
    stats: {
      totalCompleted,
      completedTeach,
      completedLearn,
      pendingCount,
      scheduledCount,
      unreadMessages,
      credits: user?.credits || 0,
    },
    upcoming: upcoming.slice(0, 5),
    creditTimeline,
    badges,
  });
}
