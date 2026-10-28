import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  // Can be called by Vercel Cron, GitHub Actions, or local worker
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "cron-secret-key-123456";

  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ success: false, error: "Unauthorized cron trigger" }, { status: 401 });
  }

  const now = new Date();
  const todayDate = new Date(now.toISOString().split("T")[0]);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Find all OPEN sessions
  const openSessions = await prisma.attendanceSession.findMany({
    where: { status: "OPEN" },
    include: {
      records: true,
      class: true,
      subject: true,
    },
  });

  const autoSubmittedIds: string[] = [];

  for (const session of openSessions) {
    const sessionDate = new Date(session.date);
    const isPastDay = sessionDate < todayDate;

    // Parse endTime e.g. "11:30"
    const [endH, endM] = session.endTime.split(":").map(Number);
    const endMinutes = (endH || 0) * 60 + (endM || 0);

    // Rule: Exceeds slot end + 15 min
    const isExceeded15Min = isPastDay || currentMinutes >= endMinutes + 15;

    if (isExceeded15Min) {
      await prisma.attendanceSession.update({
        where: { id: session.id },
        data: {
          status: "SUBMITTED",
          submittedAt: now,
        },
      });

      await logAuditEvent({
        userId: null,
        role: "SYSTEM_CRON",
        action: "CRON_AUTO_SUBMIT",
        entityType: "AttendanceSession",
        entityId: session.id,
        after: {
          status: "SUBMITTED",
          reason: "Auto-submitted after slot end + 15 min threshold",
          totalRecords: session.records.length,
        },
        ip: "127.0.0.1",
      });

      autoSubmittedIds.push(session.id);
    }
  }

  return NextResponse.json({
    success: true,
    evaluatedCount: openSessions.length,
    autoSubmittedCount: autoSubmittedIds.length,
    autoSubmittedIds,
  });
}

// Allow GET for simple health-check or cron ping
export async function GET(req: NextRequest) {
  return POST(req);
}
