import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import "./OwnerNavbar.css";

export default function OwnerNavbar() {
  const { user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="on-root">
      {/* Left — Logo */}
      <div className="on-left">
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

      {/* Right */}
      <div className="on-right">
        <div className="on-live">
          <span className="on-live-dot" />
          LIVE
        </div>

        {/* User Dropdown Trigger */}
        <div
          className="on-user"
          onClick={() => setOpenMenu((p) => !p)}
        >
          <span className="on-user-icon">◆</span>
          <span className="on-user-name">
            {user?.username || "Owner"}
          </span>
        </div>

        {/* Dropdown */}
        {openMenu && (
          <div className="on-dropdown">
            <button onClick={() => navigate("/settings")}>
              Change Password
            </button>
            <button onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}