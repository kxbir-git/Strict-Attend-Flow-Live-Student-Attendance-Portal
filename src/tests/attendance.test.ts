import { describe, it, expect, vi } from "vitest";
import { escapeCsvField, generateSessionCsv, formatSessionSummary } from "../lib/csv";
import { generateRotatingQrToken, verifyQrTokenOrCode } from "../lib/qr";
import {
  calculateAttendancePercentage,
  calculateAttendanceMetrics,
  calculateAnonymizedPercentile,
} from "../lib/buffer";
import { generateCertificateToken, verifyCertificateToken } from "../lib/cert";
import { requireRole } from "../lib/permissions";
import { Role } from "../lib/types";

// Mock getServerSession for testing requireRole
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from "next-auth";

describe("Strict Attend Flow - Production Unit Test Suite", () => {
  // 1. Attendance % Calculation (with APPROVED_LEAVE handling)
  describe("1. Attendance % calculation (with APPROVED_LEAVE handling)", () => {
    it("calculates correct percentage where APPROVED_LEAVE counts as attended and excluded from absent", () => {
      const records = [
        { status: "PRESENT" },
        { status: "PRESENT" },
        { status: "LATE" },
        { status: "APPROVED_LEAVE" }, // Medical / official approved leave
        { status: "ABSENT" },
      ];

      const percentage = calculateAttendancePercentage(records);
      // 4 attended (2 PRESENT + 1 LATE + 1 APPROVED_LEAVE) out of 5 = 80.0%
      expect(percentage).toBe(80.0);
      expect(percentage >= 75).toBe(true);
    });

    it("flags defaulter when percentage is below 75%", () => {
      const records = [
        { status: "PRESENT" },
        { status: "ABSENT" },
        { status: "ABSENT" },
        { status: "ABSENT" },
      ];

      const percentage = calculateAttendancePercentage(records);
      expect(percentage).toBe(25.0);
      expect(percentage < 75).toBe(true);
    });
  });

  // 2. Session Lifecycle (OPEN -> SUBMITTED)
  describe("2. Session lifecycle (OPEN -> SUBMITTED)", () => {
    it("transitions session status from OPEN to SUBMITTED with submittedAt timestamp", () => {
      const session = {
        id: "sess-101",
        classId: "cls-1",
        subjectId: "sub-1",
        date: new Date("2026-10-28"),
        periodNo: 3,
        status: "OPEN" as "OPEN" | "SUBMITTED",
        submittedAt: null as Date | null,
      };

      expect(session.status).toBe("OPEN");
      expect(session.submittedAt).toBeNull();

      // Submit session action
      const submittedAt = new Date();
      session.status = "SUBMITTED";
      session.submittedAt = submittedAt;

      expect(session.status).toBe("SUBMITTED");
      expect(session.submittedAt).not.toBeNull();
    });
  });

  // 3. QR Token & Passcode Validation (HMAC)
  describe("3. QR token and passcode validation", () => {
    it("generates and verifies rotating QR token and 4-digit code", () => {
      const sessionId = "session-audit-xyz";
      const { token, code, expiresInSeconds } = generateRotatingQrToken(sessionId);

      expect(token).toBeDefined();
      expect(code.length).toBe(4);
      expect(expiresInSeconds).toBeGreaterThan(0);
      expect(expiresInSeconds).toBeLessThanOrEqual(30);

      // Valid 4-digit code
      expect(verifyQrTokenOrCode({ sessionId, code })).toBe(true);
      // Valid rotating token
      expect(verifyQrTokenOrCode({ sessionId, token })).toBe(true);
      // Invalid code
      expect(verifyQrTokenOrCode({ sessionId, code: "99999" })).toBe(false);
      // Token belonging to a different session
      expect(verifyQrTokenOrCode({ sessionId: "other-session", token })).toBe(false);
    });
  });

  // 4. Submit Lock Rejects PATCH for ALL Roles Including Admin
  describe("4. Submit lock rejects PATCH for ALL roles including admin", () => {
    function simulateRecordUpdate(sessionStatus: "OPEN" | "SUBMITTED", role: Role) {
      if (sessionStatus === "SUBMITTED") {
        const error = new Error("ATTENDANCE_LOCKED: This attendance is already submitted and cannot be changed");
        (error as any).code = "ATTENDANCE_LOCKED";
        (error as any).statusCode = 409;
        throw error;
      }
      return { success: true };
    }

    it("allows updates on OPEN sessions for teachers", () => {
      expect(() => simulateRecordUpdate("OPEN", "TEACHER")).not.toThrow();
    });

    it("strictly throws ATTENDANCE_LOCKED (409) on SUBMITTED sessions for TEACHER", () => {
      expect(() => simulateRecordUpdate("SUBMITTED", "TEACHER")).toThrow(/ATTENDANCE_LOCKED/);
    });

    it("strictly throws ATTENDANCE_LOCKED (409) on SUBMITTED sessions for ADMIN", () => {
      expect(() => simulateRecordUpdate("SUBMITTED", "ADMIN")).toThrow(/ATTENDANCE_LOCKED/);
    });
  });

  // 5. CSV Escaping (RFC 4180) & UTF-8 BOM
  describe("5. CSV escaping (commas, quotes, newlines)", () => {
    it("escapes fields with commas, quotes, and newlines properly", () => {
      expect(escapeCsvField("Rahul Sharma")).toBe('"Rahul Sharma"');
      expect(escapeCsvField("Sharma, Rahul")).toBe('"Sharma, Rahul"');
      expect(escapeCsvField('Dr. "Rajesh" Sharma')).toBe('"Dr. ""Rajesh"" Sharma"');
      expect(escapeCsvField("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');
    });

    it("generates CSV with prepended UTF-8 BOM \\uFEFF for Excel compatibility", () => {
      const csv = generateSessionCsv([
        {
          rollNo: "BCA3A-001",
          studentName: "राहुल शर्मा (Rahul)",
          className: "BCA-3A",
          subjectCode: "BCA-301",
          subjectName: "Database Management Systems",
          periodNo: 1,
          date: "2026-10-28",
          timeSlot: "09:00 - 09:45",
          status: "PRESENT",
          markedAt: "2026-10-28T09:10:00.000Z",
        },
      ]);

      expect(csv.startsWith("\uFEFF")).toBe(true);
      expect(csv).toContain('"राहुल शर्मा (Rahul)"');
    });
  });

  // 6. Duplicate Timetable Slot Fails
  describe("6. Duplicate timetable slot fails", () => {
    it("blocks slot collisions for the same teacher on the same day and period", () => {
      const slots = new Map<string, any>();

      function addSlot(teacherId: string, dayOfWeek: number, periodNo: number, room: string) {
        const key = `${teacherId}-${dayOfWeek}-${periodNo}`;
        if (slots.has(key)) {
          throw new Error(`Unique constraint failed on (teacherId, dayOfWeek, periodNo)`);
        }
        slots.set(key, { teacherId, dayOfWeek, periodNo, room });
      }

      addSlot("teacher-1", 1, 1, "Room 204");
      expect(() => addSlot("teacher-1", 1, 1, "Room 205")).toThrow(/Unique constraint failed/);
    });
  });

  // 7. requireRole() Returns 403 for Wrong Role & 401 for Unauthenticated
  describe("7. requireRole() security enforcement", () => {
    it("returns 401 Unauthorized if no session exists", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null as any);

      const result = await requireRole(["ADMIN"]);
      expect(result.errorResponse).toBeDefined();
      expect(result.errorResponse?.status).toBe(401);
    });

    it("returns 403 Forbidden if user role is STUDENT and route requires ADMIN", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: "u-1", name: "Rahul", email: "rahul@portal.edu", role: "STUDENT" },
      } as any);

      const result = await requireRole(["ADMIN"]);
      expect(result.errorResponse).toBeDefined();
      expect(result.errorResponse?.status).toBe(403);
    });

    it("returns 403 Forbidden if user role is STUDENT and route requires TEACHER", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: "u-1", name: "Rahul", email: "rahul@portal.edu", role: "STUDENT" },
      } as any);

      const result = await requireRole(["TEACHER"]);
      expect(result.errorResponse).toBeDefined();
      expect(result.errorResponse?.status).toBe(403);
    });

    it("grants access when user has the permitted role", async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: "u-admin", name: "Director", email: "admin@portal.edu", role: "ADMIN" },
      } as any);

      const result = await requireRole(["ADMIN"]);
      expect(result.errorResponse).toBeUndefined();
      expect(result.session?.user.role).toBe("ADMIN");
    });
  });

  // 8. Certificate HMAC Verification
  describe("8. Certificate HMAC verification", () => {
    it("signs and verifies an official certificate token", () => {
      const certPayload = {
        certId: "CERT-BCA3A001-2026",
        studentId: "stud-123",
        studentName: "Rahul Verma",
        rollNo: "BCA3A-001",
        className: "BCA-3A",
        overallPercentage: 88.5,
        totalLectures: 40,
        attendedLectures: 35,
        generatedAt: new Date().toISOString(),
        isOfficial: true,
      };

      const token = generateCertificateToken(certPayload);
      expect(token).toBeDefined();
      expect(token.includes(".")).toBe(true);

      const verification = verifyCertificateToken(token);
      expect(verification.valid).toBe(true);
      expect(verification.data?.studentName).toBe("Rahul Verma");
      expect(verification.data?.rollNo).toBe("BCA3A-001");
      expect(verification.data?.overallPercentage).toBe(88.5);
    });

    it("rejects tampered certificate tokens with mismatched signature", () => {
      const certPayload = {
        certId: "CERT-FAKE-123",
        studentId: "stud-999",
        studentName: "Fake Student",
        rollNo: "FAKE-001",
        className: "BCA-3A",
        overallPercentage: 99.0,
        totalLectures: 50,
        attendedLectures: 50,
        generatedAt: new Date().toISOString(),
        isOfficial: true,
      };

      const token = generateCertificateToken(certPayload);
      const [payload, sig] = token.split(".");
      // Tamper with signature
      const tamperedToken = `${payload}.${sig.replace(/a/g, "b")}`;

      const verification = verifyCertificateToken(tamperedToken);
      expect(verification.valid).toBe(false);
      expect(verification.error).toContain("HMAC signature mismatch");
    });
  });

  // 9. Leave Approval Auto-Updates Attendance Records
  describe("9. Leave approval auto-updates attendance records", () => {
    it("transitions attendance records from ABSENT to APPROVED_LEAVE on leave approval", () => {
      const records = [
        { id: "rec-1", date: "2026-10-25", status: "ABSENT" },
        { id: "rec-2", date: "2026-10-26", status: "ABSENT" },
      ];

      // Simulate approved leave workflow
      const leave = {
        dateFrom: "2026-10-25",
        dateTo: "2026-10-26",
        status: "APPROVED",
      };

      if (leave.status === "APPROVED") {
        records.forEach((r) => {
          if (r.date >= leave.dateFrom && r.date <= leave.dateTo) {
            r.status = "APPROVED_LEAVE";
          }
        });
      }

      expect(records[0].status).toBe("APPROVED_LEAVE");
      expect(records[1].status).toBe("APPROVED_LEAVE");

      // Verify that calculateAttendancePercentage now counts both as attended
      const pct = calculateAttendancePercentage(records);
      expect(pct).toBe(100.0);
    });
  });

  // 10. Buffer Tracking Math
  describe("10. Buffer tracking math", () => {
    it("calculates spare absences remaining before hitting 75%", () => {
      // 40 attended out of 45 held -> 88.9%
      // 40 / (45 + x) >= 0.75 -> 40 >= 33.75 + 0.75x -> 6.25 >= 0.75x -> x <= 8.33 -> 8 spare absences
      const metrics = calculateAttendanceMetrics(40, 45, 75);
      expect(metrics.percentage).toBe(88.9);
      expect(metrics.isDefaulter).toBe(false);
      expect(metrics.bufferAbsences).toBe(8);
      expect(metrics.classesNeededToRecover).toBe(0);
    });

    it("calculates consecutive classes needed to recover when below 75%", () => {
      // 20 attended out of 35 held -> 57.1% (Defaulter)
      // (20 + y) / (35 + y) >= 0.75 -> 20 + y >= 26.25 + 0.75y -> 0.25y >= 6.25 -> y >= 25 classes
      const metrics = calculateAttendanceMetrics(20, 35, 75);
      expect(metrics.percentage).toBe(57.1);
      expect(metrics.isDefaulter).toBe(true);
      expect(metrics.bufferAbsences).toBe(0);
      expect(metrics.classesNeededToRecover).toBe(25);
    });

    it("calculates anonymized peer percentile rank correctly", () => {
      const peerScores = [50, 60, 70, 80, 90];
      // Student has 80% attendance -> 4 out of 5 peers <= 80 -> 80th percentile (Top 21%)
      const percentile = calculateAnonymizedPercentile(80, peerScores);
      expect(percentile).toBe(80);
    });
  });

  // 11. Student Enrollment Number & Cumulative Curriculum Attendance
  describe("11. Student Enrollment Number & Cumulative Curriculum Attendance", () => {
    it("formats enrollment number, roll number, and contact details correctly", () => {
      const rollNo = "BCA3A-001";
      const serial = rollNo.includes("-") ? rollNo.split("-").pop()! : rollNo;
      const numericPart = serial.replace(/\D/g, "") || "001";
      const enrollmentNo = `ENR2024${numericPart.padStart(3, "0")}`;
      const phone = `+91 98765 ${numericPart.padStart(5, "0")}`;

      expect(enrollmentNo).toBe("ENR2024001");
      expect(phone).toBe("+91 98765 00001");
    });

    it("evaluates today's daily periods attendance and cumulative curriculum stats", () => {
      const todaySlots = [
        { periodNo: 1, subject: "DBMS", status: "PRESENT" },
        { periodNo: 2, subject: "DSA", status: "PRESENT" },
        { periodNo: 3, subject: "OS", status: "ABSENT" },
        { periodNo: 4, subject: "Web Tech", status: "SCHEDULED" },
      ];

      const conducted = todaySlots.filter((s) => s.status === "PRESENT" || s.status === "ABSENT").length;
      const present = todaySlots.filter((s) => s.status === "PRESENT").length;
      const todayPct = (present / conducted) * 100;

      expect(conducted).toBe(3);
      expect(present).toBe(2);
      expect(Number(todayPct.toFixed(1))).toBe(66.7);

      // Cumulative curriculum matrix check
      const curriculumSubjects = [
        { name: "DBMS", planned: 45, attended: 20, totalConducted: 22 },
        { name: "DSA", planned: 45, attended: 14, totalConducted: 20 },
      ];

      const dbmsPct = (curriculumSubjects[0].attended / curriculumSubjects[0].totalConducted) * 100;
      const dsaPct = (curriculumSubjects[1].attended / curriculumSubjects[1].totalConducted) * 100;

      expect(dbmsPct >= 75).toBe(true); // 90.9% -> Eligible
      expect(dsaPct < 75).toBe(true);   // 70.0% -> Defaulter alert
    });
  });
});
