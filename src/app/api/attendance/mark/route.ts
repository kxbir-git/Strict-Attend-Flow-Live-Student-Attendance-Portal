import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { markAttendanceSchema } from "@/lib/validations";
import { verifyQrTokenOrCode } from "@/lib/qr";
import { logAuditEvent } from "@/lib/audit";

// In-memory rate limiting store: studentId -> [timestamps in ms]
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(studentId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxAttempts = 3;

  const attempts = rateLimitMap.get(studentId) || [];
  const validAttempts = attempts.filter((t) => now - t < windowMs);

  if (validAttempts.length >= maxAttempts) {
    return false; // Rate limit exceeded
  }

  validAttempts.push(now);
  rateLimitMap.set(studentId, validAttempts);
  return true;
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["STUDENT"]);
  if (errorResponse) return errorResponse;

  const studentId = session!.user.studentId;
  const studentClassId = session!.user.classId;

  if (!studentId || !studentClassId) {
    return NextResponse.json(
      { success: false, error: "Student profile not found" },
      { status: 400 }
    );
  }

  // Anti-Cheat: Rate limit (max 3 attempts/min/student)
  if (!checkRateLimit(studentId)) {
    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded. Maximum 3 attempts per minute allowed.",
      },
      { status: 429 }
    );
  }

  const ip = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "unknown";

  const body = await req.json().catch(() => null);
  const parsed = markAttendanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { sessionId, code, token, geoLat, geoLng, deviceInfo } = parsed.data;

  // Fetch session
  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      classId: true,
      status: true,
      geoLat: true,
      geoLng: true,
      subject: { select: { name: true, code: true } },
    },
  });

  if (!attendanceSession) {
    return NextResponse.json(
      { success: false, error: "Attendance session not found" },
      { status: 404 }
    );
  }

  // Check 1: Session must belong to student's class
  if (attendanceSession.classId !== studentClassId) {
    return NextResponse.json(
      { success: false, error: "Forbidden: This session is not for your class" },
      { status: 403 }
    );
  }

  // Check 2: Session must be OPEN
  if (attendanceSession.status !== "OPEN") {
    return NextResponse.json(
      {
        success: false,
        error: "Attendance session is no longer open for marking.",
      },
      { status: 400 }
    );
  }

  // Check 3: Validate QR Token or 4-digit Code
  const isValid = verifyQrTokenOrCode({
    sessionId,
    token,
    code,
  });

  if (!isValid) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid or expired QR token / code. Please scan the current live QR code.",
      },
      { status: 400 }
    );
  }

  // Optional Geo-fence validation if teacher provided coordinates
  if (
    attendanceSession.geoLat &&
    attendanceSession.geoLng &&
    geoLat &&
    geoLng
  ) {
    // Rough distance calculation in meters
    const R = 6371e3; // metres
    const phi1 = (attendanceSession.geoLat * Math.PI) / 180;
    const phi2 = (geoLat * Math.PI) / 180;
    const deltaPhi = ((geoLat - attendanceSession.geoLat) * Math.PI) / 180;
    const deltaLambda = ((geoLng - attendanceSession.geoLng) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMeters = R * c;

    if (distanceMeters > 300) {
      return NextResponse.json(
        {
          success: false,
          error: `Location verification failed: You appear to be ${Math.round(
            distanceMeters
          )}m away from the classroom.`,
        },
        { status: 403 }
      );
    }
  }

  // Mark student as PRESENT
  const markedBy = token ? "STUDENT_QR" : "STUDENT_CODE";
  const updatedRecord = await prisma.attendanceRecord.upsert({
    where: {
      sessionId_studentId: {
        sessionId,
        studentId,
      },
    },
    update: {
      status: "PRESENT",
      markedBy,
      markedAt: new Date(),
      ipAddress: ip,
      deviceInfo: deviceInfo || userAgent.slice(0, 100),
    },
    create: {
      sessionId,
      studentId,
      status: "PRESENT",
      markedBy,
      markedAt: new Date(),
      ipAddress: ip,
      deviceInfo: deviceInfo || userAgent.slice(0, 100),
    },
  });

  await logAuditEvent({
    userId: session!.user.id,
    role: "STUDENT",
    action: "STUDENT_SELF_MARK",
    entityType: "AttendanceRecord",
    entityId: updatedRecord.id,
    after: {
      sessionId,
      studentId,
      status: "PRESENT",
      markedBy,
    },
    ip,
  });

  return NextResponse.json({
    success: true,
    message: `Attendance marked successfully for ${attendanceSession.subject.name}!`,
    data: updatedRecord,
  });
}
