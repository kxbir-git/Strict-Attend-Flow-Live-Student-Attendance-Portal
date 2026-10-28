import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import { Role, SessionUser } from "./types";

export interface AuthCheckResult {
  session?: { user: SessionUser };
  errorResponse?: NextResponse;
}

/**
 * Server-side role enforcer for API routes.
 * Enforces:
 *  1. Authenticated session (401 if missing)
 *  2. Role authorization (403 if role not in allowedRoles)
 */
export async function requireRole(allowedRoles: Role[]): Promise<AuthCheckResult> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Authentication required to access this resource",
        },
        { status: 401 }
      ),
    };
  }

  const userRole = (session.user as any).role as Role;

  if (!allowedRoles.includes(userRole)) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message: "You don't have permission to access this resource",
        },
        { status: 403 }
      ),
    };
  }

  return { session: session as unknown as { user: SessionUser } };
}

/**
 * Helper to ensure student query only inspects the authenticated student's own data.
 * Always rejects cross-student access.
 */
export function enforceStudentScope(sessionUser: SessionUser): string {
  if (!sessionUser.studentId) {
    throw new Error("Student profile not found for this user");
  }
  return sessionUser.studentId;
}

/**
 * Helper to ensure teacher query only inspects the authenticated teacher's own data.
 */
export function enforceTeacherScope(sessionUser: SessionUser): string {
  if (!sessionUser.teacherId) {
    throw new Error("Teacher profile not found for this user");
  }
  return sessionUser.teacherId;
}
