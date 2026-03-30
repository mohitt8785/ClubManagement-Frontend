// Pages/Dashboard.jsx
// ✅ Professional Enhanced Design

import { useState } from "react";
import Navbar from "../../Components/Navbar/Navbar.jsx";
import EntryForm from "../../Components/EntryForm/EntryForm.jsx";
import AllEntries from "../../Components/AllEntries/AllEntries.jsx";
import "./Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("form");
  const [refresh, setRefresh] = useState(0);

  const handleEntryAdded = () => {
    setRefresh(prev => prev + 1);
    setActiveTab("entries"); // Auto-switch to entries after submit
  };

  return (
    <>
      <Navbar />
      
      <div className="db-wrapper">
        <div className="db-container">
          
          {/* ── Header Section ── */}
          <div className="db-header">
            <div className="db-header-content">
              <div className="db-eyebrow">
                <span className="db-eyebrow-gem">◆</span>
                <span>Jaguar Club · Staff Portal</span>
                <span className="db-eyebrow-gem">◆</span>
              </div>
              
              <h1 className="db-title">Entry Management</h1>
              
              <p className="db-subtitle">
                Create new guest entries and manage existing records
              </p>
            </div>

            {/* Live Clock */}
            <div className="db-clock">
              <div className="db-clock-time">
                {new Date().toLocaleTimeString("en-IN", { 
                  hour: "2-digit", 
                  minute: "2-digit",
                  hour12: true 
                })}
              </div>
              <div className="db-clock-date">
                {new Date().toLocaleDateString("en-IN", { 
                  day: "2-digit", 
                  month: "short", 
                  year: "numeric" 
                })}
              </div>
            </div>
          </div>

          {/* ── Tab Navigation ── */}
          <div className="db-tabs">
            <button
              className={`db-tab ${activeTab === "form" ? "active" : ""}`}
              onClick={() => setActiveTab("form")}
            >
              <span className="db-tab-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </span>
              <span className="db-tab-text">New Entry</span>
              {activeTab === "form" && <span className="db-tab-bar" />}
            </button>

            <button
              className={`db-tab ${activeTab === "entries" ? "active" : ""}`}
              onClick={() => setActiveTab("entries")}
            >
              <span className="db-tab-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </span>
              <span className="db-tab-text">All Entries</span>
              {activeTab === "entries" && <span className="db-tab-bar" />}
            </button>
          </div>

          {/* ── Tab Content ── */}
          <div className="db-content">
            {activeTab === "form" ? (
              <EntryForm onEntryAdded={handleEntryAdded} />
            ) : (
              <AllEntries key={refresh} />
            )}
          </div>

        </div>
      </div>
    </>
  );
}