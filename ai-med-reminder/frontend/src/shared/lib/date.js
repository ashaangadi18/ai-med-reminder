export function formatTime12h(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function minutesFromNow(time24) {
  const now = new Date();
  const [h, m] = time24.split(":").map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 60000);
}

export function isDueSoon(time24, windowMinutes = 15) {
  const diff = minutesFromNow(time24);
  return diff <= windowMinutes && diff >= -windowMinutes;
}

export function isOverdue(time24) {
  return minutesFromNow(time24) < -15;
}

export function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
