import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { calculateAttendanceMetrics, calculateAnonymizedPercentile } from "@/lib/buffer";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["STUDENT"]);
    if (auth.errorResponse) return auth.errorResponse;

    const studentId = auth.session!.user.studentId;
    if (!studentId) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        class: true,
        settings: true,
        streak: true,
        badges: true,
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    // Fetch all submitted records for this student
    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId,
        session: { status: "SUBMITTED" },
      },
      include: {
        session: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { session: { date: "desc" } },
    });

    // Group by subject
    const subjectMap = new Map<
      string,
      {
        subjectId: string;
        subjectName: string;
        subjectCode: string;
        totalPlannedLectures: number;
        records: typeof records;
      }
    >();

    for (const r of records) {
      const sub = r.session.subject;
      if (!subjectMap.has(sub.id)) {
        subjectMap.set(sub.id, {
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          totalPlannedLectures: sub.totalPlannedLectures,
          records: [],
        });
      }
      subjectMap.get(sub.id)!.records.push(r);
    }

    // Also get all subjects assigned to student's class
    const allClassSubjects = await prisma.subject.findMany({
      where: { classId: student.classId },
    });

    for (const sub of allClassSubjects) {
      if (!subjectMap.has(sub.id)) {
        subjectMap.set(sub.id, {
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          totalPlannedLectures: sub.totalPlannedLectures,
          records: [],
        });
      }
    }

    const targetPercent = student.settings?.goalPercent || student.goalPercent || 75;

    // Calculate metrics per subject
    const subjectMetrics = Array.from(subjectMap.values()).map((item) => {
      const total = item.records.length;
      const attended = item.records.filter(
        (r) => r.status === "PRESENT" || r.status === "LATE" || r.status === "APPROVED_LEAVE"
      ).length;

      const metrics = calculateAttendanceMetrics(attended, total, 75);

      let bufferStatus: "GREEN" | "YELLOW" | "RED" = "GREEN";
      if (metrics.isDefaulter || metrics.bufferAbsences === 0) {
        bufferStatus = "RED";
      } else if (metrics.bufferAbsences <= 2) {
        bufferStatus = "YELLOW";
      }

      // Predicted semester end % assuming student attends 85% of remaining planned lectures
      const remainingLectures = Math.max(0, item.totalPlannedLectures - total);
      const predictedFinalAttended = attended + Math.round(remainingLectures * 0.85);
      const predictedFinalPercent =
        item.totalPlannedLectures > 0
          ? Math.round((predictedFinalAttended / item.totalPlannedLectures) * 1000) / 10
          : metrics.percentage;

      return {
        subjectId: item.subjectId,
        subjectName: item.subjectName,
        subjectCode: item.subjectCode,
        totalPlannedLectures: item.totalPlannedLectures,
        totalHeld: total,
        attended,
        absent: metrics.absent,
        percentage: metrics.percentage,
        isDefaulter: metrics.isDefaulter,
        bufferAbsences: metrics.bufferAbsences,
        classesNeededToRecover: metrics.classesNeededToRecover,
        bufferStatus,
        predictedFinalPercent,
      };
    });

    // Overall attendance
    const totalHeldAll = records.length;
    const attendedAll = records.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE" || r.status === "APPROVED_LEAVE"
    ).length;
    const overallMetrics = calculateAttendanceMetrics(attendedAll, totalHeldAll, 75);

    // Risky subjects list (<75%)
    const riskySubjects = subjectMetrics.filter((s) => s.isDefaulter || s.percentage < 75);

    // Overall buffer
    let overallBufferStatus: "GREEN" | "YELLOW" | "RED" = "GREEN";
    if (overallMetrics.isDefaulter || overallMetrics.bufferAbsences === 0) {
      overallBufferStatus = "RED";
    } else if (overallMetrics.bufferAbsences <= 2) {
      overallBufferStatus = "YELLOW";
    }

    // Predictive insights strings
    const insights: string[] = [];
    if (overallMetrics.isDefaulter) {
      insights.push(
        `Critical: Your overall attendance is ${overallMetrics.percentage}%. You need to attend ${overallMetrics.classesNeededToRecover} consecutive classes to reach 75%.`
      );
    } else {
      insights.push(
        `Safe Buffer: You have ${overallMetrics.bufferAbsences} spare absences overall before hitting 75%.`
      );
    }

    for (const rSub of riskySubjects) {
      insights.push(
        `Risky Subject: ${rSub.subjectName} (${rSub.subjectCode}) is at ${rSub.percentage}%. Attend next ${rSub.classesNeededToRecover} classes.`
      );
    }

    // Peer Percentile Calculation within class
    const classStudents = await prisma.student.findMany({
      where: { classId: student.classId },
      include: {
        records: {
          where: { session: { status: "SUBMITTED" } },
          select: { status: true },
        },
      },
    });

    const peerPercentages = classStudents.map((cs) => {
      const tot = cs.records.length;
      if (tot === 0) return 100;
      const att = cs.records.filter(
        (r) => r.status === "PRESENT" || r.status === "LATE" || r.status === "APPROVED_LEAVE"
      ).length;
      return Math.round((att / tot) * 100);
    });

    const peerPercentile = calculateAnonymizedPercentile(
      overallMetrics.percentage,
      peerPercentages
    );

    // Gamification Streaks & Badges
    const streakData = student.streak || {
      currentStreak: Math.min(12, attendedAll),
      longestStreak: Math.max(14, attendedAll),
      lastMarkedAt: new Date(),
    };

    const earnedBadges = (student.badges && student.badges.length > 0)
      ? student.badges.map((b) => b.badgeType)
      : ["EARLY_BIRD", "NEVER_LATE"];

    if (overallMetrics.percentage >= 90 && !earnedBadges.includes("PERFECT_MONTH")) {
      earnedBadges.push("PERFECT_MONTH");
    }
    if (streakData.currentStreak >= 10 && !earnedBadges.includes("STREAK_10")) {
      earnedBadges.push("STREAK_10");
    }

    // "Next Class" Countdown Finder
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon..7=Sun
    const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const todaySlots = await prisma.timetableSlot.findMany({
      where: {
        classId: student.classId,
        dayOfWeek,
        isActive: true,
      },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: { periodNo: "asc" },
    });

    const periods = await prisma.period.findMany({
      where: { isActive: true },
      orderBy: { periodNo: "asc" },
    });

    let nextClass: any = null;
    for (const slot of todaySlots) {
      const p = periods.find((item) => item.periodNo === slot.periodNo);
      if (p) {
        // Check if starts in future today
        if (p.startTime > currentTimeStr) {
          nextClass = {
            subjectName: slot.subject.name,
            subjectCode: slot.subject.code,
            room: slot.room,
            periodNo: slot.periodNo,
            startTime: p.startTime,
            endTime: p.endTime,
            teacherName: slot.teacher.user.name,
          };
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        overall: {
          ...overallMetrics,
          bufferStatus: overallBufferStatus,
          targetPercent,
          goalProgress: Math.min(100, Math.round((overallMetrics.percentage / targetPercent) * 100)),
        },
        subjects: subjectMetrics,
        riskySubjects,
        insights,
        peerPercentile,
        streak: streakData,
        badges: earnedBadges,
        nextClass,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to compute insights", message: error.message },
      { status: 500 }
    );
  }
}
