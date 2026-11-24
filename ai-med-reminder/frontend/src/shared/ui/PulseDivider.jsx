import React from "react";

// MediMind's signature visual motif: a calm heartbeat line that ties the
// "medicine" and "vitals" ideas together without leaning on generic clip art.
export default function PulseDivider({ className = "" }) {
  return (
    <svg
      className={`pulse-divider text-teal-300 ${className}`}
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 12 H140 L155 2 L170 22 L185 6 L198 12 H400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 4"
        className="animate-pulseLine"
      />
    </svg>
  );
}
