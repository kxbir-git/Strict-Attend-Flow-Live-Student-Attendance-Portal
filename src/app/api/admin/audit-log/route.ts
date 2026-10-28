import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const role = url.searchParams.get("role");
  const entityType = url.searchParams.get("entityType");

  const where: any = {};
  if (action) where.action = action;
  if (role) where.role = role;
  if (entityType) where.entityType = entityType;

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ success: true, data: logs });
}
