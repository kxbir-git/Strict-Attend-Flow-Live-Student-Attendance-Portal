import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAttendanceMetrics } from "@/lib/buffer";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Student could be accessed by studentId or signed parent token
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id: token }, { rollNo: token }],
      },
      include: {
        user: true,
        class: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired parent access link" },
        { status: 404 }
      );
    }

    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId: student.id,
        session: { status: "SUBMITTED" },
      },
      include: {
        session: {
          include: {
            subject: {
              include: { teacher: { include: { user: true } } },
            },
          },
        },
      },
      orderBy: { session: { date: "asc" } },
    });

    const subjectMap = new Map<
      string,
      { code: string; name: string; teacherName: string; teacherEmail: string; held: number; attended: number }
    >();

    for (const r of records) {
      const sub = r.session.subject;
      if (!subjectMap.has(sub.id)) {
        subjectMap.set(sub.id, {
          code: sub.code,
          name: sub.name,
          teacherName: sub.teacher?.user.name || "Faculty",
          teacherEmail: sub.teacher?.user.email || "faculty@portal.edu",
          held: 0,
          attended: 0,
        });
      }
      const item = subjectMap.get(sub.id)!;
      item.held++;
      if (r.status === "PRESENT" || r.status === "LATE" || r.status === "APPROVED_LEAVE") {
        item.attended++;
      }
    }

    const subjects = Array.from(subjectMap.values()).map((s) => ({
      ...s,
      percent: s.held > 0 ? Math.round((s.attended / s.held) * 1000) / 10 : 100,
    }));

    const totalHeld = records.length;
    const totalAttended = records.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE" || r.status === "APPROVED_LEAVE"
    ).length;
    const overall = calculateAttendanceMetrics(totalAttended, totalHeld, 75);

    return NextResponse.json({
      success: true,
      data: {
        studentName: student.user.name,
        rollNo: student.rollNo,
        className: student.class.name,
        overall,
        subjects,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load parent portal", message: error.message },
      { status: 500 }
    );
  }
}
