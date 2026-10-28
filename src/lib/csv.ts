/**
 * CSV Generation Utility
 * Ensures UTF-8 BOM is prepended for proper Excel rendering (including Hindi/English names)
 * Implements strict RFC 4180 CSV escaping for quotes, commas, and newlines.
 */

export function escapeCsvField(field: unknown): string {
  if (field === null || field === undefined) {
    return '""';
  }
  const str = String(field);
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export interface AttendanceRecordCsvRow {
  rollNo: string;
  studentName: string;
  className: string;
  subjectCode: string;
  subjectName: string;
  periodNo: number;
  date: string;
  timeSlot: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  markedAt: string;
}

export function generateSessionCsv(rows: AttendanceRecordCsvRow[]): string {
  const BOM = "\uFEFF";
  const headers = [
    "Roll No",
    "Student Name",
    "Class",
    "Subject Code",
    "Subject Name",
    "Period",
    "Date",
    "Time Slot",
    "Status",
    "Marked At",
  ];

  const headerLine = headers.map(escapeCsvField).join(",");
  const dataLines = rows.map((row) =>
    [
      row.rollNo,
      row.studentName,
      row.className,
      row.subjectCode,
      row.subjectName,
      row.periodNo,
      row.date,
      row.timeSlot,
      row.status,
      row.markedAt,
    ]
      .map(escapeCsvField)
      .join(",")
  );

  return BOM + [headerLine, ...dataLines].join("\r\n");
}

export interface SummaryData {
  subjectName: string;
  subjectCode: string;
  dateStr: string;
  periodNo: number;
  className: string;
  room?: string;
  timeSlot?: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  presentPercentage: number;
  absentees: Array<{ name: string; rollNo: string }>;
}

export function formatSessionSummary(data: SummaryData): string {
  const absenteeList =
    data.absentees.length > 0
      ? data.absentees.map((a) => `${a.name} (${a.rollNo})`).join(", ")
      : "None";

  return [
    `${data.subjectName} (${data.subjectCode}) | ${data.dateStr} | Period ${data.periodNo} | ${data.className}`,
    `Room: ${data.room || "N/A"} | Time: ${data.timeSlot || "N/A"}`,
    `Present: ${data.presentCount}/${data.totalStudents} (${data.presentPercentage.toFixed(1)}%) | Absent: ${data.absentCount} | Late: ${data.lateCount}`,
    `Absentees: ${absenteeList}`,
  ].join("\n");
}
