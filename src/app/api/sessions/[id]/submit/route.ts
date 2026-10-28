import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, errorResponse } = await requireRole(["TEACHER"]);
  if (errorResponse) return errorResponse;

  const sessionId = params.id;
  const teacherId = session!.user.teacherId;
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      records: true,
      class: true,
      subject: true,
    },
  });

  if (!attendanceSession) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404 }
    );
  }

  // Teacher ownership check
  if (attendanceSession.teacherId !== teacherId) {
    return NextResponse.json(
      { success: false, error: "Forbidden: You can only submit your own attendance sessions" },
      { status: 403 }
    );
  }

  // If already submitted -> return 409
  if (attendanceSession.status === "SUBMITTED") {
    return NextResponse.json(
      {
        success: false,
        error: "This attendance is already submitted and cannot be changed",
        submittedAt: attendanceSession.submittedAt,
      },
      { status: 409 }
    );
  }

  // Count stats
  const total = attendanceSession.records.length;
  const present = attendanceSession.records.filter((r) => r.status === "PRESENT").length;
  const absent = attendanceSession.records.filter((r) => r.status === "ABSENT").length;
  const late = attendanceSession.records.filter((r) => r.status === "LATE").length;

  const submitted = await prisma.attendanceSession.update({
    where: { id: sessionId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  await logAuditEvent({
    userId: session!.user.id,
    role: session!.user.role,
    action: "ATTENDANCE_SESSION_SUBMIT",
    entityType: "AttendanceSession",
    entityId: sessionId,
    after: {
      status: "SUBMITTED",
      submittedAt: submitted.submittedAt,
      total,
      present,
      absent,
      late,
      percentage: total > 0 ? ((present + late) / total) * 100 : 0,
    },
    ip,
  });

  return NextResponse.json({
    success: true,
    message: "Attendance submitted successfully and locked permanently.",
    data: submitted,
    stats: { total, present, absent, late },
  });
}
