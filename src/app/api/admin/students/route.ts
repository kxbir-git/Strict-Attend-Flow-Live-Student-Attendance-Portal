import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");

  const where: any = {};
  if (classId) where.classId = classId;

  const students = await prisma.student.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
      class: { select: { id: true, name: true, section: true } },
      records: {
        select: { status: true },
      },
    },
    orderBy: { rollNo: "asc" },
  });

  const studentsWithStats = students.map((s) => {
    const total = s.records.length;
    const present = s.records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
    const percentage = total > 0 ? (present / total) * 100 : 100;

    return {
      id: s.id,
      userId: s.user.id,
      name: s.user.name,
      email: s.user.email,
      rollNo: s.rollNo,
      section: s.section,
      classId: s.class.id,
      className: s.class.name,
      totalLectures: total,
      attendedLectures: present,
      percentage: Number(percentage.toFixed(1)),
      isDefaulter: percentage < 75,
      createdAt: s.user.createdAt,
    };
  });

  return NextResponse.json({ success: true, data: studentsWithStats });
}
