import React, { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../../shared/api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("medimind_user");
    const savedToken = localStorage.getItem("medimind_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const { data } = await axiosClient.post("/auth/login", { email, password });
    localStorage.setItem("medimind_token", data.token);
    localStorage.setItem("medimind_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const { data } = await axiosClient.post("/auth/register", { name, email, password });
    localStorage.setItem("medimind_token", data.token);
    localStorage.setItem("medimind_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("medimind_token");
    localStorage.removeItem("medimind_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
