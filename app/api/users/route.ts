import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "All";

  const session = await verifySession();
  let userLearnSkills: string[] = [];

  if (session) {
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        skills: { where: { type: "LEARN" }, select: { skillId: true } },
      },
    });
    userLearnSkills = currentUser?.skills.map((s) => s.skillId) || [];
  }

  const whereClause: { OR?: object[]; AND?: object[] } = {};

  if (q) {
    whereClause.OR = [
      { name: { contains: q } },
      { university: { contains: q } },
      { major: { contains: q } },
      { skills: { some: { skill: { name: { contains: q } } } } },
    ];
  }

  if (category !== "All") {
    const catFilter = { skills: { some: { skill: { category } } } };
    if (whereClause.OR) {
      whereClause.AND = [catFilter];
    } else {
      Object.assign(whereClause, catFilter);
    }
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      university: true,
      major: true,
      avatarUrl: true,
      credits: true,
      skills: {
        select: {
          type: true,
          skill: { select: { id: true, name: true, category: true } },
        },
      },
    },
    take: 30,
  });

  const usersWithMatches = users.map((user) => {
    const teachSkills = user.skills.filter((s) => s.type === "TEACH");
    const matchingSkills = teachSkills.filter((ts) =>
      userLearnSkills.includes(ts.skill.id),
    );
    return {
      ...user,
      matchingSkills: matchingSkills.map((s) => s.skill.name),
    };
  });

  return NextResponse.json({ users: usersWithMatches });
}
