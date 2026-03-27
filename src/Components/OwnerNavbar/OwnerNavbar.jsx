// Components/OwnerNavbar/OwnerNavbar.jsx
// ✅ Professional Enhanced Version

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import "./OwnerNavbar.css";

export default function OwnerNavbar() {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  return (
    <nav className="on-root">
      {/* ── Left: Logo & Brand ── */}
      <div className="on-left" onClick={() => navigate("/owner-dashboard")} style={{ cursor: 'pointer' }}>
        <div className="on-logo-wrap">
          <img
            src="/jaguars.png"
            alt="Jaguar Club"
            className="on-logo-img"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="on-logo-fallback">🐆</div>
        </div>
        <div className="on-brand">
          <span className="on-brand-name">JAGUAR CLUB</span>
          <span className="on-brand-sub">◆ Zirakpur, Mohali</span>
        </div>
      </div>

      {/* ── Center: Status Badge (Optional) ── */}
      <div className="on-center">
        <div className="on-badge">
          <span className="on-badge-dot" />
          OWNER PANEL
        </div>
      </div>

      {/* ── Right: Actions ── */}
      <div className="on-right">
        {/* Live Status */}
        <div
          className="on-live"
          onClick={() => navigate("/dashboard")}
          style={{ cursor: 'pointer' }}
          title="Switch to Live View"
        >
          <span className="on-live-dot" />
          LIVE
        </div>

        {/* User Dropdown */}
        <div className="on-user-wrapper" style={{ position: 'relative' }} ref={dropdownRef}>
          <div
            className="on-user"
            onClick={() => setOpenMenu((p) => !p)}
            title={user?.username || "Owner"}
          >
            <span className="on-user-icon">◆</span>
            <span className="on-user-name">
              {user?.username || "OWNER"}
            </span>
          </div>

          {/* Dropdown Menu */}
          {openMenu && (
            <div className="on-dropdown">
              <button onClick={() => {
                navigate("/owner-dashboard");
                setOpenMenu(false);
              }}>
                <span style={{ marginRight: '8px' }}>🏠</span>
                Dashboard
              </button>
              <button onClick={() => {
                navigate("/entries");
                setOpenMenu(false);
              }}>
                <span style={{ marginRight: '8px' }}>📋</span>
                All Entries
              </button>
              <button onClick={() => {
                navigate("/settings");
                setOpenMenu(false);
              }}>
                <span style={{ marginRight: '8px' }}>⚙️</span>
                Settings
              </button>
              <button onClick={() => {
                logout();
                setOpenMenu(false);
              }} style={{ color: 'rgba(224,82,82,0.9)' }}>
                <span style={{ marginRight: '8px' }}>↪</span>
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Quick Logout Button (Hidden on mobile) */}
        <button
          className="on-logout"
          onClick={logout}
          title="Logout"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            width="14"
            height="14"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          LOGOUT
        </button>
      </div>
    </nav>
  );
}