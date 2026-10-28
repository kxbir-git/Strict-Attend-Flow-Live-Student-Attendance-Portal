import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { periodConfigSchema } from "@/lib/validations";
import { logAuditEvent } from "@/lib/audit";

export async function GET() {
  const { errorResponse } = await requireRole(["ADMIN", "TEACHER"]);
  if (errorResponse) return errorResponse;

  const periods = await prisma.period.findMany({
    orderBy: { periodNo: "asc" },
  });

  return NextResponse.json({ success: true, data: periods });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const body = await req.json().catch(() => null);

  const parsed = periodConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { periodNo, startTime, endTime, isActive } = parsed.data;

  const period = await prisma.period.upsert({
    where: { periodNo },
    update: { startTime, endTime, isActive },
    create: { periodNo, startTime, endTime, isActive },
  });

  await logAuditEvent({
    userId: session!.user.id,
    role: "ADMIN",
    action: "PERIOD_CONFIGURE",
    entityType: "Period",
    entityId: period.id,
    after: period,
    ip,
  });

  return NextResponse.json({ success: true, message: `Period ${periodNo} configured`, data: period });
}
