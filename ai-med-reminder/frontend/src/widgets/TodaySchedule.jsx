import React from "react";
import { Check, X, Clock } from "lucide-react";
import Card from "../shared/ui/Card";
import Badge from "../shared/ui/Badge";
import { formatTime12h, isDueSoon, isOverdue } from "../shared/lib/date";

export default function TodaySchedule({ schedule, onLog, loading }) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-5 w-40 bg-teal-50 rounded mb-4" />
        <div className="h-14 bg-teal-50/70 rounded-xl mb-3" />
        <div className="h-14 bg-teal-50/70 rounded-xl" />
      </Card>
    );
  }

  if (!schedule || schedule.length === 0) {
    return (
      <Card>
        <h3 className="text-lg mb-1">Nothing scheduled today</h3>
        <p className="text-muted text-sm">Add a medicine to start seeing your daily reminders here.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg mb-4">Today's schedule</h3>
      <ul className="flex flex-col gap-3">
        {schedule.map((dose) => {
          const key = `${dose.medicineId}-${dose.time}`;
          const due = dose.status === "pending" && isDueSoon(dose.time);
          const overdue = dose.status === "pending" && isOverdue(dose.time);
          const status = dose.status === "pending" ? (due || overdue ? "due" : "pending") : dose.status;

          return (
            <li
              key={key}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                overdue ? "border-clay-500/40 bg-clay-500/5" : "border-teal-50 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="font-medium text-ink">{dose.name}</p>
                  <p className="text-xs text-muted">
                    {dose.dosage ? `${dose.dosage} · ` : ""}
                    {formatTime12h(dose.time)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge status={status} />
                {dose.status === "pending" && (
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => onLog(dose.medicineId, dose.time, "taken")}
                      title="Mark as taken"
                      className="w-8 h-8 rounded-full bg-success/15 text-success flex items-center justify-center hover:bg-success/25 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => onLog(dose.medicineId, dose.time, "skipped")}
                      title="Skip this dose"
                      className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
