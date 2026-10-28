import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRole(["STUDENT", "TEACHER", "ADMIN"]);
    if (auth.errorResponse) return auth.errorResponse;

    const notificationId = params.id;
    const userId = auth.session!.user.id;

    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notif || notif.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Not found or forbidden" },
        { status: 404 }
      );
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update notification", message: error.message },
      { status: 500 }
    );
  }
}
