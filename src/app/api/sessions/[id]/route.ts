import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, errorResponse } = await requireRole([
    "TEACHER",
    "ADMIN",
    "STUDENT",
  ]);
  if (errorResponse) return errorResponse;

  const sessionId = params.id;
  const userRole = session!.user.role;

  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      class: true,
      subject: true,
      teacher: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
      records: {
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: {
          student: { rollNo: "asc" },
        },
      },
    },
  });

  if (!attendanceSession) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404 }
    );
  }

  // Teacher check: must be owner
  if (userRole === "TEACHER" && attendanceSession.teacherId !== session!.user.teacherId) {
    return NextResponse.json(
      { success: false, error: "Forbidden: You can only view your own sessions" },
      { status: 403 }
    );
  }

  // Student check: can only see session metadata & their own record (NEVER other students)
  if (userRole === "STUDENT") {
    const studentId = session!.user.studentId;
    if (attendanceSession.classId !== session!.user.classId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Not enrolled in this class" },
        { status: 403 }
      );
    }

    // Filter to ONLY own record
    const ownRecord = attendanceSession.records.find((r) => r.studentId === studentId);

    return NextResponse.json({
      success: true,
      data: {
        id: attendanceSession.id,
        date: attendanceSession.date,
        periodNo: attendanceSession.periodNo,
        startTime: attendanceSession.startTime,
        endTime: attendanceSession.endTime,
        status: attendanceSession.status,
        submittedAt: attendanceSession.submittedAt,
        class: attendanceSession.class,
        subject: attendanceSession.subject,
        teacher: attendanceSession.teacher,
        ownRecord: ownRecord || null,
      },
    });
  }

  // Admin and Teacher get full records
  return NextResponse.json({
    success: true,
    data: attendanceSession,
  });
}
