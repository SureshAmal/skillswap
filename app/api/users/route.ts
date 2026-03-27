import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { university: { contains: q } },
            { major: { contains: q } },
            { skills: { some: { skill: { name: { contains: q } } } } },
          ],
        }
      : {},
    select: {
      id: true,
      name: true,
      university: true,
      major: true,
      skills: {
        select: {
          type: true,
          skill: { select: { name: true, category: true } },
        },
      },
    },
    take: 30,
  });

  return NextResponse.json({ users });
}
