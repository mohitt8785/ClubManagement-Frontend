import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("jaguarclub_auth");
      navigate("/login");
    }, 600);
  };

  return (
    <nav className="nb-nav">
      <div className="nb-container">

        {/* ── LEFT: Logo block ── */}
        <div className="nb-left">
          <div className="nb-logo-img-wrap">
            <img
              src="/jaguars.png"
              alt="Jaguar Club"
              className="nb-logo-img"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <span className="nb-logo-fallback" style={{ display: "none" }}>🐆</span>
          </div>

          <div className="nb-divider-v" />

          <div className="nb-brand">
            <span className="nb-brand-name">JAGUAR CLUB</span>
            <span className="nb-brand-loc">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2"/>
              </svg>
              Zirakpur, Mohali
            </span>
          </div>
        </div>

        {/* ── CENTER: pill ── */}
        <div className="nb-center">
          <div className="nb-center-pill">
            <span className="nb-pill-gem">◆</span>
            <span className="nb-pill-text">Entry Management</span>
            <span className="nb-pill-gem">◆</span>
          </div>
        </div>

        {/* ── RIGHT: Status + Logout ── */}
        <div className="nb-right">
          <div className="nb-status">
            <span className="nb-status-dot" />
            <span className="nb-status-label">Live</span>
          </div>

          <div className="nb-divider-v" />

          <button
            className={"nb-logout" + (loggingOut ? " out" : "")}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {loggingOut ? "Leaving…" : "Logout"}
          </button>
        </div>

      </div>
      <div className="nb-shimmer" />
    </nav>
  );
}