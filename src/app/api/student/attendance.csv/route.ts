import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { generateSessionCsv, AttendanceRecordCsvRow } from "@/lib/csv";

export async function GET(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["STUDENT"]);
  if (errorResponse) return errorResponse;

  const studentId = session!.user.studentId;
  if (!studentId) {
    return NextResponse.json(
      { success: false, error: "Student profile not found" },
      { status: 400 }
    );
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: { select: { name: true } },
      class: { select: { name: true } },
    },
  });

  if (!student) {
    return NextResponse.json(
      { success: false, error: "Student not found" },
      { status: 404 }
    );
  }

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId },
    include: {
      session: {
        include: {
          subject: true,
          class: true,
        },
      },
    },
    orderBy: {
      session: { date: "desc" },
    },
  });

  const rows: AttendanceRecordCsvRow[] = records.map((r) => {
    const dateStr = r.session.date.toISOString().split("T")[0];
    const timeSlot = `${r.session.startTime} - ${r.session.endTime}`;

    return {
      rollNo: student.rollNo,
      studentName: student.user.name,
      className: student.class.name,
      subjectCode: r.session.subject.code,
      subjectName: r.session.subject.name,
      periodNo: r.session.periodNo,
      date: dateStr,
      timeSlot,
      status: r.status as "PRESENT" | "ABSENT" | "LATE",
      markedAt: r.markedAt ? r.markedAt.toISOString() : "",
    };
  });

  const csvContent = generateSessionCsv(rows);
  const cleanRoll = student.rollNo.replace(/[^a-zA-Z0-9_-]/g, "");
  const filename = `MyAttendance_${cleanRoll}_${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
