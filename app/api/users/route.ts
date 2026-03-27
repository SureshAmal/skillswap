import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "All";

  // Build the where clause
  const whereClause: any = {};
  
  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { university: { contains: q, mode: "insensitive" } },
      { major: { contains: q, mode: "insensitive" } },
      { skills: { some: { skill: { name: { contains: q, mode: "insensitive" } } } } },
    ];
  }

  if (category !== "All") {
    // We want users who have at least one skill in that category
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
