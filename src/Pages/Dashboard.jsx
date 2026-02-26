import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Components/Navbar/Navbar";
import EntryForm from "../Components/EntryForm/EntryForm";
import AllEntries from "../Components/AllEntries/AllEntries";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/api/entries";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("form");
  const [refresh, setRefresh] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  console.log("🎯 Dashboard rendered - Active Tab:", activeTab, "Refresh count:", refresh);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch total guests on mount and refresh
  useEffect(() => {
    fetchTotalGuests();
  }, [refresh]);

  const fetchTotalGuests = async () => {
    try {
      console.log("📊 Fetching total guests...");
      const res = await axios.get(API_URL);
      
      if (res.data.success) {
        const total = res.data.data.length;
        setTotalGuests(total);
        console.log("✅ Total guests updated:", total);
      }
    } catch (err) {
      console.error("❌ Failed to fetch total guests:", err);
    }
  };

  const handleEntryAdded = () => {
    console.log("✅ Entry added successfully! Switching to All Entries tab in 2 seconds...");
    
    setTimeout(() => {
      setRefresh(prev => {
        console.log("🔄 Refreshing AllEntries component - New refresh value:", prev + 1);
        return prev + 1;
      });
      setActiveTab("entries");
      console.log("📋 Switched to 'entries' tab");
    }, 2000);
  };

  const handleTabChange = (tab) => {
    console.log("🔀 Tab change requested:", tab);
    setActiveTab(tab);
  };

  // Format time (HH:MM:SS AM/PM)
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Format date (DD MMM YYYY)
  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
              {/* Time Display */}
              <div className="db-stat">
                <span className="db-stat-value">{formatTime(currentTime)}</span>
                <span className="db-stat-label">Current Time</span>
              </div>
              
              {/* Date Display */}
              <div className="db-stat">
                <span className="db-stat-value">{formatDate(currentTime)}</span>
                <span className="db-stat-label">Today's Date</span>
              </div>
              
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
            onClick={() => handleTabChange("form")}
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
            onClick={() => handleTabChange("entries")}
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