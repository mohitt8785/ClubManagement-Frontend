// Context/AuthContext.jsx - FIXED VERSION FOR PRODUCTION

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false); // ← NEW: Track initialization

  // ── On mount — localStorage se user lo ──
  useEffect(() => {
    console.log("[AuthContext] Initializing..."); // Debug log
    
    const stored = localStorage.getItem("jc_user");
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        console.log("[AuthContext] User found:", userData.username); // Debug log
        setUser(userData);
      } catch (err) {
        console.error("[AuthContext] Parse error:", err);
        localStorage.removeItem("jc_user");
      }
    } else {
      console.log("[AuthContext] No user in storage"); // Debug log
    }
    
    // ✅ Wait a tick then mark as initialized
    setTimeout(() => {
      setLoading(false);
      setInitialized(true);
    }, 0);
  }, []);

  // ── Login ──
  const login = useCallback((userData) => {
    console.log("[AuthContext] Login:", userData.username);
    setUser(userData);
    localStorage.setItem("jc_user", JSON.stringify(userData));
  }, []);

  // ── Logout ──
  const logout = useCallback(async () => {
    console.log("[AuthContext] Logout");
    setUser(null);
    localStorage.removeItem("jc_user");
    window.location.href = "/login";
  }, []);

  // ── Helpers ──
  const isOwner = user?.role === "owner";
  const isStaff = user?.role === "staff";
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        login,
        logout,
        isOwner,
        isStaff,
        isLoggedIn,
      }}
    >
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