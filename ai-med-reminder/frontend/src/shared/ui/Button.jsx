import React from "react";

const VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
};

export default function Button({ variant = "primary", className = "", children, ...props }) {
  const classes = `${VARIANTS[variant] || VARIANTS.primary} ${className}`;
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
