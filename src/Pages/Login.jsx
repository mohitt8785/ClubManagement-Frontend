import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const USER_NAME = import.meta.env.VITE_USER_NAME;
const USER_PASSWORD = import.meta.env.VITE_PASSWORD;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
  }, []);

  const navigate = useNavigate();

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (username === USER_NAME && password === USER_PASSWORD) {
        localStorage.setItem("jaguarclub_auth", "true");
        showToast("Welcome back. Access granted.", "success");
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        showToast("Invalid credentials. Access denied.", "error");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className={`jc-root ${mounted ? "mounted" : ""}`}>

      {/* ── Toast ── */}
      <div className={`jc-toast ${toast ? "show " + toast.type : ""}`}>
        {toast && <><span className="jc-toast-dot" />{toast.msg}</>}
      </div>

      {/* ══════════════════ LEFT PANEL ══════════════════ */}
      <div className="jc-left">
        {/* Background layers */}
        <div className="jc-left-bg" />
        <div className="jc-left-noise" />
        <div className="jc-left-vignette" />

        {/* Animated lines */}
        <div className="jc-lines">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="jc-line" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </div>

        {/* Content */}
        <div className="jc-left-content">

          {/* Top badge */}
          <div className="jc-est">
            <span className="jc-est-line" />
            <span>Est. 2024</span>
            <span className="jc-est-line" />
          </div>

          {/* Logo */}
          <div className="jc-logo-wrap">
            <div className="jc-logo-outer-ring" />
            <div className="jc-logo-inner-ring" />
            <img
              src="/jaguars.png"
              alt="Jaguar Club"
              className="jc-logo-img"
              onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
            />
            <div className="jc-logo-fallback">🐆</div>
          </div>

          {/* Club name */}
          <div className="jc-left-name">
            <span className="jc-left-name-sub">The Exclusive</span>
            <h1 className="jc-left-title">JAGUAR<br />CLUB</h1>
            <div className="jc-title-ornament">
              <span />◆<span />
            </div>
          </div>

          {/* Tagline */}
          <p className="jc-tagline">
            Where Every Night<br />
            <em>Becomes a Legend</em>
          </p>

          {/* Feature pills */}
          <div className="jc-pills">
            {["Premium Lounge", "Live Music", "Curated Spirits", "VIP Experiences"].map((f) => (
              <span key={f} className="jc-pill">{f}</span>
            ))}
          </div>

          {/* Address block */}
          <div className="jc-addr">
            <div className="jc-addr-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
            </div>
            <div>
              <p className="jc-addr-main">SCO 37-40, Oxford Street</p>
              <p className="jc-addr-sub">Zirakpur, Mohali — 140603</p>
            </div>
          </div>

          <div className="jc-contacts">
            <a href="tel:+916280372744" className="jc-contact">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z" /></svg>
              +91 6280 372744
            </a>
            <a href="tel:+916280382744" className="jc-contact">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z" /></svg>
              +91 6280 382744
            </a>
          </div>
        </div>

        {/* Bottom gold bar */}
        <div className="jc-left-bar" />
      </div>

      {/* ══════════════════ RIGHT PANEL ══════════════════ */}
      <div className="jc-right">
        <div className="jc-right-bg" />

        {/* Particles */}
        <div className="jc-particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="jc-particle" style={{
              left: `${10 + Math.random() * 80}%`,
              animationDuration: `${7 + i * 1.1}s`,
              animationDelay: `${i * 0.7}s`,
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
            }} />
          ))}
        </div>

        {/* Form card */}
        <div className="jc-form-wrap">

          {/* Card corner brackets */}
          <div className="jc-fc jc-fc--tl" /><div className="jc-fc jc-fc--tr" />
          <div className="jc-fc jc-fc--bl" /><div className="jc-fc jc-fc--br" />

          {/* Right header — small */}
          <div className="jc-right-header">
            <span className="jc-right-badge">★ Members Only</span>
            <h2 className="jc-right-title">Staff Access Portal</h2>
            <p className="jc-right-sub">Enter your credentials to continue</p>
          </div>

          <div className="jc-divider">
            <span /><span className="jc-divider-gem">◈</span><span />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="jc-form" autoComplete="off">

            <div className="jc-field">
              <label className="jc-label">Username</label>
              <div className="jc-input-wrap">
                <span className="jc-input-ico jc-input-ico--left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  className="jc-input"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="@username"
                  required
                  autoFocus
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="jc-field">
              <label className="jc-label">Password</label>
              <div className="jc-input-wrap">
                <span className="jc-input-ico jc-input-ico--left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <input
                  className="jc-input"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                  // autoComplete="new-password"
                />
                <span className="jc-input-ico jc-input-ico--right" onClick={() => setShowPass(!showPass)}>
                  {showPass
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" /></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  }
                </span>
              </div>
            </div>

            <button type="submit" className="jc-btn" disabled={loading}>
              <span className="jc-btn-shine" />
              <span className="jc-btn-inner">
                {loading && <span className="jc-spinner" />}
                {loading ? "Authenticating…" : "Enter The Club ★"}
              </span>
            </button>
          </form>

          {/* Security note */}
          <div className="jc-secure">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="12" height="12">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Secured · Authorized Personnel Only
          </div>
        </div>
      </div>

    </div>
  );
}