/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF7F0",
        ink: "#1E2A28",
        muted: "#6E7E7B",
        teal: {
          50: "#EAF3F1",
          100: "#CFE4E0",
          300: "#7FB3AC",
          500: "#2C6E68",
          600: "#215753",
          700: "#193F3D",
          900: "#0F2624",
        },
        clay: {
          400: "#EC8B62",
          500: "#E1704A",
          600: "#C25A38",
        },
        success: "#4C9A6A",
        warn: "#D99A3D",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(15, 38, 36, 0.18)",
        card: "0 2px 10px -4px rgba(15, 38, 36, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        pulseLine: {
          "0%, 100%": { strokeDashoffset: "0" },
          "50%": { strokeDashoffset: "40" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseLine: "pulseLine 3s linear infinite",
        fadeUp: "fadeUp 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
