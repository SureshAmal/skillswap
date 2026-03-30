import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";

export async function GET() {
  const session = await verifySession();
  return NextResponse.json({ authenticated: !!session });
}
