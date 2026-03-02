import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar/Navbar";
import EntryForm from "../Components/EntryForm/EntryForm";
import AllEntries from "../Components/AllEntries/AllEntries";
import "./Dashboard.css";

const API_URL = `${import.meta.env.VITE_API_URL}/entries`;

// ✅ Clock moved to separate component — no more full Dashboard re-render!
function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const formatDate = (date) =>
    date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      <div className="db-stat">
        <span className="db-stat-value">{formatTime(currentTime)}</span>
        <span className="db-stat-label">Current Time</span>
      </div>
      <div className="db-stat">
        <span className="db-stat-value">{formatDate(currentTime)}</span>
        <span className="db-stat-label">Today's Date</span>
      </div>
    </>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("form");
  const [refresh, setRefresh] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);

  // ✅ useCallback — function recreate nahi hoga baar baar
  const fetchTotalGuests = useCallback(async () => {
    try {
      const res = await axios.get(API_URL);
      if (res.data.success) {
        setTotalGuests(res.data.count); // ✅ .length ki jagah .count use karo
      }
    } catch (err) {
      // silent fail
    }
  }, []);

  useEffect(() => {
    fetchTotalGuests();
  }, [refresh, fetchTotalGuests]);

  const handleEntryAdded = () => {
    setTimeout(() => {
      setRefresh((prev) => prev + 1);
      setActiveTab("entries");
    }, 1500); // ✅ 2s se 1.5s kiya
  };

  return (
    <div className="db-root">
      <Navbar />

      <div className="db-wrap">

        {/* ── Header ── */}
        <div className="db-header">
          <div className="db-header-inner">
            <div className="db-header-left">
              <div className="db-header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <div className="db-header-text">
                <span className="db-header-eyebrow">Jaguar Club · Staff Portal</span>
                <h1 className="db-header-title">Entry Dashboard</h1>
                <span className="db-header-sub">Manage guest access and records</span>
              </div>
            </div>

            <div className="db-header-right">
              {/* ✅ Clock alag component mein */}
              <LiveClock />

              {/* Total Guests */}
              <div className="db-stat">
                <span className="db-stat-value">{totalGuests}</span>
                <span className="db-stat-label">Total Guests</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="db-tabs">
          <button
            className={"db-tab" + (activeTab === "form" ? " active" : "")}
            onClick={() => setActiveTab("form")}
          >
            <span className="db-tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </span>
            <span className="db-tab-label">New Entry</span>
            {activeTab === "form" && <span className="db-tab-active-bar" />}
          </button>

          <button
            className={"db-tab" + (activeTab === "entries" ? " active" : "")}
            onClick={() => setActiveTab("entries")}
          >
            <span className="db-tab-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1"/>
                <line x1="9" y1="12" x2="15" y2="12"/>
                <line x1="9" y1="16" x2="13" y2="16"/>
              </svg>
            </span>
            <span className="db-tab-label">All Entries</span>
            {activeTab === "entries" && <span className="db-tab-active-bar" />}
          </button>
        </div>

        {/* ── Content ── */}
        <div className="db-content">
          {activeTab === "form" ? (
            <EntryForm onEntryAdded={handleEntryAdded} />
          ) : (
            <AllEntries key={refresh} />
          )}
        </div>

      </div>
    </div>
  );
}