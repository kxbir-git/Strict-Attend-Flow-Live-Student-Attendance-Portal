import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { generateRotatingQrToken } from "@/lib/qr";

export async function GET(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["TEACHER", "ADMIN"]);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "sessionId required" },
      { status: 400 }
    );
  }

  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    select: { id: true, teacherId: true, status: true },
  });

  if (!attendanceSession) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404 }
    );
  }

  if (session!.user.role === "TEACHER" && attendanceSession.teacherId !== session!.user.teacherId) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Not your session" },
      { status: 403 }
    );
  }

  if (attendanceSession.status !== "OPEN") {
    return NextResponse.json(
      { success: false, error: "Session is not OPEN" },
      { status: 400 }
    );
  }

  const { token, code, expiresInSeconds } = generateRotatingQrToken(sessionId);

  // Update session with latest token/code for live reference
  await prisma.attendanceSession.update({
    where: { id: sessionId },
    data: { qrToken: token, qrCode: code },
  });

  return NextResponse.json({
    success: true,
    data: { token, code, expiresInSeconds },
  });
}
