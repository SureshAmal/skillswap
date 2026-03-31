import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await verifySession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
  });

  const nextCursor = notifications.length === 20 ? notifications[19].id : null;

  return NextResponse.json({ notifications, nextCursor });
}
