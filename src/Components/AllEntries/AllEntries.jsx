

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
import api from "../../utils/api.js";
import "./AllEntries.css";

export default function AllEntries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/entries");
      if (res.data.success) {
        setEntries(res.data.data);
        setFilteredEntries(res.data.data);
      }
    } catch {
      setError("Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  useEffect(() => {
    let filtered = [...entries];
    if (searchTerm) {
      filtered = filtered.filter(e => {
        const s = searchTerm.toLowerCase();
        return (
          e.name?.toLowerCase().includes(s) ||
          e.surname?.toLowerCase().includes(s) ||
          e.contactNo?.includes(s) ||
          e.srNo?.toString().includes(s)
        );
      });
    }
    if (categoryFilter !== "All") {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }
    if (dateFilter) {
      filtered = filtered.filter(e =>
        new Date(e.createdAt).toISOString().split("T")[0] === dateFilter
      );
    }
    setFilteredEntries(filtered);
  }, [searchTerm, categoryFilter, dateFilter, entries]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      const res = await api.delete(`/entries/${id}`);
      if (res.data.success) fetchEntries();
    } catch {
      alert("Failed to delete entry");
    }
  };

  // ✅ Helper: Get paxCounts from entry (handles old & new format)
  const getPaxCounts = (entry) => {
    // New format: paxCounts object exists
    if (entry.paxCounts && typeof entry.paxCounts === 'object') {
      return entry.paxCounts;
    }

    // Old format: Convert pax + paxCount to paxCounts
    if (entry.pax) {
      const counts = {
        "Pax": 0,
        "Stag Male": 0,
        "Stag Female": 0,
        "Couple": 0
      };
      counts[entry.pax] = entry.paxCount || 1;
      return counts;
    }

    // Fallback: Default values
    return {
      "Pax": 1,
      "Stag Male": 0,
      "Stag Female": 0,
      "Couple": 0
    };
  };

  // ✅ Helper: Calculate total people from entry
  const getTotalPeople = (entry) => {
    const paxCounts = getPaxCounts(entry);
    return (
      (paxCounts.Pax || 0) +
      (paxCounts["Stag Male"] || 0) +
      (paxCounts["Stag Female"] || 0) +
      ((paxCounts.Couple || 0) * 2) // Couple × 2 = people
    );
  };

  if (loading) return <div className="loading-state">Loading entries…</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (


    <div className="all-entries-container">

      {/* Header */}
      <div className="entries-header">
        <h2>All Entries</h2>
        <span className="entries-count">{filteredEntries.length} Records</span>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <input type="text" placeholder="Search by name, contact, SR No…"
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className="search-input" />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="filter-select">
          <option value="All">All Categories</option>
          <option value="Normal">Normal</option>
          <option value="VIP">VIP</option>
          <option value="VVIP">VVIP</option>
        </select>
        <input type="date" value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="filter-date" />
        {(searchTerm || categoryFilter !== "All" || dateFilter) && (
          <button onClick={() => { setSearchTerm(""); setCategoryFilter("All"); setDateFilter(""); }}
            className="reset-filters-btn">✕ Reset</button>
        )}
      </div>

      {/* Table */}
      {filteredEntries.length === 0 ? (
        <div className="no-entries">No entries found</div>
      ) : (
        <div className="table-wrapper">
          <table className="entries-table">
            <thead>
              <tr>
                <th>SR No.</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Contact</th>
                <th> People</th>
                <th>Category</th>
                <th>Table</th>
                <th>Entry Time</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry._id}>
                  <td className="sr-col">#{entry.srNo}</td>
                  <td className="photo-col">
                    {entry.livePhotoUrl
                      ? <img src={entry.livePhotoUrl} alt="Guest" className="table-photo" />
                      : <div className="no-photo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="16" height="16">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    }
                  </td>
                  <td className="name-col">{entry.name} {entry.surname}</td>
                  <td>{entry.contactNo}</td>

                  {/* ✅ Total People with breakdown tooltip */}
                  <td>
                    <span className="people-badge" title={(() => {
                      const pc = getPaxCounts(entry);
                      return `Pax: ${pc.Pax || 0}, Male: ${pc["Stag Male"] || 0}, Female: ${pc["Stag Female"] || 0}, Couple: ${pc.Couple || 0}`;
                    })()}>
                      {getTotalPeople(entry)}
                    </span>
                  </td>

                  <td>
                    <span className={`category-badge ${entry.category?.toLowerCase()}`}>
                      {entry.category}
                    </span>
                  </td>
                  <td>{entry.tableNo ? `T ${entry.tableNo}` : "—"}</td>

                  {/* ✅ Time in 12-hour format */}
                  <td className="time-col">
                    {entry.entryTime ? (() => {
                      const [h, m] = entry.entryTime.split(":");
                      const hour = parseInt(h);
                      let h12 = hour % 12;
                      if (h12 === 0) h12 = 12;
                      const ampm = hour >= 12 ? "PM" : "AM";
                      return `${h12}:${m} ${ampm}`;
                    })() : "—"}
                  </td>

                  {/* Total */}
                  <td className="total-col">
                    ₹{(entry.totalAmount || 0).toLocaleString()}
                  </td>

                  <td className="actions-col">
                    <button onClick={() => navigate(`/entry/${entry._id}`)}
                      className="action-btn view-btn" title="View Details">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  
                    {user?.role === "owner" && (
                      <button onClick={() => handleDelete(entry._id)}
                        className="action-btn delete-btn" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    )}

                  </td>
                </tr>
              ))}
            </tbody>

            {/* ✅ Footer totals */}
            {filteredEntries.length > 1 && (
              <tfoot>
                <tr className="totals-row">
                  <td colSpan="4" className="totals-label">
                    Total ({filteredEntries.length} entries)
                  </td>
                  <td className="people-total">
                    {filteredEntries.reduce((sum, e) => sum + getTotalPeople(e), 0)}
                  </td>
                  <td colSpan="3"></td>
                  <td className="total-col">
                    ₹{filteredEntries.reduce((s, e) => s + (e.totalAmount || 0), 0).toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>

  );
}