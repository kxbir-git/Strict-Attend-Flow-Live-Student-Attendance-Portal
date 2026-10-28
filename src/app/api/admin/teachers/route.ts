import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export async function GET() {
  const { errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  const teachers = await prisma.teacher.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      subjects: { include: { class: true } },
      slots: { include: { class: true, subject: true } },
      _count: { select: { sessions: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return NextResponse.json({ success: true, data: teachers });
}
