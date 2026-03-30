import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.skill.findMany({
    select: { category: true },
    distinct: ["category"],
    where: { category: { not: "General" } },
  });

  const popularSkills = await prisma.skill.findMany({
    take: 20,
    orderBy: { users: { _count: "desc" } },
    select: { id: true, name: true, category: true },
  });

  return NextResponse.json({
    categories: ["All", ...categories.map((c) => c.category)],
    popularSkills,
  });
}

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, type, level, certificate } = await req.json();

  // Find or create the skill
  let skill = await prisma.skill.findFirst({ where: { name } });
  if (!skill) {
    skill = await prisma.skill.create({
      data: { name, category: "General" },
    });
  }

  // Create user-skill link
  const userSkill = await prisma.userSkill.create({
    data: {
      userId: session.userId,
      skillId: skill.id,
      type,
      level,
    },
    include: { skill: true },
  });

  if (certificate) {
    await prisma.certificate.create({
      data: {
        userId: session.userId,
        skillId: skill.id,
        title: certificate.title,
        issuer: certificate.issuer,
        verified: false,
        fileUrl: certificate.fileUrl || null,
      },
    });
  }

  return NextResponse.json({ userSkill });
}
