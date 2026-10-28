import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { generateSessionCsv, AttendanceRecordCsvRow } from "@/lib/csv";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, errorResponse } = await requireRole(["TEACHER", "ADMIN"]);
  if (errorResponse) return errorResponse;

  const sessionId = params.id;

  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      class: true,
      subject: true,
      records: {
        include: {
          student: {
            include: {
              user: { select: { name: true } },
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

  // Teacher ownership check
  if (session!.user.role === "TEACHER" && attendanceSession.teacherId !== session!.user.teacherId) {
    return NextResponse.json(
      { success: false, error: "Forbidden: You can only export your own sessions" },
      { status: 403 }
    );
  }

  // Requirement: Only SUBMITTED sessions exportable
  if (attendanceSession.status !== "SUBMITTED") {
    return NextResponse.json(
      {
        success: false,
        error: "Only SUBMITTED sessions can be exported to CSV. Please finalize the attendance first.",
      },
      { status: 400 }
    );
  }

  const dateStr = attendanceSession.date.toISOString().split("T")[0];
  const timeSlot = `${attendanceSession.startTime} - ${attendanceSession.endTime}`;

  const rows: AttendanceRecordCsvRow[] = attendanceSession.records.map((r) => ({
    rollNo: r.student.rollNo,
    studentName: r.student.user.name,
    className: attendanceSession.class.name,
    subjectCode: attendanceSession.subject.code,
    subjectName: attendanceSession.subject.name,
    periodNo: attendanceSession.periodNo,
    date: dateStr,
    timeSlot,
    status: r.status as "PRESENT" | "ABSENT" | "LATE",
    markedAt: r.markedAt ? r.markedAt.toISOString() : "",
  }));

  const csvContent = generateSessionCsv(rows);
  const cleanSubjectCode = attendanceSession.subject.code.replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `Attendance_${cleanSubjectCode}_${dateStr}_P${attendanceSession.periodNo}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
