import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, enforceTeacherScope } from "@/lib/permissions";
import bcrypt from "bcryptjs";

// GET: Teacher apni subjects ki classes ke saare students dekhe
export async function GET(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["TEACHER", "ADMIN"]);
  if (errorResponse) return errorResponse;

  try {
    const user = session!.user as any;
    let classIds: string[] = [];

    if (user.role === "TEACHER") {
      const teacherId = enforceTeacherScope(user);

      // Teacher ke subjects ki classes nikalo
      const subjects = await prisma.subject.findMany({
        where: { teacherId },
        select: { classId: true },
      });

      classIds = Array.from(new Set(subjects.map((s) => s.classId)));

      if (classIds.length === 0) {
        return NextResponse.json({ success: true, data: [], classes: [] });
      }
    }

    // classId filter from query param
    const url = new URL(req.url);
    const filterClassId = url.searchParams.get("classId");

    const where: any = {};
    if (user.role === "TEACHER") {
      where.classId = filterClassId && classIds.includes(filterClassId)
        ? filterClassId
        : { in: classIds };
    } else if (filterClassId) {
      where.classId = filterClassId;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        class: { select: { id: true, name: true, section: true } },
        records: { select: { status: true } },
      },
      orderBy: { rollNo: "asc" },
    });

    // Get classes list for filter dropdown
    let classes: any[] = [];
    if (user.role === "TEACHER") {
      classes = await prisma.class.findMany({
        where: { id: { in: classIds } },
        select: { id: true, name: true, section: true, semester: true },
      });
    }

    const studentsWithStats = students.map((s) => {
      const total = s.records.length;
      const present = s.records.filter(
        (r) => r.status === "PRESENT" || r.status === "LATE"
      ).length;
      const percentage = total > 0 ? (present / total) * 100 : 100;

      return {
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        rollNo: s.rollNo,
        section: s.section,
        classId: s.class.id,
        className: s.class.name,
        classSection: s.class.section,
        totalLectures: total,
        attendedLectures: present,
        percentage: Number(percentage.toFixed(1)),
        isDefaulter: percentage < 75,
      };
    });

    return NextResponse.json({ success: true, data: studentsWithStats, classes });
  } catch (err: any) {
    console.error("Teacher students GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// POST: Teacher naaya student enroll kare apni class mein
export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["TEACHER", "ADMIN"]);
  if (errorResponse) return errorResponse;

  try {
    const user = session!.user as any;
    const body = await req.json();
    const { name, email, rollNo, classId, section, parentEmail } = body;

    // Validation
    if (!name || !email || !rollNo || !classId) {
      return NextResponse.json(
        { success: false, error: "Name, email, rollNo, and classId are required" },
        { status: 400 }
      );
    }

    // Enrollment format check: 2400XXXXXX (10 digits)
    if (!/^24\d{8}$/.test(rollNo)) {
      return NextResponse.json(
        { success: false, error: "Enrollment no must be 10 digits starting with 24 (e.g. 2400100001)" },
        { status: 400 }
      );
    }

    // Teacher can only enroll into their assigned classes
    if (user.role === "TEACHER") {
      const teacherId = enforceTeacherScope(user);
      const subjectInClass = await prisma.subject.findFirst({
        where: { teacherId, classId },
      });
      if (!subjectInClass) {
        return NextResponse.json(
          { success: false, error: "You are not assigned to any subject in this class" },
          { status: 403 }
        );
      }
    }

    // Check duplicate rollNo
    const existingStudent = await prisma.student.findUnique({ where: { rollNo } });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: `Enrollment no ${rollNo} already registered` },
        { status: 409 }
      );
    }

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: `Email ${email} already registered` },
        { status: 409 }
      );
    }

    // Verify class exists
    const classRecord = await prisma.class.findUnique({ where: { id: classId } });
    if (!classRecord) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      );
    }

    // Default password = rollNo (student can change later)
    const passwordHash = await bcrypt.hash(rollNo, 10);

    // Create user + student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "STUDENT",
        },
      });

      const newStudent = await tx.student.create({
        data: {
          userId: newUser.id,
          rollNo,
          classId,
          section: section || classRecord.section,
          parentEmail: parentEmail || null,
        },
      });

      return { user: newUser, student: newStudent };
    });

    return NextResponse.json({
      success: true,
      message: `Student ${name} enrolled successfully. Default password: ${rollNo}`,
      data: {
        id: result.student.id,
        name: result.user.name,
        email: result.user.email,
        rollNo,
        classId,
        className: classRecord.name,
      },
    });
  } catch (err: any) {
    console.error("Teacher student POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to enroll student" },
      { status: 500 }
    );
  }
}

