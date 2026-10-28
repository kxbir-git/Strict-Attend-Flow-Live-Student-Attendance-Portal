import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const thresholdParam = url.searchParams.get("threshold");
  const classId = url.searchParams.get("classId");
  const threshold = thresholdParam ? parseFloat(thresholdParam) : 75.0;

  const where: any = {};
  if (classId) where.classId = classId;

  const students = await prisma.student.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      class: true,
      records: {
        include: {
          session: {
            include: { subject: true },
          },
        },
      },
    },
    orderBy: { rollNo: "asc" },
  });

  const defaulters: any[] = [];

  for (const s of students) {
    const total = s.records.length;
    const present = s.records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    const percentage = total > 0 ? (present / total) * 100 : 100;

    if (percentage < threshold) {
      // Find which subjects they are deficient in
      const subjectMap: Record<string, { name: string; total: number; attended: number; pct: number }> = {};
      for (const rec of s.records) {
        const sub = rec.session.subject;
        if (!subjectMap[sub.code]) {
          subjectMap[sub.code] = { name: sub.name, total: 0, attended: 0, pct: 0 };
        }
        subjectMap[sub.code].total += 1;
        if (rec.status === "PRESENT" || rec.status === "LATE") {
          subjectMap[sub.code].attended += 1;
        }
      }

      const subjectBreakdown = Object.entries(subjectMap).map(([code, data]) => ({
        code,
        name: data.name,
        total: data.total,
        attended: data.attended,
        pct: data.total > 0 ? Number(((data.attended / data.total) * 100).toFixed(1)) : 100,
      }));

      defaulters.push({
        studentId: s.id,
        name: s.user.name,
        email: s.user.email,
        rollNo: s.rollNo,
        className: s.class.name,
        totalLectures: total,
        attendedLectures: present,
        absentLectures: total - present,
        percentage: Number(percentage.toFixed(1)),
        threshold,
        shortageCount: Math.ceil((threshold * total) / 100) - present,
        subjectBreakdown,
      });
    }
  }

  // Sort by lowest percentage first
  defaulters.sort((a, b) => a.percentage - b.percentage);

  return NextResponse.json({
    success: true,
    data: {
      threshold,
      totalStudentsEvaluated: students.length,
      defaulterCount: defaulters.length,
      defaulters,
    },
  });
}
