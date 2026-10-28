import pino from "pino";
import { prisma } from "./prisma";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      }
      : undefined,
});

export interface CreateAuditLogParams {
  userId?: string | null;
  role?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  beforeJson?: string | null;
  afterJson?: string | null;
  ip?: string | null;
  req?: any;
}

/**
 * Creates an AuditLog entry in the database and logs via pino.
 * Records before/after JSON diffs.
 */
export async function logAuditEvent({
  userId,
  role,
  action,
  entityType,
  entityId,
  before,
  after,
  beforeJson: beforeJsonInput,
  afterJson: afterJsonInput,
  ip,
}: CreateAuditLogParams) {
  try {
    const beforeJson = beforeJsonInput || (before ? JSON.stringify(before) : null);
    const afterJson = afterJsonInput || (after ? JSON.stringify(after) : null);

    logger.info(
      {
        userId,
        role,
        action,
        entityType,
        entityId,
        ip,
      },
      `Audit Log: ${action} on ${entityType}`
    );

    return await prisma.auditLog.create({
      data: {
        userId: userId || null,
        role: role || null,
        action,
        entityType,
        entityId: entityId || null,
        beforeJson,
        afterJson,
        ip: ip || null,
      },
    });
  } catch (err) {
    logger.error({ err }, "Failed to write audit log to database");
  }
}

export const recordAudit = logAuditEvent;
