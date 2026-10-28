import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { updateRecordsSchema } from "@/lib/validations";
import { logAuditEvent } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, errorResponse } = await requireRole(["TEACHER", "ADMIN"]);
  if (errorResponse) return errorResponse;

  const sessionId = params.id;
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  // Check session state
  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      teacherId: true,
      status: true,
      classId: true,
      date: true,
      periodNo: true,
    },
  });

  if (!attendanceSession) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404 }
    );
  }

  // Teacher ownership check
  if (session!.user.role === "TEACHER" && attendanceSession.teacherId !== session!.user.teacherId) {
    return NextResponse.json(
      { success: false, error: "Forbidden: You can only mark attendance for your own sessions" },
      { status: 403 }
    );
  }

  // CRITICAL IRREVERSIBLE LOCK:
  // If session is SUBMITTED, strictly block modification for ALL roles including ADMIN
  if (attendanceSession.status === "SUBMITTED") {
    return NextResponse.json(
      {
        success: false,
        error: "This attendance is already submitted and cannot be changed",
        message: "Attendance records are permanently locked upon submission. No modifications allowed.",
      },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = updateRecordsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { records } = parsed.data;

  // Update records in transaction
  await prisma.$transaction(
    records.map((rec) =>
      prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId,
            studentId: rec.studentId,
          },
        },
        update: {
          status: rec.status,
          markedBy: "TEACHER",
          markedAt: new Date(),
        },
        create: {
          sessionId,
          studentId: rec.studentId,
          status: rec.status,
          markedBy: "TEACHER",
          markedAt: new Date(),
        },
      })
    )
  );

  await logAuditEvent({
    userId: session!.user.id,
    role: session!.user.role,
    action: "ATTENDANCE_RECORDS_UPDATED",
    entityType: "AttendanceRecord",
    entityId: sessionId,
    after: { updatedCount: records.length },
    ip,
  });

  return NextResponse.json({
    success: true,
    message: `Updated ${records.length} attendance records`,
  });
}
