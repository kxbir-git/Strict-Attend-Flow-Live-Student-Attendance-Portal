import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";
import bcrypt from "bcryptjs";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireRole(["ADMIN"]);
  if (errorResponse) return errorResponse;

  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const body = await req.json().catch(() => null);

  if (!body?.csvText) {
    return NextResponse.json(
      { success: false, error: "csvText field containing CSV data is required" },
      { status: 400 }
    );
  }

  const lines = body.csvText
    .split(/\r?\n/)
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0);

  if (lines.length < 2) {
    return NextResponse.json(
      { success: false, error: "CSV must contain at least a header and one data row" },
      { status: 400 }
    );
  }

  // Parse header
  const header = lines[0].split(",").map((h: string) => h.trim().replace(/^["']|["']$/g, "").toLowerCase());
  const nameIdx = header.findIndex((h: string) => h.includes("name"));
  const emailIdx = header.findIndex((h: string) => h.includes("email"));
  const rollIdx = header.findIndex((h: string) => h.includes("roll"));
  const classIdx = header.findIndex((h: string) => h.includes("class"));
  const sectionIdx = header.findIndex((h: string) => h.includes("section"));

  if (nameIdx === -1 || emailIdx === -1 || rollIdx === -1 || classIdx === -1) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing required columns in CSV header: Name, Email, RollNo, Class",
      },
      { status: 400 }
    );
  }

  // Pre-fetch classes for lookup by name
  const allClasses = await prisma.class.findMany();
  const classLookup = new Map<string, string>(); // name/id -> id
  allClasses.forEach((c) => {
    classLookup.set(c.id, c.id);
    classLookup.set(c.name.toLowerCase(), c.id);
  });

  const defaultPasswordHash = await bcrypt.hash("studentPassword123!", 12);

  const imported: any[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split by comma ignoring inside quotes
    const cols = rawLine.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c: string) => c.trim().replace(/^["']|["']$/g, ""));

    const name = cols[nameIdx];
    const email = cols[emailIdx]?.toLowerCase();
    const rollNo = cols[rollIdx];
    const rawClass = cols[classIdx];
    const section = sectionIdx !== -1 && cols[sectionIdx] ? cols[sectionIdx] : "A";

    if (!name || !email || !rollNo || !rawClass) {
      errors.push(`Row ${i + 1}: Missing required fields.`);
      continue;
    }

    const resolvedClassId = classLookup.get(rawClass.toLowerCase()) || classLookup.get(rawClass);
    if (!resolvedClassId) {
      errors.push(`Row ${i + 1}: Class "${rawClass}" does not exist in the database.`);
      continue;
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        errors.push(`Row ${i + 1}: Email "${email}" already exists.`);
        continue;
      }

      const existingRoll = await prisma.student.findUnique({ where: { rollNo } });
      if (existingRoll) {
        errors.push(`Row ${i + 1}: Roll No "${rollNo}" already exists.`);
        continue;
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: defaultPasswordHash,
          role: "STUDENT",
          student: {
            create: {
              rollNo,
              classId: resolvedClassId,
              section,
            },
          },
        },
        include: { student: true },
      });

      imported.push({ id: user.id, name, email, rollNo });
    } catch (err: any) {
      errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  await logAuditEvent({
    userId: session!.user.id,
    role: "ADMIN",
    action: "STUDENTS_BULK_CSV_IMPORT",
    entityType: "Student",
    after: { totalRows: lines.length - 1, importedCount: imported.length, errorsCount: errors.length },
    ip,
  });

  return NextResponse.json({
    success: true,
    message: `Imported ${imported.length} students successfully.${errors.length > 0 ? ` ${errors.length} rows skipped.` : ""}`,
    data: {
      importedCount: imported.length,
      errors,
    },
  });
}
