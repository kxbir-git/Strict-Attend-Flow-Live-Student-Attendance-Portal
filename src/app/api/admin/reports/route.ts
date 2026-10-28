import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { escapeCsvField } from "@/lib/csv";

export async function GET(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["ADMIN", "TEACHER"]);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");
  const subjectId = url.searchParams.get("subjectId");
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const format = url.searchParams.get("format"); // "csv" | "json"

  const where: any = {};
  if (classId) where.classId = classId;
  if (subjectId) where.subjectId = subjectId;
  if (session!.user.role === "TEACHER") {
    where.teacherId = session!.user.teacherId;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate);
    if (endDate) where.date.lte = new Date(endDate);
  }

  const sessions = await prisma.attendanceSession.findMany({
    where,
    include: {
      class: true,
      subject: true,
      teacher: { include: { user: { select: { name: true } } } },
      records: {
        include: {
          student: {
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // If CSV export is requested
  if (format === "csv") {
    const BOM = "\uFEFF";
    const headers = [
      "Session ID",
      "Date",
      "Period",
      "Class",
      "Subject Code",
      "Subject Name",
      "Teacher Name",
      "Roll No",
      "Student Name",
      "Status",
      "Marked At",
    ];

    const lines: string[] = [headers.map(escapeCsvField).join(",")];

    for (const sess of sessions) {
      const dateStr = sess.date.toISOString().split("T")[0];
      for (const rec of sess.records) {
        lines.push(
          [
            sess.id,
            dateStr,
            sess.periodNo,
            sess.class.name,
            sess.subject.code,
            sess.subject.name,
            sess.teacher.user.name,
            rec.student.rollNo,
            rec.student.user.name,
            rec.status,
            rec.markedAt ? rec.markedAt.toISOString() : "",
          ]
            .map(escapeCsvField)
            .join(",")
        );
      }
    }

    const csvContent = BOM + lines.join("\r\n");
    const filename = `AttendanceReport_${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // Aggregate stats
  let totalSessions = sessions.length;
  let totalRecords = 0;
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;

  const classMap: Record<string, { name: string; sessions: number; present: number; total: number }> = {};
  const dailyMap: Record<string, { date: string; present: number; total: number }> = {};

  for (const sess of sessions) {
    const cName = sess.class.name;
    if (!classMap[cName]) {
      classMap[cName] = { name: cName, sessions: 0, present: 0, total: 0 };
    }
    classMap[cName].sessions += 1;

    const dateStr = sess.date.toISOString().split("T")[0];
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = { date: dateStr, present: 0, total: 0 };
    }

    for (const r of sess.records) {
      totalRecords += 1;
      dailyMap[dateStr].total += 1;
      classMap[cName].total += 1;

      if (r.status === "PRESENT") {
        totalPresent += 1;
        dailyMap[dateStr].present += 1;
        classMap[cName].present += 1;
      } else if (r.status === "LATE") {
        totalLate += 1;
        totalPresent += 1;
        dailyMap[dateStr].present += 1;
        classMap[cName].present += 1;
      } else {
        totalAbsent += 1;
      }
    }
  }

  const overallPercentage = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 100;

  const classComparison = Object.values(classMap).map((c) => ({
    className: c.name,
    sessionsCount: c.sessions,
    totalRecords: c.total,
    presentRecords: c.present,
    attendanceRate: c.total > 0 ? Number(((c.present / c.total) * 100).toFixed(1)) : 100,
  }));

  const trendData = Object.values(dailyMap).map((d) => ({
    date: d.date,
    rate: d.total > 0 ? Number(((d.present / d.total) * 100).toFixed(1)) : 100,
    present: d.present,
    total: d.total,
  }));

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        totalSessions,
        totalRecords,
        totalPresent,
        totalAbsent,
        totalLate,
        overallPercentage: Number(overallPercentage.toFixed(1)),
      },
      classComparison,
      trendData,
    },
  });
}
