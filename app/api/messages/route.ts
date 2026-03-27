import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ messages: [] });

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      senderId: userId,
      receiverId: session.userId,
      read: false,
    },
    data: { read: true },
  });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.userId, receiverId: userId },
        { senderId: userId, receiverId: session.userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId, content } = await req.json();

  if (!receiverId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.userId,
      receiverId,
      content: content.trim(),
    },
  });

  return NextResponse.json({ message });
}

export async function DELETE(req: Request) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { messageId, otherUserId } = body;

  if (messageId) {
    // Delete single message created by this user
    await prisma.message.deleteMany({
      where: {
        id: messageId,
        senderId: session.userId,
      },
    });
    return NextResponse.json({ success: true });
  }

  if (otherUserId) {
    // Clear chat between this user and other user
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: session.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.userId },
        ],
      },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
