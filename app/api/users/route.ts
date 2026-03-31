import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "All";
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const cursor = searchParams.get("cursor");

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
      { name: { contains: q, mode: "insensitive" } },
      { bio: { contains: q, mode: "insensitive" } },
      { university: { contains: q, mode: "insensitive" } },
      { major: { contains: q, mode: "insensitive" } },
      {
        skills: {
          some: { skill: { name: { contains: q, mode: "insensitive" } } },
        },
      },
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
    take: limit,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      bio: true,
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

  const nextCursor = users.length === limit ? users[users.length - 1].id : null;

  return NextResponse.json({ users: usersWithMatches, nextCursor });
}
