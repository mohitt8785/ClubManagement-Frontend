// Pages/MonthlyReport/MonthlyReport.jsx

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../utils/api.js";
import { downloadExcelReport } from "../../utils/downloadExcelReport.js";
import "./MonthlyReport.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MonthlyReport() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reports/monthly?month=${month}&year=${year}`);
        if (res.data.success) setReport(res.data.data.summary); // ← .data.summary
      } catch {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [month, year]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadExcelReport({ period: "monthly", year, month });
      toast.success("Monthly Excel report downloaded.");
    } catch (e) {
      toast.error(e?.message || "Could not download report.");
    } finally {
      setDownloading(false);
    }
  };

  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="mr-root">
      <div className="mr-header">
        <div>
          <h2 className="mr-title">Monthly Report</h2>
          <p className="mr-sub">Revenue & guest summary for selected month</p>
        </div>
        <div className="mr-selectors">
          <select className="mr-select" value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select className="mr-select" value={year} onChange={e => setYear(+e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            type="button"
            className="mr-download-btn"
            disabled={downloading || loading}
            onClick={handleDownload}
          >
            {downloading ? "Preparing…" : "⬇ Excel"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mr-loading">Loading report…</div>
      ) : !report ? (
        <div className="mr-loading">No data for this month</div>
      ) : (
        <>
          <div className="mr-period">
            <span className="mr-period-label">{MONTHS[month - 1]} {year}</span>
          </div>

          <div className="mr-grid">
            <div className="mr-card mr-card--gold">
              <span className="mr-card-label">Total Revenue</span>
              <span className="mr-card-value">₹{report.payments?.grandTotal?.toLocaleString() || 0}</span>
            </div>
            <div className="mr-card">
              <span className="mr-card-label">Total Guests</span>
              <span className="mr-card-value">{report.pax?.totalPeople || 0}</span>
            </div>
            <div className="mr-card">
              <span className="mr-card-label">Total Entries</span>
              <span className="mr-card-value">{report.entryCount || 0}</span>
            </div>
          </div>

          <div className="mr-section">
            <h4 className="mr-section-title">◆ Payment Mode</h4>
            <div className="mr-grid">
              <div className="mr-card mr-card--green">
                <span className="mr-card-label">💵 Cash</span>
                <span className="mr-card-value">₹{report.payments?.cash?.toLocaleString() || 0}</span>
              </div>
              <div className="mr-card mr-card--blue">
                <span className="mr-card-label">📱 UPI</span>
                <span className="mr-card-value">₹{report.payments?.upi?.toLocaleString() || 0}</span>
              </div>
              <div className="mr-card mr-card--red">
                <span className="mr-card-label">💳 Card</span>
                <span className="mr-card-value">₹{report.payments?.card?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          <div className="mr-section">
            <h4 className="mr-section-title">◆ Guest Type</h4>
            <div className="mr-grid">
              <div className="mr-card">
                <span className="mr-card-label">👥 Pax</span>
                <span className="mr-card-value">{report.pax?.pax || 0}</span>
              </div>
              <div className="mr-card">
                <span className="mr-card-label">👨 Stag Male</span>
                <span className="mr-card-value">{report.pax?.stagMale || 0}</span>
              </div>
              <div className="mr-card">
                <span className="mr-card-label">👩 Stag Female</span>
                <span className="mr-card-value">{report.pax?.stagFemale || 0}</span>
              </div>
              <div className="mr-card">
                <span className="mr-card-label">👫 Couple</span>
                <span className="mr-card-value">{report.pax?.couple || 0}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}