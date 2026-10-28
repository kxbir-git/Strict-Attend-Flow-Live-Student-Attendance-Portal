import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import { studentSettingsSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["STUDENT"]);
    if (auth.errorResponse) return auth.errorResponse;

    const studentId = auth.session!.user.studentId;
    if (!studentId) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true, email: true, language: true } },
        settings: true,
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 });
    }

    const settings = student.settings || {
      language: student.user.language || "en",
      notificationsEnabled: true,
      parentEmailEnabled: !!student.parentEmail,
      goalPercent: student.goalPercent || 75,
      studyPlannerEnabled: true,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        name: student.user.name,
        email: student.user.email,
        rollNo: student.rollNo,
        parentEmail: student.parentEmail,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load settings", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireRole(["STUDENT"]);
    if (auth.errorResponse) return auth.errorResponse;

    const studentId = auth.session!.user.studentId;
    if (!studentId) {
      return NextResponse.json({ success: false, error: "Student profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = studentSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      language,
      notificationsEnabled,
      parentEmailEnabled,
      parentEmail,
      goalPercent,
      studyPlannerEnabled,
      name,
    } = parsed.data;

    // Update Student model
    await prisma.student.update({
      where: { id: studentId },
      data: {
        ...(parentEmail !== undefined ? { parentEmail } : {}),
        ...(goalPercent !== undefined ? { goalPercent } : {}),
      },
    });

    // Update User name or language if provided
    if (name || language) {
      await prisma.user.update({
        where: { id: auth.session!.user.id },
        data: {
          ...(name ? { name } : {}),
          ...(language ? { language } : {}),
        },
      });
    }

    // Upsert StudentSettings
    const settings = await prisma.studentSettings.upsert({
      where: { studentId },
      update: {
        ...(language ? { language } : {}),
        ...(notificationsEnabled !== undefined ? { notificationsEnabled } : {}),
        ...(parentEmailEnabled !== undefined ? { parentEmailEnabled } : {}),
        ...(goalPercent !== undefined ? { goalPercent } : {}),
        ...(studyPlannerEnabled !== undefined ? { studyPlannerEnabled } : {}),
      },
      create: {
        studentId,
        language: language || "en",
        notificationsEnabled: notificationsEnabled ?? true,
        parentEmailEnabled: parentEmailEnabled ?? false,
        goalPercent: goalPercent ?? 75,
        studyPlannerEnabled: studyPlannerEnabled ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
      message: "Preferences saved successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to update settings", message: error.message },
      { status: 500 }
    );
  }
}
