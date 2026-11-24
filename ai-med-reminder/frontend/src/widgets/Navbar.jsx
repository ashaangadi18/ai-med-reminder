import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ScanLine, LogOut, Pill } from "lucide-react";
import { useAuth } from "../app/providers/AuthProvider";

const linkBase =
  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur border-b border-teal-100/60">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white">
            <Pill size={18} />
          </div>
          <span className="font-display text-xl text-teal-900 tracking-tight">MediMind</span>
        </div>

        <nav className="hidden sm:flex items-center gap-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? "bg-teal-500 text-white" : "text-teal-700 hover:bg-teal-50"}`
            }
          >
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink
            to="/prescriptions"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? "bg-teal-500 text-white" : "text-teal-700 hover:bg-teal-50"}`
            }
          >
            <ScanLine size={16} /> Prescriptions
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-muted">Hi, {user?.name?.split(" ")[0]}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-teal-700 hover:text-clay-600 transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </div>
    </header>
  );
}
