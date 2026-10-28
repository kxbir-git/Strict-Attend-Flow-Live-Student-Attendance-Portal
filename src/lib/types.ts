export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export type SessionStatus = "OPEN" | "SUBMITTED";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "APPROVED_LEAVE";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  teacherId?: string;
  rollNo?: string;
  classId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LeaveRequestItem {
  id: string;
  studentId: string;
  dateFrom: string;
  dateTo: string;
  subjectIds: string[];
  reason: string;
  attachmentUrl?: string | null;
  status: LeaveStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  student?: {
    rollNo: string;
    user: {
      name: string;
      email: string;
    };
    class: {
      name: string;
      section: string;
    };
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string | null;
  createdAt: string;
}

export interface StudentSettingsData {
  language: string;
  notificationsEnabled: boolean;
  parentEmailEnabled: boolean;
  goalPercent: number;
  studyPlannerEnabled: boolean;
  parentEmail?: string | null;
}
