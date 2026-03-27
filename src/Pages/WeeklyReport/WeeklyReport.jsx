// Pages/WeeklyReport/WeeklyReport.jsx

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../utils/api.js";
import { downloadExcelReport } from "../../utils/downloadExcelReport.js";
import "./WeeklyReport.css";

export default function WeeklyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [weekRefDate, setWeekRefDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [weekLabel, setWeekLabel] = useState({ start: "", end: "" });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reports/weekly?date=${weekRefDate}`);
        if (res.data.success) {
          setReport(res.data.data);
          setWeekLabel({
            start: res.data.weekStart,
            end: res.data.weekEnd,
          });
        } else {
          setReport(null);
        }
      } catch {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [weekRefDate]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadExcelReport({ period: "weekly", date: weekRefDate });
      toast.success("Weekly Excel report downloaded.");
    } catch (e) {
      toast.error(e?.message || "Could not download report.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="wr-root">
      <div className="wr-header">
        <div>
          <h2 className="wr-title">Weekly Report</h2>
          <p className="wr-sub">
            Mon–Sun totals for the week containing the selected date
          </p>
        </div>
        <div className="wr-header-actions">
          <input
            type="date"
            className="wr-date-input"
            value={weekRefDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setWeekRefDate(e.target.value)}
          />
          <button
            type="button"
            className="wr-download-btn"
            disabled={downloading || loading}
            onClick={handleDownload}
          >
            {downloading ? "Preparing…" : "⬇ Download Excel"}
          </button>
        </div>
      </div>

      {weekLabel.start && (
        <div className="wr-period">
          <span className="wr-period-label">
            Week {weekLabel.start} — {weekLabel.end}
          </span>
        </div>
      )}

      {loading ? (
        <div className="wr-loading">Loading report…</div>
      ) : !report ? (
        <div className="wr-loading">No data for this week</div>
      ) : (
        <>
          <div className="wr-grid">
            <div className="wr-card wr-card--gold">
              <span className="wr-card-label">Total Revenue</span>
              <span className="wr-card-value">
                ₹{report.payments?.grandTotal?.toLocaleString() || 0}
              </span>
            </div>
            <div className="wr-card">
              <span className="wr-card-label">Total Guests</span>
              <span className="wr-card-value">{report.pax?.totalPeople || 0}</span>
            </div>
            <div className="wr-card">
              <span className="wr-card-label">Total Entries</span>
              <span className="wr-card-value">{report.entryCount || 0}</span>
            </div>
          </div>

          <div className="wr-section">
            <h4 className="wr-section-title">◆ Payment Mode</h4>
            <div className="wr-grid">
              <div className="wr-card wr-card--green">
                <span className="wr-card-label">💵 Cash</span>
                <span className="wr-card-value">
                  ₹{report.payments?.cash?.toLocaleString() || 0}
                </span>
              </div>
              <div className="wr-card wr-card--blue">
                <span className="wr-card-label">📱 UPI</span>
                <span className="wr-card-value">
                  ₹{report.payments?.upi?.toLocaleString() || 0}
                </span>
              </div>
              <div className="wr-card wr-card--red">
                <span className="wr-card-label">💳 Card</span>
                <span className="wr-card-value">
                  ₹{report.payments?.card?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="wr-section">
            <h4 className="wr-section-title">◆ Guest Type</h4>
            <div className="wr-grid">
              <div className="wr-card">
                <span className="wr-card-label">👥 Pax</span>
                <span className="wr-card-value">{report.pax?.pax || 0}</span>
              </div>
              <div className="wr-card">
                <span className="wr-card-label">👨 Stag Male</span>
                <span className="wr-card-value">{report.pax?.stagMale || 0}</span>
              </div>
              <div className="wr-card">
                <span className="wr-card-label">👩 Stag Female</span>
                <span className="wr-card-value">{report.pax?.stagFemale || 0}</span>
              </div>
              <div className="wr-card">
                <span className="wr-card-label">👫 Couple</span>
                <span className="wr-card-value">{report.pax?.couple || 0}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
