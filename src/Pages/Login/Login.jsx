// Pages/Login/Login.jsx - WITH DETAILED DEBUGGING

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";
import { useAuth } from "../../Context/AuthContext.jsx";
import "./Login.css";

// ── Debug Helper ──
const DEBUG = {
  log: (section, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const color = "color: #C9A84C; font-weight: bold;";
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
      `%c[${timestamp}] [${section}] ERROR:`,
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
};

export default function Login() {
  const [role, setRole] = useState("staff");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  const navigate = useNavigate();
  const { login, initialized, loading: authLoading } = useAuth();

  DEBUG.log("LOGIN_COMPONENT", "Component rendered");

  // ✅ IMPROVED: Wait for initialization BEFORE checking stored user
  useEffect(() => {
    DEBUG.log("LOGIN_EFFECT", "useEffect triggered", {
      initialized,
      authLoading
    });

    // ← Animation trigger
    const animTimer = setTimeout(() => {
      setMounted(true);
      DEBUG.log("LOGIN_EFFECT", "Component mounted (animation trigger)");
    }, 80);

    // ← Auth check (only after initialization)
    if (!initialized) {
      DEBUG.log("LOGIN_EFFECT", "⏳ Auth context NOT initialized yet", {
        initialized,
        authLoading,
      });
      setDebugInfo("🔄 Initializing auth context...");
      return () => clearTimeout(animTimer);
    }

    if (authLoading) {
      DEBUG.log("LOGIN_EFFECT", "⏳ Auth context still loading...");
      setDebugInfo("🔄 Loading auth state...");
      return () => clearTimeout(animTimer);
    }

    DEBUG.success(
      "LOGIN_EFFECT",
      "✓ Auth context initialized & loaded",
      { initialized, authLoading }
    );
    setDebugInfo("✓ Auth ready - checking stored user...");

    // ← Check for stored user
    const checkStoredUser = async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      const stored = localStorage.getItem("jc_user");
      DEBUG.log("LOGIN_EFFECT", "localStorage check", {
        hasStoredUser: !!stored,
      });

      if (stored) {
        try {
          const user = JSON.parse(stored);
          DEBUG.success("LOGIN_EFFECT", "User found in localStorage", {
            username: user.username,
            role: user.role,
          });
          setDebugInfo(`✓ User found: ${user.username} (${user.role})`);

          const redirect = user.role === "owner" ? "/owner" : "/dashboard";
          DEBUG.log("LOGIN_EFFECT", `Redirecting to ${redirect}...`);
          setDebugInfo(`📍 Redirecting to ${redirect}...`);

          // ← Use replace to prevent back button issues
          navigate(redirect, { replace: true });
        } catch (err) {
          DEBUG.error("LOGIN_EFFECT", "Failed to parse stored user", err);
          setDebugInfo("❌ Parse error - clearing storage");
          localStorage.removeItem("jc_user");
        }
      } else {
        DEBUG.log("LOGIN_EFFECT", "No stored user found");
        setDebugInfo("ℹ️ No stored user - ready for login");
      }
    };

    checkStoredUser();
    return () => clearTimeout(animTimer);
  }, [navigate, initialized, authLoading]);

  const handleRoleSwitch = (r) => {
    if (r === role) {
      DEBUG.log("ROLE_SWITCH", "Same role selected, ignoring");
      return;
    }
    DEBUG.log("ROLE_SWITCH", `Switching role from ${role} to ${r}`);
    setRole(r);
    setUsername("");
    setPassword("");
    setShowPass(false);
    setDebugInfo(`🔄 Switched to ${r} portal`);
  };

  const showToast = (msg, type) => {
    DEBUG.log("TOAST", `[${type.toUpperCase()}]`, msg);
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
      DEBUG.log("TOAST", "Toast cleared");
    }, 3200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    DEBUG.log("LOGIN_SUBMIT", "Login form submitted", {
      username,
      role,
    });
    setDebugInfo("🔐 Authenticating...");

    setLoading(true);
    try {
      DEBUG.log("LOGIN_SUBMIT", "Sending request to /auth/login", {
        username,
        role,
      });

      const res = await api.post("/auth/login", { username, password });
      const user = res.data.data;

      DEBUG.success("LOGIN_SUBMIT", "Login API successful", {
        username: user.username,
        role: user.role,
      });
      setDebugInfo(`✓ API response received`);

      // ── Role validation ──
      if (user.role !== role) {
        const msg = `This is ${role} portal. Use correct portal.`;
        DEBUG.error("LOGIN_SUBMIT", "Role mismatch", {
          expectedRole: role,
          actualRole: user.role,
        });
        showToast(msg, "error");
        setDebugInfo(`❌ Role mismatch`);
        setLoading(false);
        return;
      }

      DEBUG.log("LOGIN_SUBMIT", "Calling login() to update context...");
      setDebugInfo("🔄 Updating auth context...");

      // ← CRITICAL: Save to localStorage and state
      login(user);

      DEBUG.success("LOGIN_SUBMIT", "Auth context updated", {
        username: user.username,
      });
      setDebugInfo(`✓ Context updated`);

      showToast(
        `Welcome, ${user.username}. Access granted.`,
        "success"
      );
      setDebugInfo(`✓ Welcome message shown`);

      // ← IMPORTANT: Wait for state to propagate before navigating
      // ← This ensures React has processed the state update
      const navigationTimer = setTimeout(() => {
        const redirect = user.role === "owner" ? "/owner" : "/dashboard";
        DEBUG.success("LOGIN_SUBMIT", `Navigation starting to ${redirect}`);
        setDebugInfo(`📍 Navigating to ${redirect}...`);

        // ← Use replace to prevent back button taking user to login again
        navigate(redirect, { replace: true });
      }, 1200); // ← Increased from 900ms to 1200ms for Netlify

      return () => clearTimeout(navigationTimer);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Invalid credentials. Access denied.";
      DEBUG.error("LOGIN_SUBMIT", "Login failed", {
        message: msg,
        status: err.response?.status,
      });
      setDebugInfo(`❌ Login failed: ${msg}`);

      showToast(msg, "error");
      setLoading(false);
    }
  };

  const isOwner = role === "owner";

  return (
    <div
      className={`jc-root ${mounted ? "mounted" : ""} ${isOwner ? "mode-owner" : "mode-staff"
        }`}
    >
      {/* ── DEBUG INFO BOX (Development only) ── */}
      {import.meta.env.DEV && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            background: "rgba(6, 6, 14, 0.95)",
            border: "1px solid #C9A84C",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "11px",
            color: "#C9A84C",
            fontFamily: "'Outfit', monospace",
            maxWidth: "300px",
            zIndex: 9999,
            backdropFilter: "blur(10px)",
            lineHeight: "1.6",
            maxHeight: "200px",
            overflowY: "auto",
            display: "none"
          }}
        >
          <div style={{ marginBottom: "8px", opacity: 0.7 }}>DEBUG INFO:</div>
          <div style={{ fontSize: "10px", opacity: 0.8 }}>
            <div>🔄 Auth Init: {initialized ? "✓" : "✗"}</div>
            <div>⏳ Loading: {authLoading ? "✓" : "✗"}</div>
            <div>📍 Role: {role}</div>
            <div>🔑 User: {username || "—"}</div>
            <hr
              style={{
                border: "none",
                borderTop: "1px solid rgba(201, 168, 76, 0.2)",
                margin: "8px 0",
              }}
            />
            <div style={{ color: "#51CF66" }}>{debugInfo}</div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`jc-toast ${toast ? "show " + toast.type : ""}`}>
        {toast && (
          <>
            <span className="jc-toast-dot" />
            {toast.msg}
          </>
        )}
      </div>


      {/* ══ LEFT PANEL ══ */}
      <div className="jc-left">
        <div className="jc-left-bg" />
        <div className="jc-left-noise" />
        <div className="jc-left-vignette" />
        <div className="jc-lines">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="jc-line"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </div>
        <div className="jc-left-content">
          <div className="jc-est">
            <span className="jc-est-line" />
            <span>Est. 2018</span>
            <span className="jc-est-line" />
          </div>
          <div className="jc-logo-wrap">
            <div className="jc-logo-outer-ring" />
            <div className="jc-logo-inner-ring" />
            <img
              src="/jaguars.png"
              alt="Jaguar Club"
              className="jc-logo-img"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div className="jc-logo-fallback">🐆</div>
          </div>
          <div className="jc-left-name">
            <span className="jc-left-name-sub">The Exclusive</span>
            <h1 className="jc-left-title">
              JAGUAR
              <br />
              CLUB
            </h1>
            <div className="jc-title-ornament">
              <span />◆<span />
            </div>
          </div>
          <p className="jc-tagline">
            Where Every Night
            <br />
            <em>Becomes a Legend</em>
          </p>
          <div className="jc-pills">
            {[
              "Premium Lounge",
              "Live Music",
              "Curated Spirits",
              "VIP Experiences",
            ].map((f) => (
              <span key={f} className="jc-pill">
                {f}
              </span>
            ))}
          </div>
          <div className="jc-addr">
            <div className="jc-addr-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <div>
              <p className="jc-addr-main">SCO 37-40, Oxford Street</p>
              <p className="jc-addr-sub">Zirakpur, Mohali — 140603</p>
            </div>
          </div>
          <div className="jc-contacts">
            {["+91 6280 372744", "+91 6280 382744"].map((num) => (
              <a
                key={num}
                href={`tel:${num.replace(/\s/g, "")}`}
                className="jc-contact"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z" />
                </svg>
                {num}
              </a>
            ))}
          </div>
        </div>
        <div className="jc-left-bar" />
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="jc-right">
        <div className="jc-right-bg" />
        <div className="jc-particles">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="jc-particle"
              style={{
                left: `${10 + ((i * 7) % 80)}%`,
                animationDuration: `${7 + i * 1.1}s`,
                animationDelay: `${i * 0.7}s`,
                width: `${1 + (i % 3)}px`,
                height: `${1 + (i % 3)}px`,
              }}
            />
          ))}
        </div>

        <div className="jc-form-wrap">
          <div className="jc-fc jc-fc--tl" />
          <div className="jc-fc jc-fc--tr" />
          <div className="jc-fc jc-fc--bl" />
          <div className="jc-fc jc-fc--br" />

          {/* ── Role Toggle ── */}
          <div className="jc-toggle">
            <div
              className={`jc-toggle-pill ${isOwner ? "right" : "left"}`}
            />
            <button
              type="button"
              className={`jc-toggle-btn ${!isOwner ? "active" : ""}`}
              onClick={() => handleRoleSwitch("staff")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                width="13"
                height="13"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Staff
            </button>
            <button
              type="button"
              className={`jc-toggle-btn ${isOwner ? "active" : ""}`}
              onClick={() => handleRoleSwitch("owner")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                width="13"
                height="13"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              ADMIN
            </button>
          </div>

          {/* ── Header ── */}
          <div className="jc-right-header">
            <span className="jc-right-badge">
              <span className="jc-badge-dot" />
              {isOwner ? "Admin Portal" : "Staff Portal"}
            </span>
            <h2 className="jc-right-title">
              {isOwner ? "Admin Access" : "Staff Access"}
            </h2>
            <p className="jc-right-sub">
              {isOwner
                ? "Authorized Admin access only"
                : "Enter credentials to manage guest entries"}
            </p>
          </div>

          <div className="jc-divider">
            <span />
            <span className="jc-divider-gem">◈</span>
            <span />
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="jc-form" autoComplete="off">
            <div className="jc-field">
              <label className="jc-label">Username</label>
              <div className="jc-input-wrap">
                <span className="jc-input-ico jc-input-ico--left">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  className="jc-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isOwner ? "Enter username" : "Enter username"}
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="jc-field">
              <label className="jc-label">Password</label>
              <div className="jc-input-wrap">
                <span className="jc-input-ico jc-input-ico--left">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <input
                  className="jc-input"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                  autoComplete="current-password"
                />
                <span
                  className="jc-input-ico jc-input-ico--right"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </span>
              </div>
            </div>

            <button type="submit" className="jc-btn" disabled={loading}>
              <span className="jc-btn-shine" />
              <span className="jc-btn-inner">
                {loading && <span className="jc-spinner" />}
                {loading
                  ? "Authenticating…"
                  : isOwner
                    ? "ADMIN LOGIN ◆"
                    : "STAFF LOGIN ★"}
              </span>
            </button>
          </form>

          {/* Info box */}
          <div className="jc-info-box">
            <span className="jc-info-icon">
              {isOwner ? "🔐" : "ℹ️"}
            </span>
            <p className="jc-info-text">
              {isOwner
                ? "Admin access: Payment reports, daily & monthly analytics, full overview."
                : "Staff access: Entry form, Guest records, and PDF downloads."}
            </p>
          </div>

          <div className="jc-secure">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              width="11"
              height="11"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secured · Authorized Personnel Only
          </div>
        </div>
      </div>
    </div>
  );
}