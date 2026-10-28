import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { applyLeaveSchema } from "@/lib/validations";
import { recordAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["STUDENT"]);
    if (auth.errorResponse) return auth.errorResponse;

    const studentId = auth.session!.user.studentId;
    if (!studentId) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: leaves,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaves", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["STUDENT"]);
    if (auth.errorResponse) return auth.errorResponse;

    const studentId = auth.session!.user.studentId;
    if (!studentId) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = applyLeaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { dateFrom, dateTo, subjectIds, reason, attachmentUrl } = parsed.data;

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const now = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(now.getDate() - 3);

    // Rule: Only allowed for future dates OR past <= 3 days (with valid reason)
    if (fromDate < threeDaysAgo) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid Date Range",
          message: "Leave requests for past dates can only be submitted up to 3 days prior.",
        },
        { status: 400 }
      );
    }

    if (fromDate > toDate) {
      return NextResponse.json(
        { success: false, error: "Invalid Date Range", message: "From date must be earlier than or equal to To date." },
        { status: 400 }
      );
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        studentId,
        dateFrom: fromDate,
        dateTo: toDate,
        subjectIds,
        reason,
        attachmentUrl: attachmentUrl || null,
        status: "PENDING",
      },
    });

    // Create confirmation in-app notification for student
    await prisma.notification.create({
      data: {
        userId: auth.session!.user.id,
        type: "LEAVE_STATUS",
        title: "Leave Application Submitted",
        message: `Your leave request for ${dateFrom} to ${dateTo} is currently PENDING review.`,
        actionUrl: "/student/leave",
      },
    });

    // Audit log
    await recordAudit({
      userId: auth.session!.user.id,
      role: "STUDENT",
      action: "LEAVE_APPLY",
      entityType: "LeaveRequest",
      entityId: leave.id,
      afterJson: JSON.stringify(leave),
      req,
    });

    return NextResponse.json({
      success: true,
      data: leave,
      message: "Leave request submitted successfully and is pending review.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to submit leave", message: error.message },
      { status: 500 }
    );
  }
}
