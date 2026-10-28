import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { timetableSlotSchema, bulkCopyMondaySchema } from "@/lib/validations";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["TEACHER", "ADMIN"]);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const teacherIdParam = url.searchParams.get("teacherId");

  let targetTeacherId = session!.user.teacherId;

  if (session!.user.role === "ADMIN") {
    if (teacherIdParam) {
      targetTeacherId = teacherIdParam;
    } else {
      // Admin requesting all timetable slots
      const allSlots = await prisma.timetableSlot.findMany({
        include: {
          class: true,
          subject: true,
          teacher: { include: { user: { select: { name: true, email: true } } } },
        },
        orderBy: [{ dayOfWeek: "asc" }, { periodNo: "asc" }],
      });
      return NextResponse.json({ success: true, data: allSlots });
    }
  }

  if (!targetTeacherId) {
    return NextResponse.json(
      { success: false, error: "Teacher profile required" },
      { status: 400 }
    );
  }

  const slots = await prisma.timetableSlot.findMany({
    where: { teacherId: targetTeacherId },
    include: {
      class: true,
      subject: true,
      teacher: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: [{ dayOfWeek: "asc" }, { periodNo: "asc" }],
  });

  return NextResponse.json({ success: true, data: slots });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["TEACHER", "ADMIN"]);
  if (errorResponse) return errorResponse;

  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const body = await req.json().catch(() => null);

  // Check if this is a bulk action: "Copy Monday to all weekdays"
  if (body?.action === "COPY_MONDAY") {
    const parsed = bulkCopyMondaySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const teacherId =
      session!.user.role === "ADMIN"
        ? parsed.data.teacherId
        : session!.user.teacherId!;

    // Fetch Monday (dayOfWeek = 1) slots
    const mondaySlots = await prisma.timetableSlot.findMany({
      where: { teacherId, dayOfWeek: 1, isActive: true },
    });

    if (mondaySlots.length === 0) {
      return NextResponse.json(
        { success: false, error: "No Monday slots found to copy." },
        { status: 400 }
      );
    }

    // Upsert slots for Tue to Sat
    const createdSlots = [];
    for (const targetDay of parsed.data.targetDays) {
      for (const mSlot of mondaySlots) {
        const slot = await prisma.timetableSlot.upsert({
          where: {
            teacherId_dayOfWeek_periodNo: {
              teacherId,
              dayOfWeek: targetDay,
              periodNo: mSlot.periodNo,
            },
          },
          update: {
            classId: mSlot.classId,
            subjectId: mSlot.subjectId,
            room: mSlot.room,
            isActive: true,
          },
          create: {
            teacherId,
            classId: mSlot.classId,
            subjectId: mSlot.subjectId,
            dayOfWeek: targetDay,
            periodNo: mSlot.periodNo,
            room: mSlot.room,
            isActive: true,
          },
        });
        createdSlots.push(slot);
      }
    }

    await logAuditEvent({
      userId: session!.user.id,
      role: session!.user.role,
      action: "TIMETABLE_BULK_COPY_MONDAY",
      entityType: "TimetableSlot",
      after: { teacherId, copiedCount: createdSlots.length },
      ip,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully copied Monday slots to weekdays`,
      data: createdSlots,
    });
  }

  // Single Slot Save / Update
  const parsed = timetableSlotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { teacherId, classId, subjectId, dayOfWeek, periodNo, room, isActive } =
    parsed.data;

  // Enforce teacher only creating for self unless Admin
  if (session!.user.role === "TEACHER" && session!.user.teacherId !== teacherId) {
    return NextResponse.json(
      { success: false, error: "Forbidden: You can only edit your own timetable" },
      { status: 403 }
    );
  }

  // Upsert the slot
  const slot = await prisma.timetableSlot.upsert({
    where: {
      teacherId_dayOfWeek_periodNo: {
        teacherId,
        dayOfWeek,
        periodNo,
      },
    },
    update: {
      classId,
      subjectId,
      room,
      isActive,
    },
    create: {
      teacherId,
      classId,
      subjectId,
      dayOfWeek,
      periodNo,
      room,
      isActive,
    },
    include: {
      class: true,
      subject: true,
    },
  });

  await logAuditEvent({
    userId: session!.user.id,
    role: session!.user.role,
    action: "TIMETABLE_SLOT_SAVE",
    entityType: "TimetableSlot",
    entityId: slot.id,
    after: slot,
    ip,
  });

  return NextResponse.json({ success: true, data: slot });
}

export async function DELETE(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["TEACHER", "ADMIN"]);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const slotId = url.searchParams.get("id");

  if (!slotId) {
    return NextResponse.json(
      { success: false, error: "Slot ID is required" },
      { status: 400 }
    );
  }

  const existing = await prisma.timetableSlot.findUnique({
    where: { id: slotId },
  });

  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Slot not found" },
      { status: 404 }
    );
  }

  if (session!.user.role === "TEACHER" && existing.teacherId !== session!.user.teacherId) {
    return NextResponse.json(
      { success: false, error: "Forbidden: Cannot delete other teacher's slots" },
      { status: 403 }
    );
  }

  await prisma.timetableSlot.delete({
    where: { id: slotId },
  });

  await logAuditEvent({
    userId: session!.user.id,
    role: session!.user.role,
    action: "TIMETABLE_SLOT_DELETE",
    entityType: "TimetableSlot",
    entityId: slotId,
    before: existing,
    ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
  });

  return NextResponse.json({ success: true, message: "Slot deleted successfully" });
}
