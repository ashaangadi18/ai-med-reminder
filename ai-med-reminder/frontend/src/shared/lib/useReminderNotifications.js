import { useEffect, useRef } from "react";
import { isDueSoon } from "./date";

// Polls the given schedule every 30s and fires a native browser notification
// the first time a pending dose enters its "due" window. Keeps a ref of
// already-notified dose keys so the same dose doesn't notify twice.
export function useReminderNotifications(schedule) {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!schedule || schedule.length === 0) return;

    schedule.forEach((dose) => {
      const key = `${dose.medicineId}-${dose.date}-${dose.time}`;
      if (dose.status !== "pending") return;
      if (notifiedRef.current.has(key)) return;

      if (isDueSoon(dose.time, 5)) {
        notifiedRef.current.add(key);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Time for your medicine 💊", {
            body: `${dose.name}${dose.dosage ? ` (${dose.dosage})` : ""} — scheduled for ${dose.time}`,
            tag: key,
          });
        }
      }
    });
  }, [schedule]);
}
