import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["TEACHER", "ADMIN"]);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED, or all

    const whereClause: any = {};
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      whereClause.status = status;
    }

    // If teacher, only retrieve leaves for students in their assigned classes
    if (auth.session!.user.role === "TEACHER") {
      const teacherId = auth.session!.user.teacherId;
      if (teacherId) {
        const teacherSubjects = await prisma.subject.findMany({
          where: { teacherId },
          select: { classId: true },
        });
        const classIds = Array.from(new Set(teacherSubjects.map((s) => s.classId)));
        whereClause.student = {
          classId: { in: classIds },
        };
      }
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            class: { select: { name: true, section: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: leaves,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to list leave requests", message: error.message },
      { status: 500 }
    );
  }
}
