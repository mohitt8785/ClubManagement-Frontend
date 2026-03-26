import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";
import "./ChangePassword.css";
import Navbar from "../../Components/OwnerNavbar/OwnerNavbar.jsx";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setStatus(null);
    setErrorMsg("");
  };

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setStatus("error");
      setErrorMsg("New passwords do not match.");
      return;
    }
    if (form.newPassword.length < 6) {
      setStatus("error");
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setStatus("success");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const strengthClass =
    form.newPassword.length === 0 ? "" :
    form.newPassword.length < 6   ? "weak" :
    form.newPassword.length < 10  ? "medium" : "strong";

  const strengthLabel =
    form.newPassword.length === 0 ? "" :
    form.newPassword.length < 6   ? "Weak" :
    form.newPassword.length < 10  ? "Medium" : "Strong";

  return (
    <>
    <Navbar />
    <div className="cp-root">
      <div className="cp-card">

        <div className="cp-header">
          {/* flex row: diamond + title + spacer + close */}
          <div className="cp-header-top">
            <span className="cp-diamond">◆</span>
            <h1 className="cp-title">Change Password</h1>
            <div className="cp-header-spacer" />
          </div>
            <button className="cp-close" onClick={() => navigate(-1)} title="Close">
              ✕
            </button>
          {/* <p className="cp-subtitle">Update your account credentials securely</p> */}
        </div>

        <form className="cp-form" onSubmit={handleSubmit}>

          <div className="cp-field">
            <label className="cp-label">Current Password</label>
            <div className="cp-input-wrap">
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="cp-input"
                required
                autoComplete="current-password"
              />
              <button type="button" className="cp-eye" onClick={() => toggleShow("current")} tabIndex={-1}>
                {showPasswords.current ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="cp-field">
            <label className="cp-label">New Password</label>
            <div className="cp-input-wrap">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="cp-input"
                required
                autoComplete="new-password"
              />
              <button type="button" className="cp-eye" onClick={() => toggleShow("new")} tabIndex={-1}>
                {showPasswords.new ? "🙈" : "👁️"}
              </button>
            </div>
            {form.newPassword && (
              <div className="cp-strength">
                <div className={`cp-strength-bar ${strengthClass}`} />
                <span className="cp-strength-label">{strengthLabel}</span>
              </div>
            )}
          </div>

          <div className="cp-field">
            <label className="cp-label">Confirm New Password</label>
            <div className="cp-input-wrap">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="cp-input"
                required
                autoComplete="new-password"
              />
              <button type="button" className="cp-eye" onClick={() => toggleShow("confirm")} tabIndex={-1}>
                {showPasswords.confirm ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {status === "error" && (
            <div className="cp-alert error">⚠ {errorMsg}</div>
          )}
          {status === "success" && (
            <div className="cp-alert success">◆ Password changed successfully!</div>
          )}

          <button type="submit" className="cp-btn" disabled={loading}>
            {loading ? <span className="cp-spinner" /> : <>◆ Update Password</>}
          </button>

        </form>
      </div>
    </div>
    </>
  );
}