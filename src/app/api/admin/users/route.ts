import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { createUserSchema, updateUserSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const role = url.searchParams.get("role");

  const where: any = {};
  if (role) where.role = role;

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      student: {
        include: { class: true },
      },
      teacher: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: users });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const body = await req.json().catch(() => null);

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, password, role, rollNo, classId, section, employeeId, department } =
    parsed.data;

  // Check unique email
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existing) {
    return NextResponse.json(
      { success: false, error: "A user with this email already exists" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const createdUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
      },
    });

    if (role === "STUDENT") {
      if (!rollNo || !classId) {
        throw new Error("Roll number and Class are required for students");
      }
      await tx.student.create({
        data: {
          userId: user.id,
          rollNo,
          classId,
          section: section || "A",
        },
      });
    } else if (role === "TEACHER") {
      if (!employeeId) {
        throw new Error("Employee ID is required for teachers");
      }
      await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId,
          department: department || null,
        },
      });
    }

    return user;
  });

  await logAuditEvent({
    userId: session!.user.id,
    role: "ADMIN",
    action: "USER_CREATE",
    entityType: "User",
    entityId: createdUser.id,
    after: { name, email, role },
    ip,
  });

  return NextResponse.json(
    { success: true, message: "User created successfully", data: createdUser },
    { status: 201 }
  );
}

export async function PATCH(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const body = await req.json().catch(() => null);

  if (!body?.id) {
    return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const updateData: any = {};
  if (parsed.data.name) updateData.name = parsed.data.name;
  if (parsed.data.email) updateData.email = parsed.data.email.toLowerCase().trim();
  if (parsed.data.role) updateData.role = parsed.data.role;
  if (parsed.data.password) {
    updateData.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  }

  const beforeUser = await prisma.user.findUnique({ where: { id: body.id } });
  const updated = await prisma.user.update({
    where: { id: body.id },
    data: updateData,
  });

  await logAuditEvent({
    userId: session!.user.id,
    role: "ADMIN",
    action: "USER_UPDATE",
    entityType: "User",
    entityId: updated.id,
    before: { name: beforeUser?.name, email: beforeUser?.email, role: beforeUser?.role },
    after: { name: updated.name, email: updated.email, role: updated.role },
    ip,
  });

  return NextResponse.json({ success: true, message: "User updated successfully", data: updated });
}
