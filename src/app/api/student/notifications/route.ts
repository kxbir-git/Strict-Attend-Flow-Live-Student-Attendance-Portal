import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
    if (auth.errorResponse) return auth.errorResponse;

    const userId = auth.session!.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications", message: error.message },
      { status: 500 }
    );
  }
}

// Mark all as read
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
    if (auth.errorResponse) return auth.errorResponse;

    const userId = auth.session!.user.id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update notifications", message: error.message },
      { status: 500 }
    );
  }
}
