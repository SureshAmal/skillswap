import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      }
    });
  }

  return NextResponse.json({ userSkill });
}
