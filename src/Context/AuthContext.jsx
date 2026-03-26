// context/AuthContext.jsx

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // initial check

  // ── On mount — localStorage se user lo ──
  useEffect(() => {
    const stored = localStorage.getItem("jc_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("jc_user");
      }
    }
    setLoading(false);
  }, []);

  // ── Login ──
  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("jc_user", JSON.stringify(userData));
  }, []);

  // ── Logout ──
const logout = useCallback(async () => {
  localStorage.removeItem("jc_user");  // ← SABSE PEHLE
  setUser(null);                        // ← React state clear
  try {
    await api.post("/auth/logout");     // ← Cookie clear
  } catch {
    // ignore
  } finally {
    window.location.href = "/login";    // ← Ab redirect
  }
}, []);


  // ── Helpers ──
  const isOwner = user?.role === "owner";
  const isStaff = user?.role === "staff";
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isOwner,
      isStaff,
      isLoggedIn,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Custom Hook ──
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export default AuthContext;