import React from "react";

const STYLES = {
  pending: "bg-teal-50 text-teal-700",
  taken: "bg-success/15 text-success",
  missed: "bg-clay-500/15 text-clay-600",
  skipped: "bg-warn/15 text-warn",
  due: "bg-clay-500/15 text-clay-600 animate-pulse",
};

const LABELS = {
  pending: "Upcoming",
  taken: "Taken",
  missed: "Missed",
  skipped: "Skipped",
  due: "Due now",
};

export default function Badge({ status = "pending" }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STYLES[status]}`}>
      {LABELS[status] || status}
    </span>
  );
}
