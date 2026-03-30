import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const INITIAL_CREDITS = 3;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        credits: INITIAL_CREDITS,
      },
    });

    await createSession(user.id, user.email);

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
