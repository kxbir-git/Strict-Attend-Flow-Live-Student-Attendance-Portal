import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { reviewLeaveSchema } from "@/lib/validations";
import { recordAudit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRole(["TEACHER", "ADMIN"]);
    if (auth.errorResponse) return auth.errorResponse;

    const leaveId = params.id;
    const body = await req.json();
    const parsed = reviewLeaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { status, reviewNote } = parsed.data;

    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: {
        student: {
          include: {
            user: true,
            class: true,
          },
        },
      },
    });

    if (!leave) {
      return NextResponse.json(
        { success: false, error: "Not Found", message: "Leave request not found" },
        { status: 404 }
      );
    }

    const reviewerName = auth.session!.user.name || "Faculty Reviewer";
    const beforeState = JSON.stringify(leave);

    // Update leave request
    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status,
        reviewedBy: reviewerName,
        reviewedAt: new Date(),
        reviewNote: reviewNote || null,
      },
    });

    let recordsUpdatedCount = 0;

    // If approved, automatically update corresponding attendance records to APPROVED_LEAVE
    if (status === "APPROVED") {
      // Find all sessions on or between dateFrom and dateTo for this student's class
      const sessions = await prisma.attendanceSession.findMany({
        where: {
          classId: leave.student.classId,
          date: {
            gte: leave.dateFrom,
            lte: leave.dateTo,
          },
          ...(leave.subjectIds && leave.subjectIds.length > 0
            ? { subjectId: { in: leave.subjectIds } }
            : {}),
        },
        select: { id: true },
      });

      const sessionIds = sessions.map((s) => s.id);

      if (sessionIds.length > 0) {
        for (const sessionId of sessionIds) {
          const rec = await prisma.attendanceRecord.findUnique({
            where: {
              sessionId_studentId: {
                sessionId,
                studentId: leave.studentId,
              },
            },
          });

          if (rec) {
            await prisma.attendanceRecord.update({
              where: { id: rec.id },
              data: { status: "APPROVED_LEAVE" },
            });
            recordsUpdatedCount++;
          }
        }
      }
    }

    // Send in-app notification to student
    await prisma.notification.create({
      data: {
        userId: leave.student.userId,
        type: "LEAVE_STATUS",
        title: `Leave Request ${status}`,
        message: `Your leave request for ${new Date(leave.dateFrom).toLocaleDateString()} has been ${status} by ${reviewerName}.${reviewNote ? ` Note: "${reviewNote}"` : ""
          }`,
        actionUrl: "/student/leave",
      },
    });

    // Record in Audit Log
    await recordAudit({
      userId: auth.session!.user.id,
      role: auth.session!.user.role,
      action: `LEAVE_${status}`,
      entityType: "LeaveRequest",
      entityId: leave.id,
      beforeJson: beforeState,
      afterJson: JSON.stringify({ ...updatedLeave, recordsUpdatedCount }),
      req,
    });

    return NextResponse.json({
      success: true,
      data: updatedLeave,
      recordsAdjusted: recordsUpdatedCount,
      message: `Leave request marked as ${status}.${status === "APPROVED" ? ` Adjusted ${recordsUpdatedCount} lecture attendance records.` : ""
        }`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to review leave request", message: error.message },
      { status: 500 }
    );
  }
}
