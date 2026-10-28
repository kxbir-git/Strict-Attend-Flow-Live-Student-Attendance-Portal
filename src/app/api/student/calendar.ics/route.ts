import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import ical, { ICalCalendarMethod, ICalEventRepeatingFreq } from "ical-generator";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["STUDENT"]);
    if (auth.errorResponse) return auth.errorResponse;

    const studentId = auth.session!.user.studentId;
    if (!studentId) {
      return new NextResponse("Student profile not found", { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
      },
    });

    if (!student) {
      return new NextResponse("Student not found", { status: 404 });
    }

    // Get timetable slots for student's class
    const slots = await prisma.timetableSlot.findMany({
      where: {
        classId: student.classId,
        isActive: true,
      },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: [{ dayOfWeek: "asc" }, { periodNo: "asc" }],
    });

    const periods = await prisma.period.findMany({
      where: { isActive: true },
    });

    const calendar = ical({
      name: `${student.class.name} Timetable - Strict Attend Flow`,
      description: `Weekly class schedule for ${student.class.name}`,
      method: ICalCalendarMethod.PUBLISH,
      timezone: "Asia/Kolkata",
    });

    // Map dayOfWeek (1=Mon..6=Sat) to current week dates
    const now = new Date();
    const currentDay = now.getDay() || 7; // 1=Mon..7=Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - (currentDay - 1));

    for (const slot of slots) {
      const p = periods.find((item) => item.periodNo === slot.periodNo);
      if (!p) continue;

      const [startHour, startMin] = p.startTime.split(":").map(Number);
      const [endHour, endMin] = p.endTime.split(":").map(Number);

      const eventDate = new Date(monday);
      eventDate.setDate(monday.getDate() + (slot.dayOfWeek - 1));

      const start = new Date(eventDate);
      start.setHours(startHour, startMin, 0, 0);

      const end = new Date(eventDate);
      end.setHours(endHour, endMin, 0, 0);

      calendar.createEvent({
        start,
        end,
        summary: `${slot.subject.name} (${slot.subject.code})`,
        description: `Period ${slot.periodNo} | Faculty: ${slot.teacher.user.name} | Class: ${student.class.name}`,
        location: slot.room,
        repeating: {
          freq: ICalEventRepeatingFreq.WEEKLY,
          count: 20, // 20 weeks of semester
        },
      });
    }

    const icsContent = calendar.toString();
    const filename = `Timetable_${student.class.name.replace(/\s+/g, "_")}.ics`;

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return new NextResponse("Failed to export calendar: " + error.message, { status: 500 });
  }
}
