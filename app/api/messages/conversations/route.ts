import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await verifySession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get distinct users the current user has messaged with
  const sent = await prisma.message.findMany({
    where: { senderId: session.userId },
    select: { receiverId: true },
    distinct: ["receiverId"],
  });

  const received = await prisma.message.findMany({
    where: { receiverId: session.userId },
    select: { senderId: true },
    distinct: ["senderId"],
  });

  const userIds = [
    ...new Set([
      ...sent.map((m) => m.receiverId),
      ...received.map((m) => m.senderId),
    ]),
  ];

  const conversations = await Promise.all(
    userIds.map(async (userId) => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, avatarUrl: true },
      });

      const lastMsg = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: session.userId, receiverId: userId },
            { senderId: userId, receiverId: session.userId },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      const unread = await prisma.message.count({
        where: {
          senderId: userId,
          receiverId: session.userId,
          read: false,
        },
      });

      return {
        userId,
        name: user?.name ?? "Unknown",
        avatarUrl: user?.avatarUrl ?? null,
        lastMessage: lastMsg?.content ?? "",
        unread,
      };
    }),
  );

  return NextResponse.json({ currentUserId: session.userId, conversations });
}
