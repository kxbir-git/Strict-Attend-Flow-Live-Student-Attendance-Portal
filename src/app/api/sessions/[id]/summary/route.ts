import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { formatSessionSummary } from "@/lib/csv";

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
        orderBy: { student: { rollNo: "asc" } },
      },
    },
  });

  if (!attendanceSession) {
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404 }
    );
  }

  const totalStudents = attendanceSession.records.length;
  const presentCount = attendanceSession.records.filter((r) => r.status === "PRESENT").length;
  const absentCount = attendanceSession.records.filter((r) => r.status === "ABSENT").length;
  const lateCount = attendanceSession.records.filter((r) => r.status === "LATE").length;
  const presentPercentage = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

  const absentees = attendanceSession.records
    .filter((r) => r.status === "ABSENT")
    .map((r) => ({
      name: r.student.user.name,
      rollNo: r.student.rollNo,
    }));

  const dateStr = attendanceSession.date.toISOString().split("T")[0];

  const summaryText = formatSessionSummary({
    subjectName: attendanceSession.subject.name,
    subjectCode: attendanceSession.subject.code,
    dateStr,
    periodNo: attendanceSession.periodNo,
    className: attendanceSession.class.name,
    room: "Classroom",
    timeSlot: `${attendanceSession.startTime} - ${attendanceSession.endTime}`,
    totalStudents,
    presentCount,
    absentCount,
    lateCount,
    presentPercentage,
    absentees,
  });

  const emailSubject = encodeURIComponent(
    `${attendanceSession.subject.code} Attendance – ${dateStr} – Period ${attendanceSession.periodNo}`
  );
  const emailBody = encodeURIComponent(summaryText);
  const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;

  return NextResponse.json({
    success: true,
    data: {
      summaryText,
      mailtoLink,
      stats: {
        totalStudents,
        presentCount,
        absentCount,
        lateCount,
        presentPercentage,
      },
      absentees,
    },
  });
}
