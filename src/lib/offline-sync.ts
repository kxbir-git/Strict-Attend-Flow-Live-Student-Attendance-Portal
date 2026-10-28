export interface OfflineAttendanceItem {
  id: string;
  sessionId: string;
  code?: string;
  token?: string;
  timestamp: number;
}

const STORAGE_KEY = "STRICT_ATTEND_OFFLINE_QUEUE";

export function getOfflineQueue(): OfflineAttendanceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueOfflineAttendance(item: Omit<OfflineAttendanceItem, "id" | "timestamp">): OfflineAttendanceItem {
  const queue = getOfflineQueue();
  const newItem: OfflineAttendanceItem = {
    ...item,
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };
  queue.push(newItem);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }
  return newItem;
}

export async function syncOfflineQueue(
  onSuccess?: (item: OfflineAttendanceItem) => void,
  onError?: (item: OfflineAttendanceItem, err: any) => void
): Promise<{ synced: number; failed: number }> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: OfflineAttendanceItem[] = [];

  for (const item of queue) {
    try {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: item.sessionId,
          code: item.code,
          token: item.token,
          deviceInfo: "PWA_Offline_Replayed",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        synced++;
        if (onSuccess) onSuccess(item);
      } else {
        // If conflict (409) or already marked, consider done
        if (res.status === 409) {
          synced++;
        } else {
          failed++;
          remaining.push(item);
          if (onError) onError(item, json);
        }
      }
    } catch (e) {
      failed++;
      remaining.push(item);
      if (onError) onError(item, e);
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  return { synced, failed };
}
