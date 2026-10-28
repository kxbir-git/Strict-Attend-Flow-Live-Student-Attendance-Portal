import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { createClassSchema } from "@/lib/validations";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  const { errorResponse } = await requireRole(["ADMIN", "TEACHER"]);
  if (errorResponse) return errorResponse;

  const classes = await prisma.class.findMany({
    include: {
      _count: {
        select: {
          students: true,
          subjects: true,
          sessions: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ success: true, data: classes });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const body = await req.json().catch(() => null);

  const parsed = createClassSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, section, department, semester } = parsed.data;

  const existing = await prisma.class.findUnique({
    where: {
      name_section: { name, section },
    },
  });

  if (existing) {
    return NextResponse.json(
      { success: false, error: `Class ${name} (Section ${section}) already exists` },
      { status: 400 }
    );
  }

  const newClass = await prisma.class.create({
    data: { name, section, department, semester },
  });

  await logAuditEvent({
    userId: session!.user.id,
    role: "ADMIN",
    action: "CLASS_CREATE",
    entityType: "Class",
    entityId: newClass.id,
    after: newClass,
    ip,
  });

  return NextResponse.json(
    { success: true, message: "Class created successfully", data: newClass },
    { status: 201 }
  );
}
