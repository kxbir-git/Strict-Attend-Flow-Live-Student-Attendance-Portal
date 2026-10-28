import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { createSubjectSchema } from "@/lib/validations";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole(["ADMIN", "TEACHER"]);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");

  const where: any = {};
  if (classId) where.classId = classId;

  const subjects = await prisma.subject.findMany({
    where,
    include: {
      class: true,
      teacher: {
        include: { user: { select: { name: true, email: true } } },
      },
      _count: { select: { sessions: true } },
    },
    orderBy: { code: "asc" },
  });

  return NextResponse.json({ success: true, data: subjects });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const body = await req.json().catch(() => null);

  const parsed = createSubjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, code, classId, teacherId, totalPlannedLectures } = parsed.data;

  const existing = await prisma.subject.findUnique({
    where: {
      code_classId: { code, classId },
    },
  });

  if (existing) {
    return NextResponse.json(
      { success: false, error: `Subject code ${code} already exists for this class` },
      { status: 400 }
    );
  }

  const subject = await prisma.subject.create({
    data: {
      name,
      code,
      classId,
      teacherId: teacherId || null,
      totalPlannedLectures,
    },
    include: { class: true, teacher: { include: { user: true } } },
  });

  await logAuditEvent({
    userId: session!.user.id,
    role: "ADMIN",
    action: "SUBJECT_CREATE",
    entityType: "Subject",
    entityId: subject.id,
    after: subject,
    ip,
  });

  return NextResponse.json(
    { success: true, message: "Subject created successfully", data: subject },
    { status: 201 }
  );
}
