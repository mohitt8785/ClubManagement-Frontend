// Pages/OwnerDashboard/OwnerDashboard.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import OwnerNavbar from "../../Components/OwnerNavbar/OwnerNavbar";
import DailyReport from "../DailyReport/DailyReport";
import MonthlyReport from "../MonthlyReport/MonthlyReport";
import "./OwnerDashboard.css";

function LiveClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <div className="od-clock">
            <span className="od-clock-time">
                {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
            </span>
            <span className="od-clock-date">
                {now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
        </div>
    );
}

export default function OwnerDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [newStaff, setNewStaff] = useState({ username: "", password: "", name: "" });
    const [staffMsg, setStaffMsg] = useState(null);
    const [creatingStaff, setCreatingStaff] = useState(false);
    const navigate = useNavigate();

    const fetchStats = useCallback(async () => {
        try {
            setLoadingStats(true);
            const today = new Date().toISOString().split("T")[0];
            const res = await api.get(`/reports/daily?date=${today}`);

            if (res.data.success)
                setStats(res.data.data);
            console.log(res.data);

        } catch {
            // silent   
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setCreatingStaff(true);
        try {
            const res = await api.post("/auth/create-user", { ...newStaff, role: "staff" });
            if (res.data.success) {
                setStaffMsg({ type: "success", text: `Staff '${newStaff.username}' created!` });
                setNewStaff({ username: "", password: "", name: "" });
            }
        } catch (err) {
            setStaffMsg({ type: "error", text: err.response?.data?.message || "Failed to create staff" });
        } finally {
            setCreatingStaff(false);
            setTimeout(() => setStaffMsg(null), 3000);
        }
    };

    const tabs = [
        { id: "overview", label: "Overview", icon: "◈" },
        { id: "daily", label: "Daily Report", icon: "📅" },
        { id: "monthly", label: "Monthly Report", icon: "📆" },
        { id: "staff", label: "Staff Management", icon: "👤" },
    ];

    return (
        <div className="od-root">
            <OwnerNavbar />
            <div className="od-wrap">

                <div className="od-header">
                    <div className="od-header-left">
                        <span className="od-header-eyebrow">Jaguar Club · Owner Portal</span>
                        <h1 className="od-header-title">Owner Dashboard</h1>
                        <span className="od-header-sub">Full analytics & management access</span>
                    </div>
                    <LiveClock />
                </div>

                <div className="od-tabs">
                    {tabs.map(tab => (
                        <button key={tab.id}
                            className={`od-tab ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}>
                            <span className="od-tab-icon">{tab.icon}</span>
                            <span>{tab.label}</span>
                            {activeTab === tab.id && <span className="od-tab-bar" />}
                        </button>
                    ))}
                </div>

                <div className="od-content">

                    {/* ── OVERVIEW ── */}
                    {activeTab === "overview" && (
                        <div className="od-overview">
                            {loadingStats ? (
                                <div className="od-loading">Loading stats…</div>
                            ) : stats ? (
                                <>
                                    <div className="od-stats-grid">
                                        <div className="od-stat-card od-stat--gold">
                                            <span className="od-stat-label">Today's Revenue</span>
                                            <span className="od-stat-value">₹{stats.payments?.grandTotal?.toLocaleString() || 0}</span>
                                            <span className="od-stat-sub">Total collected</span>
                                        </div>
                                        <div className="od-stat-card">
                                            <span className="od-stat-label">Total Guests</span>
                                            <span className="od-stat-value">{stats.pax?.totalPeople || 0}</span>
                                            <span className="od-stat-sub">Today's entries</span>
                                        </div>
                                        <div className="od-stat-card">
                                            <span className="od-stat-label">Total Entries</span>
                                            <span className="od-stat-value">{stats.entryCount || 0}</span>
                                            <span className="od-stat-sub">Groups / bookings</span>
                                        </div>
                                    </div>

                                    <div className="od-section">
                                        <h3 className="od-section-title">
                                            <span className="od-section-gem">◆</span> Payment Breakdown
                                        </h3>
                                        <div className="od-breakdown-grid">
                                            <div className="od-breakdown-card od-pay--cash">
                                                <span className="od-breakdown-label">💵 Cash</span>
                                                <span className="od-breakdown-value">₹{stats.payments?.cash?.toLocaleString() || 0}</span>
                                            </div>
                                            <div className="od-breakdown-card od-pay--upi">
                                                <span className="od-breakdown-label">📱 UPI</span>
                                                <span className="od-breakdown-value">₹{stats.payments?.upi?.toLocaleString() || 0}</span>
                                            </div>
                                            <div className="od-breakdown-card od-pay--card">
                                                <span className="od-breakdown-label">💳 Card</span>
                                                <span className="od-breakdown-value">₹{stats.payments?.card?.toLocaleString() || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="od-section">
                                        <h3 className="od-section-title">
                                            <span className="od-section-gem">◆</span> Guest Breakdown
                                        </h3>
                                        <div className="od-breakdown-grid">
                                            <div className="od-breakdown-card">
                                                <span className="od-breakdown-label">👥 Pax</span>
                                                <span className="od-breakdown-value">{stats.pax?.pax || 0}</span>
                                            </div>

                                            <div className="od-breakdown-card">
                                                <span className="od-breakdown-label">👨 Stag Male</span>
                                                <span className="od-breakdown-value">{stats.pax?.stagMale || 0}</span>
                                            </div>
                                            <div className="od-breakdown-card">
                                                <span className="od-breakdown-label">👩 Stag Female</span>
                                                <span className="od-breakdown-value">{stats.pax?.stagFemale || 0}</span>
                                            </div>
                                            <div className="od-breakdown-card">
                                                <span className="od-breakdown-label">👫 Couple-[2]</span>
                                                <span className="od-breakdown-value">{stats.pax?.couple || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="od-section">
                                        <h3 className="od-section-title">
                                            <span className="od-section-gem">◆</span> Quick Access
                                        </h3>
                                        <div className="od-quick-grid">
                                            <button className="od-quick-btn" onClick={() => navigate("/entries")}>
                                                📋 All Entries
                                            </button>
                                            <button className="od-quick-btn" onClick={() => setActiveTab("daily")}>
                                                📅 Daily Report
                                            </button>
                                            <button className="od-quick-btn" onClick={() => setActiveTab("monthly")}>
                                                📆 Monthly Report
                                            </button>
                                            <button className="od-quick-btn" onClick={() => setActiveTab("staff")}>
                                                👤 Add Staff
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="od-loading">No data available</div>
                            )}
                        </div>
                    )}

                    {activeTab === "daily" && <DailyReport />}
                    {activeTab === "monthly" && <MonthlyReport />}

                    {/* ── STAFF ── */}
                    {activeTab === "staff" && (
                        <div className="od-staff">
                            <div className="od-staff-card">
                                <h3 className="od-staff-title">Create New Staff Account</h3>
                                <p className="od-staff-sub">Staff will have access to entry form and guest records.</p>

                                {staffMsg && (
                                    <div className={`od-staff-msg ${staffMsg.type}`}>
                                        {staffMsg.text}
                                    </div>
                                )}

                                <form onSubmit={handleCreateStaff} className="od-staff-form">
                                    <div className="od-field">
                                        <label className="od-label">Full Name</label>
                                        <input className="od-input" type="text"
                                            placeholder="Staff full name"
                                            value={newStaff.name}
                                            onChange={e => setNewStaff(p => ({ ...p, name: e.target.value }))} />
                                    </div>
                                    <div className="od-field">
                                        <label className="od-label">Username <span style={{ color: "#C9A84C" }}>*</span></label>
                                        <input className="od-input" type="text"
                                            placeholder="@staff_username"
                                            value={newStaff.username} required
                                            onChange={e => setNewStaff(p => ({ ...p, username: e.target.value }))} />
                                    </div>
                                    <div className="od-field">
                                        <label className="od-label">Password <span style={{ color: "#C9A84C" }}>*</span></label>
                                        <input className="od-input" type="password"
                                            placeholder="Strong password"
                                            value={newStaff.password} required
                                            onChange={e => setNewStaff(p => ({ ...p, password: e.target.value }))} />
                                    </div>
                                    <button type="submit" className="od-create-btn" disabled={creatingStaff}>
                                        {creatingStaff ? "Creating…" : "◆ Create Staff Account"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}