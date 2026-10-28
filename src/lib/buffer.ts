/**
 * Buffer Tracking and Attendance Mathematics
 */

export interface AttendanceStats {
  total: number;
  attended: number; // PRESENT + LATE + APPROVED_LEAVE
  absent: number;
  percentage: number;
  isDefaulter: boolean;
  bufferAbsences: number; // Spare absences before dropping below target
  classesNeededToRecover: number; // Classes to attend consecutively if below target
}

/**
 * Calculates attendance percentage given records.
 * Status PRESENT, LATE, and APPROVED_LEAVE count as attended/present.
 * ABSENT counts as absent.
 */
export function calculateAttendancePercentage(records: { status: string }[]): number {
  if (!records || records.length === 0) return 100;

  const attended = records.filter(
    (r) => r.status === "PRESENT" || r.status === "LATE" || r.status === "APPROVED_LEAVE"
  ).length;

  return Math.round((attended / records.length) * 1000) / 10; // 1 decimal place e.g. 84.5
}

/**
 * Calculates attendance metrics including buffer absences and recovery classes.
 * Target is by default 75% (0.75).
 */
export function calculateAttendanceMetrics(
  attended: number,
  total: number,
  targetPercent: number = 75
): AttendanceStats {
  if (total <= 0) {
    return {
      total: 0,
      attended: 0,
      absent: 0,
      percentage: 100,
      isDefaulter: false,
      bufferAbsences: 0,
      classesNeededToRecover: 0,
    };
  }

  const p = targetPercent / 100;
  const currentPercentage = Math.round((attended / total) * 1000) / 10;
  const absent = total - attended;
  const isDefaulter = currentPercentage < targetPercent;

  let bufferAbsences = 0;
  let classesNeededToRecover = 0;

  if (!isDefaulter) {
    // If current attended / (total + x) >= p
    // attended >= p * (total + x)
    // attended - p * total >= p * x
    // x <= (attended - p * total) / p
    const spare = (attended - p * total) / p;
    bufferAbsences = Math.max(0, Math.floor(spare));
  } else {
    // Defaulter: need y attended classes: (attended + y) / (total + y) >= p
    // attended + y >= p * total + p * y
    // y * (1 - p) >= p * total - attended
    // y >= (p * total - attended) / (1 - p)
    const needed = (p * total - attended) / (1 - p);
    classesNeededToRecover = Math.max(0, Math.ceil(needed));
  }

  return {
    total,
    attended,
    absent,
    percentage: currentPercentage,
    isDefaulter,
    bufferAbsences,
    classesNeededToRecover,
  };
}

/**
 * Calculates anonymized percentile ranking within class.
 * Percentile = % of peers with attendance <= student's attendance.
 */
export function calculateAnonymizedPercentile(
  studentPercent: number,
  peerPercentages: number[]
): number {
  if (!peerPercentages || peerPercentages.length === 0) return 100;

  const countLowerOrEqual = peerPercentages.filter((p) => p <= studentPercent).length;
  const percentile = Math.round((countLowerOrEqual / peerPercentages.length) * 100);
  return Math.min(100, Math.max(1, percentile));
}
