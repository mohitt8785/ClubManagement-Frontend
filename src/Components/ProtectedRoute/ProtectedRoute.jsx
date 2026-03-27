// Components/ProtectedRoute/ProtectedRoute.jsx - PRODUCTION VERSION

import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";

// ── Debug Helper ──
const DEBUG = {
  log: (section, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const color = "color: #4ECDC4; font-weight: bold;";
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
      `%c[${timestamp}] [${section}] ✓ SUCCESS:`,
      color,
      message,
      data ? data : ""
    );
  },
  check: (section, condition, message) => {
    const timestamp = new Date().toLocaleTimeString();
    const color = condition ? "color: #51CF66;" : "color: #FFA94D;";
    const icon = condition ? "✓" : "✗";
    console.log(
      `%c[${timestamp}] [${section}] ${icon}`,
      color + "font-weight: bold;",
      message,
      condition
    );
  },
};

const ProtectedRoute = ({ children, ownerOnly = false, staffOnly = false }) => {
  // ✅ Get auth state
  const { isLoggedIn, isOwner, isStaff, loading, initialized, user } = useAuth();

  // ✅ Add local state to handle re-renders
  const [isReady, setIsReady] = useState(false);
  /** null = permission check not run yet (avoids redirect flash before useEffect runs) */
  const [checksPassed, setChecksPassed] = useState(null);

  DEBUG.log("PROTECTED_ROUTE", "Route evaluation started", {
    initialized,
    loading,
    isLoggedIn,
    ownerOnly,
    staffOnly,
  });

  // ✅ First effect: Wait for context to initialize
  useEffect(() => {
    if (initialized && !loading) {
      DEBUG.log("PROTECTED_ROUTE", "✓ Context initialization confirmed");
      setIsReady(true);
    } else {
      DEBUG.log("PROTECTED_ROUTE", "⏳ Waiting for context...", {
        initialized,
        loading,
      });
    }
  }, [initialized, loading]);

  // ✅ Second effect: Run permission checks only when ready
  useEffect(() => {
    if (!isReady) {
      DEBUG.log("PROTECTED_ROUTE", "Waiting for ready state...");
      return;
    }

    DEBUG.log("PROTECTED_ROUTE", "Running permission checks...", {
      isLoggedIn,
      isOwner,
      isStaff,
    });

    // Check all conditions
    DEBUG.check("PROTECTED_ROUTE", isLoggedIn, "User is logged in");
    DEBUG.check("PROTECTED_ROUTE", !ownerOnly || isOwner, "Owner check passed");
    DEBUG.check("PROTECTED_ROUTE", !staffOnly || isStaff, "Staff check passed");

    if (isLoggedIn) {
      DEBUG.log("PROTECTED_ROUTE", "User details", {
        username: user?.username,
        role: user?.role,
        isOwner,
        isStaff,
      });
    }

    // Perform all checks
    let shouldAllow = true;
    let redirectPath = null;

    if (!isLoggedIn) {
      DEBUG.error("PROTECTED_ROUTE", "User NOT logged in");
      shouldAllow = false;
      redirectPath = "/login";
    } else if (ownerOnly && !isOwner) {
      DEBUG.error("PROTECTED_ROUTE", "Staff tried to access owner-only route");
      shouldAllow = false;
      redirectPath = "/dashboard";
    } else if (staffOnly && !isStaff) {
      DEBUG.error("PROTECTED_ROUTE", "Owner tried to access staff-only route");
      shouldAllow = false;
      redirectPath = "/owner";
    }

    if (shouldAllow) {
      DEBUG.success("PROTECTED_ROUTE", "✓✓✓ ALL CHECKS PASSED ✓✓✓");
    }

    setChecksPassed(shouldAllow);
  }, [isReady, isLoggedIn, isOwner, isStaff, user, ownerOnly, staffOnly]);

  // ✅ WAITING STATE: Show loading while initializing or before permission effect runs
  if (loading || !initialized || !isReady || checksPassed === null) {
    DEBUG.log("PROTECTED_ROUTE", "⏳ LOADING STATE - Showing spinner", {
      loading,
      initialized,
      isReady,
      checksPending: checksPassed === null,
    });

    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06060E",
          color: "rgba(78, 205, 196, 0.8)",
          fontFamily: "'Outfit', sans-serif",
          fontSize: "11px",
          letterSpacing: "4px",
          textTransform: "uppercase",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "2px solid rgba(78, 205, 196, 0.2)",
              borderTopColor: "#4ECDC4",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <div style={{ marginBottom: "12px" }}>Authenticating…</div>
          <div
            style={{
              fontSize: "9px",
              opacity: 0.6,
              fontWeight: "normal",
              letterSpacing: "normal",
            }}
          >
            {loading && "Loading auth state..."}
            {initialized && "Initializing..."}
            {isReady && "Final checks..."}
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ✅ PERMISSION DENIED: Redirect (only after check completed and failed)
  if (checksPassed === false) {
    let redirectPath = "/login";

    if (isLoggedIn) {
      if (ownerOnly && !isOwner) {
        redirectPath = "/dashboard";
      } else if (staffOnly && !isStaff) {
        redirectPath = "/owner";
      }
    }

    DEBUG.error("PROTECTED_ROUTE", `Redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // ✅ PERMISSION GRANTED: Render children
  DEBUG.success("PROTECTED_ROUTE", "✓✓✓ Rendering protected content ✓✓✓");
  return children;
};

export default ProtectedRoute;