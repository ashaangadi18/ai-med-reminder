import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pill } from "lucide-react";
import Input from "../shared/ui/Input";
import Button from "../shared/ui/Button";
import PulseDivider from "../shared/ui/PulseDivider";
import { useAuth } from "../app/providers/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't log you in. Please check your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-teal-50/60 to-paper">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white mb-3">
            <Pill size={22} />
          </div>
          <h1 className="text-3xl">Welcome back</h1>
          <p className="text-muted text-sm mt-1">Log in to keep your medicine schedule on track.</p>
        </div>

        <PulseDivider className="text-teal-200 mb-6" />

        <div className="card">
          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
            {error && <p className="text-clay-600 text-sm mb-3">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-5">
          New to MediMind?{" "}
          <Link to="/register" className="text-teal-600 font-medium hover:text-teal-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
