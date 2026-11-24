import React from "react";

export default function Input({ label, error, className = "", ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="label-text">{label}</label>}
      <input className={`input-field ${error ? "border-clay-500" : ""} ${className}`} {...props} />
      {error && <p className="text-clay-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
