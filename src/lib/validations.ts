import { z } from "zod";

// Auth
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Timetable Slot
export const timetableSlotSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  classId: z.string().min(1, "Class ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  dayOfWeek: z.number().int().min(1).max(7, "Day of week must be between 1 and 7"),
  periodNo: z.number().int().min(1).max(8, "Period number must be between 1 and 8"),
  room: z.string().min(1, "Room is required"),
  isActive: z.boolean().optional().default(true),
});

export const bulkCopyMondaySchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  targetDays: z.array(z.number().int().min(2).max(6)).default([2, 3, 4, 5, 6]), // Tue - Sat
});

// Attendance Session
export const createSessionSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required"),
  classId: z.string().min(1, "Class ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  periodNo: z.number().int().min(1).max(8, "Period must be 1-8"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  geoLat: z.number().optional(),
  geoLng: z.number().optional(),
});

export const updateRecordsSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "APPROVED_LEAVE"]),
    })
  ),
});

export const submitSessionSchema = z.object({
  idempotencyKey: z.string().optional(),
});

// Student Self-Marking (QR / 4-digit code)
export const markAttendanceSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  code: z.string().optional(),
  token: z.string().optional(),
  geoLat: z.number().optional(),
  geoLng: z.number().optional(),
  deviceInfo: z.string().optional(),
});

// Admin User Management
export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  // If Student
  rollNo: z.string().optional(),
  classId: z.string().optional(),
  section: z.string().optional(),
  // If Teacher
  employeeId: z.string().optional(),
  department: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).optional(),
});

// Admin Class
export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  section: z.string().min(1, "Section is required"),
  department: z.string().min(1, "Department is required"),
  semester: z.number().int().min(1).max(12, "Semester must be 1-12"),
});

// Admin Subject
export const createSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  classId: z.string().min(1, "Class ID is required"),
  teacherId: z.string().optional().nullable(),
  totalPlannedLectures: z.number().int().min(1).default(45),
});

// Admin Period
export const periodConfigSchema = z.object({
  periodNo: z.number().int().min(1).max(8),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM"),
  isActive: z.boolean().default(true),
});

// Student Leave Application
export const applyLeaveSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  subjectIds: z.array(z.string()).default([]),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  attachmentUrl: z.string().optional().nullable(),
});

// Leave Review (Teacher / Admin)
export const reviewLeaveSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNote: z.string().optional().nullable(),
});

// Student Settings & Profile
export const studentSettingsSchema = z.object({
  language: z.enum(["en", "hi", "mr", "ta", "te", "bn"]).optional(),
  notificationsEnabled: z.boolean().optional(),
  parentEmailEnabled: z.boolean().optional(),
  parentEmail: z.string().email("Invalid email").optional().nullable(),
  goalPercent: z.number().min(50).max(100).optional(),
  studyPlannerEnabled: z.boolean().optional(),
  name: z.string().min(2).optional(),
});

// AI Assistant
export const aiAssistantSchema = z.object({
  message: z.string().min(1, "Message is required").max(1000, "Message too long"),
});
