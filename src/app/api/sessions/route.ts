import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { createSessionSchema } from "@/lib/validations";
import { generateRotatingQrToken } from "@/lib/qr";
import { logAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["TEACHER", "ADMIN"]);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");
  const teacherId = url.searchParams.get("teacherId");
  const date = url.searchParams.get("date");
  const status = url.searchParams.get("status") as "OPEN" | "SUBMITTED" | null;

  const where: any = {};

  if (session!.user.role === "TEACHER") {
    // Teachers only see their own sessions
    where.teacherId = session!.user.teacherId;
  } else if (teacherId) {
    where.teacherId = teacherId;
  }

  if (classId) where.classId = classId;
  if (status) where.status = status;
  if (date) {
    where.date = new Date(date);
  }

  const sessions = await prisma.attendanceSession.findMany({
    where,
    include: {
      class: true,
      subject: true,
      teacher: { include: { user: { select: { name: true, email: true } } } },
      _count: {
        select: { records: true },
      },
    },
    orderBy: [{ date: "desc" }, { periodNo: "desc" }],
    take: 100,
  });

  return NextResponse.json({ success: true, data: sessions });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["TEACHER"]);
  if (errorResponse) return errorResponse;

  const teacherId = session!.user.teacherId;
  if (!teacherId) {
    return NextResponse.json(
      { success: false, error: "Teacher profile required to start attendance session" },
      { status: 400 }
    );
  }

  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const body = await req.json().catch(() => null);

  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { subjectId, classId, date: dateStr, periodNo, startTime, endTime, geoLat, geoLng } = parsed.data;

  // Rule: Future dates NOT allowed
  const sessionDate = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (sessionDate > today) {
    return NextResponse.json(
      { success: false, error: "Future dates are not allowed for taking attendance." },
      { status: 400 }
    );
  }

  // Calculate dayOfWeek (1=Mon ... 7=Sun)
  // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  const jsDay = sessionDate.getDay();
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;

  // Rule: Check if TimetableSlot exists for that teacher, dayOfWeek, and periodNo
  const slot = await prisma.timetableSlot.findUnique({
    where: {
      teacherId_dayOfWeek_periodNo: {
        teacherId,
        dayOfWeek,
        periodNo,
      },
    },
    include: { class: true, subject: true },
  });

  if (!slot) {
    return NextResponse.json(
      {
        success: false,
        error: "Is period me class nahi hai, pehle timetable set karo",
        message: "No timetable slot found for this weekday and period. Please configure your timetable first.",
      },
      { status: 400 }
    );
  }

  // Check if session already exists for this (classId, date, periodNo)
  const existingSession = await prisma.attendanceSession.findUnique({
    where: {
      classId_date_periodNo: {
        classId,
        date: sessionDate,
        periodNo,
      },
    },
    include: {
      class: true,
      subject: true,
      _count: { select: { records: true } },
    },
  });

  if (existingSession) {
    if (existingSession.status === "SUBMITTED") {
      return NextResponse.json(
        {
          success: false,
          error: "Already submitted. Cannot re-mark.",
          message: "Attendance for this class, date and period is already finalized and permanently locked.",
          sessionId: existingSession.id,
        },
        { status: 409 }
      );
    }

    // If existing session is already OPEN, return it
    return NextResponse.json({
      success: true,
      message: "Resuming existing open attendance session",
      data: existingSession,
    });
  }

  // Rule: Only one OPEN session per teacher at a time — auto-submit previous open sessions
  const previousOpenSessions = await prisma.attendanceSession.findMany({
    where: {
      teacherId,
      status: "OPEN",
    },
  });

  for (const prev of previousOpenSessions) {
    await prisma.attendanceSession.update({
      where: { id: prev.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: session!.user.id,
      role: session!.user.role,
      action: "AUTO_CLOSE_PREVIOUS_SESSION",
      entityType: "AttendanceSession",
      entityId: prev.id,
      after: { status: "SUBMITTED", reason: "New session started" },
      ip,
    });
  }

  // Generate initial rotating QR token and 4-digit code
  const tempId = `temp-${Date.now()}`;
  const { token, code } = generateRotatingQrToken(tempId);

  // Create new session in transaction with student records defaulted to ABSENT
  const newSession = await prisma.$transaction(async (tx) => {
    const createdSession = await tx.attendanceSession.create({
      data: {
        subjectId,
        teacherId,
        classId,
        date: sessionDate,
        periodNo,
        startTime,
        endTime,
        status: "OPEN",
        qrToken: token,
        qrCode: code,
        geoLat: geoLat || null,
        geoLng: geoLng || null,
      },
    });

    // Fetch all students belonging to this class
    const classStudents = await tx.student.findMany({
      where: { classId },
      select: { id: true },
    });

    // Populate initial AttendanceRecords (default ABSENT)
    if (classStudents.length > 0) {
      await tx.attendanceRecord.createMany({
        data: classStudents.map((s) => ({
          sessionId: createdSession.id,
          studentId: s.id,
          status: "ABSENT",
          markedBy: "TEACHER",
        })),
        skipDuplicates: true,
      });
    }

    return createdSession;
  });

  await logAuditEvent({
    userId: session!.user.id,
    role: session!.user.role,
    action: "SESSION_START",
    entityType: "AttendanceSession",
    entityId: newSession.id,
    after: {
      classId,
      subjectId,
      date: dateStr,
      periodNo,
      status: "OPEN",
    },
    ip,
  });

  return NextResponse.json(
    {
      success: true,
      message: "Attendance session started successfully",
      data: newSession,
    },
    { status: 201 }
  );
}
