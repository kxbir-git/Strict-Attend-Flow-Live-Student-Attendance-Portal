import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  // Prisma Client Middleware to enforce strict immutability on submitted attendance records
  // Blocks manual UPDATE/DELETE on AttendanceRecord where parent session.status = 'SUBMITTED' for ALL roles including ADMIN
  // Exception: Official verified leave workflow updates status to APPROVED_LEAVE
  client.$use(async (params, next) => {
    if (params.model === "AttendanceRecord") {
      const actionsToCheck = [
        "update",
        "updateMany",
        "delete",
        "deleteMany",
        "upsert",
      ];

      if (actionsToCheck.includes(params.action)) {
        // If this is an official leave approval changing status to APPROVED_LEAVE, allow it
        const isApprovedLeaveUpdate =
          params.args?.data?.status === "APPROVED_LEAVE";

        if (!isApprovedLeaveUpdate) {
          let sessionId: string | undefined;

          if (params.args?.where?.sessionId) {
            sessionId = params.args.where.sessionId;
          } else if (params.args?.where?.id) {
            const existing = await client.attendanceRecord.findUnique({
              where: { id: params.args.where.id },
              select: { sessionId: true },
            });
            sessionId = existing?.sessionId;
          }

          if (sessionId) {
            const session = await client.attendanceSession.findUnique({
              where: { id: sessionId },
              select: { status: true },
            });

            if (session?.status === "SUBMITTED") {
              const error = new Error(
                "ATTENDANCE_LOCKED: This attendance is already submitted and cannot be changed"
              );
              (error as any).code = "ATTENDANCE_LOCKED";
              (error as any).statusCode = 409;
              throw error;
            }
          }
        }
      }
    }

    return next(params);
  });

  return client;
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
