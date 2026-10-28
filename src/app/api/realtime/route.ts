import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Realtime session status endpoint
 * Returns current live attendance count and marked students for an active session.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ success: false, error: "sessionId is required" }, { status: 400 });
  }

  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      qrCode: true,
      records: {
        select: {
          id: true,
          status: true,
          markedBy: true,
          markedAt: true,
          student: {
            select: {
              rollNo: true,
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!session) {
    return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
  }

  const total = session.records.length;
  const present = session.records.filter((r) => r.status === "PRESENT").length;
  const late = session.records.filter((r) => r.status === "LATE").length;
  const absent = session.records.filter((r) => r.status === "ABSENT").length;

  const recentPresent = session.records
    .filter((r) => r.status === "PRESENT" && r.markedAt)
    .sort((a, b) => new Date(b.markedAt!).getTime() - new Date(a.markedAt!).getTime())
    .slice(0, 5)
    .map((r) => ({
      name: r.student.user.name,
      rollNo: r.student.rollNo,
      markedBy: r.markedBy,
      markedAt: r.markedAt,
    }));

  return NextResponse.json({
    success: true,
    data: {
      sessionId: session.id,
      status: session.status,
      stats: { total, present, late, absent },
      recentPresent,
    },
  });
}
