// Pages/DailyReport/DailyReport.jsx

import { useState, useEffect } from "react";
import api from "../../utils/api";
import "./DailyReport.css";

export default function DailyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reports/daily?date=${date}`);
        if (res.data.success) setReport(res.data.data);
      } catch {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [date]);

  return (
    <div className="dr-root">
      <div className="dr-header">
        <div>
          <h2 className="dr-title">Daily Report</h2>
          <p className="dr-sub">Revenue & guest summary for selected date</p>
        </div>
        <input type="date" className="dr-date-input"
          value={date}
          max={new Date().toISOString().split("T")[0]}
          onChange={e => setDate(e.target.value)} />
      </div>

      {loading ? (
        <div className="dr-loading">Loading report…</div>
      ) : !report ? (
        <div className="dr-loading">No data for this date</div>
      ) : (
        <>
          {/* Revenue Cards */}
          <div className="dr-grid">
            <div className="dr-card dr-card--gold">
              <span className="dr-card-label">Total Revenue</span>
              <span className="dr-card-value">₹{report.payments?.grandTotal?.toLocaleString() || 0}</span>
            </div>
            <div className="dr-card">
              <span className="dr-card-label">Total Guests</span>
              <span className="dr-card-value">{report.pax?.totalPeople || 0}</span>
            </div>
            <div className="dr-card">
              <span className="dr-card-label">Total Entries</span>
              <span className="dr-card-value">{report.entryCount || 0}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="dr-section">
            <h4 className="dr-section-title">◆ Payment Mode</h4>
            <div className="dr-grid">
              <div className="dr-card dr-card--green">
                <span className="dr-card-label">💵 Cash</span>
                <span className="dr-card-value">₹{report.payments?.cash?.toLocaleString() || 0}</span>
              </div>
              <div className="dr-card dr-card--blue">
                <span className="dr-card-label">📱 UPI</span>
                <span className="dr-card-value">₹{report.payments?.upi?.toLocaleString() || 0}</span>
              </div>
              <div className="dr-card dr-card--red">
                <span className="dr-card-label">💳 Card</span>
                <span className="dr-card-value">₹{report.payments?.card?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Pax */}
          <div className="dr-section">
            <h4 className="dr-section-title">◆ Guest Type</h4>
            <div className="dr-grid">
              <div className="dr-card">
                <span className="dr-card-label">👥 Pax</span>
                <span className="dr-card-value">{report.pax?.pax || 0}</span>
              </div>
              <div className="dr-card">
                <span className="dr-card-label">👨 Stag Male</span>
                <span className="dr-card-value">{report.pax?.stagMale || 0}</span>
              </div>
              <div className="dr-card">
                <span className="dr-card-label">👩 Stag Female</span>
                <span className="dr-card-value">{report.pax?.stagFemale || 0}</span>
              </div>
              <div className="dr-card">
                <span className="dr-card-label">👫 Couple</span>
                <span className="dr-card-value">{report.pax?.couple || 0}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}