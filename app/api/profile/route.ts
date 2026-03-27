import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      university: true,
      major: true,
      credits: true,
      skills: {
        include: { skill: true },
      },
    },
  });

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, bio, university, major } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { name, bio, university, major },
  });

  return NextResponse.json({ user });
}
