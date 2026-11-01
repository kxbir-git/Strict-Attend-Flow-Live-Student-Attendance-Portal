import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

// PATCH: Admin assigns/changes teacher for a subject
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;
    const body = await req.json();
    const { teacherId } = body;

    // Verify subject exists
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    // If teacherId provided, verify teacher exists
    if (teacherId) {
      const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
      if (!teacher) {
        return NextResponse.json(
          { success: false, error: "Teacher not found" },
          { status: 404 }
        );
      }
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: { teacherId: teacherId || null },
      include: {
        teacher: { include: { user: { select: { name: true } } } },
        class: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: teacherId
        ? `Teacher assigned to ${updated.name}`
        : `Teacher unassigned from ${updated.name}`,
      data: updated,
    });
  } catch (err: any) {
    console.error("Subject PATCH error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update subject" },
      { status: 500 }
    );
  }
}

