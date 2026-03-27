import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  if (!status || !["SCHEDULED", "COMPLETED", "CANCELLED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existingSession = await prisma.session.findUnique({ where: { id } });
  if (!existingSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Only the teacher can Accept (SCHEDULED) or Decline (CANCELLED) a PENDING request
  if ((status === "SCHEDULED" || status === "CANCELLED") && existingSession.teacherId !== session.userId) {
    return NextResponse.json({ error: "Only the instructor can accept or decline requests" }, { status: 403 });
  }

  // Both can mark as COMPLETED
  if (status === "COMPLETED" && existingSession.teacherId !== session.userId && existingSession.learnerId !== session.userId) {
    return NextResponse.json({ error: "Not authorized to complete this session" }, { status: 403 });
  }

  const updatedSession = await prisma.session.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ session: updatedSession });
}
