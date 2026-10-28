import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { generateCertificateToken } from "@/lib/cert";
import { calculateAttendanceMetrics } from "@/lib/buffer";
import { generateAttendanceCertificatePdf } from "@/lib/certificate-pdf";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["STUDENT", "ADMIN"]);
    if (auth.errorResponse) return auth.errorResponse;

    let studentId = auth.session!.user.studentId;
    if (auth.session!.user.role === "ADMIN") {
      const { searchParams } = new URL(req.url);
      const queryStudentId = searchParams.get("studentId");
      if (queryStudentId) studentId = queryStudentId;
    }

    if (!studentId) {
      return new NextResponse("Student profile not found", { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        class: true,
      },
    });

    if (!student) {
      return new NextResponse("Student not found", { status: 404 });
    }

    // Fetch student's submitted attendance records
    const records = await prisma.attendanceRecord.findMany({
      where: {
        studentId,
        session: { status: "SUBMITTED" },
      },
      include: {
        session: {
          include: { subject: true },
        },
      },
      orderBy: { session: { date: "asc" } },
    });

    // Group by subject
    const subjectMap = new Map<
      string,
      { code: string; name: string; held: number; attended: number }
    >();

    for (const r of records) {
      const sub = r.session.subject;
      if (!subjectMap.has(sub.id)) {
        subjectMap.set(sub.id, {
          code: sub.code,
          name: sub.name,
          held: 0,
          attended: 0,
        });
      }
      const item = subjectMap.get(sub.id)!;
      item.held++;
      if (r.status === "PRESENT" || r.status === "LATE" || r.status === "APPROVED_LEAVE") {
        item.attended++;
      }
    }

    const subjects = Array.from(subjectMap.values()).map((s) => ({
      ...s,
      percent: s.held > 0 ? Math.round((s.attended / s.held) * 1000) / 10 : 100,
    }));

    const totalHeld = records.length;
    const totalAttended = records.filter(
      (r) => r.status === "PRESENT" || r.status === "LATE" || r.status === "APPROVED_LEAVE"
    ).length;
    const overall = calculateAttendanceMetrics(totalAttended, totalHeld, 75);

    const isOfficial = !overall.isDefaulter && overall.percentage >= 75;
    const generatedDate = new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Generate HMAC signed token
    const token = generateCertificateToken({
      certId: `CERT-${student.rollNo}-${Date.now()}`,
      studentId: student.id,
      studentName: student.user.name,
      rollNo: student.rollNo,
      className: student.class.name,
      overallPercentage: overall.percentage,
      totalLectures: totalHeld,
      attendedLectures: totalAttended,
      generatedAt: new Date().toISOString(),
      isOfficial,
    });

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const verificationUrl = `${protocol}://${host}/verify/${token}`;

    const pdfBuffer = await generateAttendanceCertificatePdf({
      studentName: student.user.name,
      rollNo: student.rollNo,
      className: student.class.name,
      overallPercentage: overall.percentage,
      totalHeld,
      totalAttended,
      isOfficial,
      subjects,
      verificationUrl,
      token,
      generatedDate,
    });

    const filename = `Attendance_Certificate_${student.rollNo}.pdf`;

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Verification-Token": token,
      },
    });
  } catch (error: any) {
    return new NextResponse("Failed to generate certificate: " + error.message, { status: 500 });
  }
}
