// Context/AuthContext.jsx - PRODUCTION VERSION (Netlify + Render ready)

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

// ── Debug Helper ──
const DEBUG = {
  log: (section, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const color = "color: #A78BFA; font-weight: bold;";
    console.log(
      `%c[${timestamp}] [${section}]`,
      color,
      message,
      data ? data : ""
    );
  },
  error: (section, message, error = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const color = "color: #FF6B6B; font-weight: bold;";
    console.error(
      `%c[${timestamp}] [${section}] ❌`,
      color,
      message,
      error ? error : ""
    );
  },
  success: (section, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const color = "color: #51CF66; font-weight: bold;";
    console.log(
      `%c[${timestamp}] [${section}] ✓`,
      color,
      message,
      data ? data : ""
    );
  },
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // ← Use ref to track if initialization already started
  const initStartedRef = useRef(false);

  DEBUG.log("AUTH_CONTEXT", "Provider mounted - starting initialization");

  // ── On mount — localStorage se user lo ──
  useEffect(() => {
    // ✅ Prevent double initialization (React strict mode)
    if (initStartedRef.current) {
      DEBUG.log("AUTH_CONTEXT", "Initialization already started, skipping...");
      return;
    }
    initStartedRef.current = true;

    DEBUG.log("AUTH_CONTEXT", "useEffect triggered - checking localStorage");

    const checkAuth = async () => {
      try {
        // ← Small delay to ensure storage is ready
        await new Promise(resolve => setTimeout(resolve, 50));

        const stored = localStorage.getItem("jc_user");

        if (stored) {
          DEBUG.log("AUTH_CONTEXT", "Found stored user data", {
            dataLength: stored.length,
          });

          try {
            const userData = JSON.parse(stored);
            DEBUG.success("AUTH_CONTEXT", "Parsed stored user", {
              username: userData.username,
              role: userData.role,
              id: userData.id,
            });

            setUser(userData);
            DEBUG.log("AUTH_CONTEXT", "User state updated with stored data");
          } catch (parseErr) {
            DEBUG.error(
              "AUTH_CONTEXT",
              "Failed to parse stored user - clearing storage",
              parseErr.message
            );
            localStorage.removeItem("jc_user");
            setUser(null);
          }
        } else {
          DEBUG.log("AUTH_CONTEXT", "No stored user found in localStorage");
          setUser(null);
        }
      } catch (err) {
        DEBUG.error(
          "AUTH_CONTEXT",
          "Unexpected error during auth check",
          err.message
        );
      } finally {
        // ── Mark as ready ──
        DEBUG.log("AUTH_CONTEXT", "Setting loading=false and initialized=true");

        // ← Use small timeout to ensure React batching
        setTimeout(() => {
          setLoading(false);
          setInitialized(true);
          DEBUG.success("AUTH_CONTEXT", "✓✓✓ Initialization COMPLETE ✓✓✓");
        }, 0);
      }
    };

    checkAuth();
  }, []);

  // ── Login ──
  const login = useCallback((userData) => {
    DEBUG.log("AUTH_CONTEXT", "login() called", {
      username: userData.username,
      role: userData.role,
    });

    try {
      // ← CRITICAL: Update localStorage FIRST, then state
      localStorage.setItem("jc_user", JSON.stringify(userData));
      DEBUG.log("AUTH_CONTEXT", "User saved to localStorage");

      setUser(userData);
      DEBUG.success("AUTH_CONTEXT", "User state updated");
    } catch (err) {
      DEBUG.error(
        "AUTH_CONTEXT",
        "Error in login() function",
        err.message
      );
    }
  }, []);

  // ── Logout ──
  const logout = useCallback(async () => {
    DEBUG.log("AUTH_CONTEXT", "logout() called");

    try {
      // ← Clear state
      setUser(null);
      DEBUG.log("AUTH_CONTEXT", "User state cleared");

      // ← Clear localStorage
      localStorage.removeItem("jc_user");
      DEBUG.success("AUTH_CONTEXT", "User removed from localStorage");

      // ← Redirect
      DEBUG.log("AUTH_CONTEXT", "Redirecting to /login");
      window.location.href = "/login";
    } catch (err) {
      DEBUG.error(
        "AUTH_CONTEXT",
        "Error in logout() function",
        err.message
      );
      window.location.href = "/login";
    }
  }, []);

  // ── Helpers ──
  const isOwner = user?.role === "owner";
  const isStaff = user?.role === "staff";
  const isLoggedIn = !!user;

  // ── Log context state changes ──
  useEffect(() => {
    DEBUG.log("AUTH_CONTEXT", "Context state updated", {
      initialized,
      loading,
      isLoggedIn,
      userRole: user?.role || "none",
      username: user?.username || "none",
    });
  }, [initialized, loading, user, isLoggedIn]);

  const contextValue = {
    user,
    loading,
    initialized,
    login,
    logout,
    isOwner,
    isStaff,
    isLoggedIn,
  };

  DEBUG.log("AUTH_CONTEXT", "Providing context value", {
    initialized,
    loading,
    isLoggedIn,
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Custom Hook ──
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    DEBUG.error(
      "USE_AUTH_HOOK",
      "useAuth called outside of AuthProvider!",
      "Make sure your component is wrapped with <AuthProvider>"
    );
    throw new Error(
      "useAuth must be used inside AuthProvider - wrap your app with <AuthProvider>"
    );
  }

  DEBUG.log("USE_AUTH_HOOK", "Hook called", {
    initialized: ctx.initialized,
    loading: ctx.loading,
    isLoggedIn: ctx.isLoggedIn,
  });

  return ctx;
};

export default AuthContext;