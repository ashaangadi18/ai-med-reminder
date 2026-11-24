import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pill } from "lucide-react";
import Input from "../shared/ui/Input";
import Button from "../shared/ui/Button";
import PulseDivider from "../shared/ui/PulseDivider";
import { useAuth } from "../app/providers/AuthProvider";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create your account. Please try again.");
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
          <h1 className="text-3xl">Create your account</h1>
          <p className="text-muted text-sm mt-1">Never miss a dose again.</p>
        </div>

        <PulseDivider className="text-teal-200 mb-6" />

        <div className="card">
          <form onSubmit={handleSubmit}>
            <Input
              label="Full name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
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
              placeholder="At least 6 characters"
            />
            {error && <p className="text-clay-600 text-sm mb-3">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-600 font-medium hover:text-teal-700">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
