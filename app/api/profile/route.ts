import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await verifySession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      university: true,
      major: true,
      avatarUrl: true,
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
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    name,
    bio,
    university,
    major,
    avatarUrl,
    currentPassword,
    newPassword,
  } = await req.json();

  if (currentPassword && newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { name, bio, university, major, avatarUrl },
  });

  return NextResponse.json({ user });
}
