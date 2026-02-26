import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EntryDetail from "../EntryDetail/EntryDetail";
import "./AllEntries.css";

const API_URL = "http://localhost:5000/api/entries";
// const navigate = useNavigate();

export default function AllEntries() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    console.log("🔄 AllEntries component mounted/refreshed");
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    console.log("📡 Fetching entries from API...");
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      console.log("✅ API Response:", res.data);

      if (res.data.success) {
        console.log("✅ Fetched", res.data.data.length, "entries");
        setEntries(res.data.data);
        setFilteredEntries(res.data.data);
      }
    } catch (err) {
      console.error("❌ Failed to fetch entries:", err);
      setError("Failed to fetch entries");
    }
    finally { setLoading(false); }
  };

  useEffect(() => {
    console.log("🔍 Applying filters - Search:", searchTerm, "Category:", categoryFilter, "Date:", dateFilter);
    let filtered = [...entries];

    if (searchTerm) {
      filtered = filtered.filter(e => {
        const s = searchTerm.toLowerCase();
        return e.name.toLowerCase().includes(s) || e.surname.toLowerCase().includes(s) ||
          e.contactNo.includes(s) || e.srNo.toString().includes(s);
      });
    }
    if (categoryFilter !== "All") filtered = filtered.filter(e => e.category === categoryFilter);
    if (dateFilter) filtered = filtered.filter(e => new Date(e.createdAt).toISOString().split("T")[0] === dateFilter);

    console.log("✅ Filtered results:", filtered.length, "entries");
    setFilteredEntries(filtered);
  }, [searchTerm, categoryFilter, dateFilter, entries]);

  const handleDelete = async (id) => {
    console.log("🗑️ Delete requested for entry ID:", id);
    if (!window.confirm("Delete this entry?")) {
      console.log("❌ Delete cancelled by user");
      return;
    }

    try {
      console.log("📡 Sending DELETE request...");
      const res = await axios.delete(`${API_URL}/${id}`);
      console.log("✅ Delete response:", res.data);

      if (res.data.success) {
        console.log("✅ Entry deleted successfully, refreshing list...");
        fetchEntries();
      }
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete entry");
    }
  };

  const navigate = useNavigate();

  // View button handler:
  const handleView = (entry) => {
    console.log("👁️ Navigate to entry details:", entry._id);
    navigate(`/entry/${entry._id}`);
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
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by name, contact, SR No…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="filter-select">
            <option value="All">All Categories</option>
            <option value="Normal">Normal</option>
            <option value="VIP">VIP</option>
            <option value="VVIP">VVIP</option>
          </select>
        </div>
        <div className="filter-group">
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="filter-date" />
        </div>
        {(searchTerm || categoryFilter !== "All" || dateFilter) && (
          <button onClick={() => { setSearchTerm(""); setCategoryFilter("All"); setDateFilter(""); }} className="reset-filters-btn">
            ✕ Reset
          </button>
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
                <th>Category</th>
                <th>Table</th>
                <th>Entry Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry._id}>
                  <td className="sr-col">#{entry.srNo}</td>
                  <td className="photo-col">
                    {/* ✅ Updated to use livePhotoUrl */}
                    {entry.livePhotoUrl
                      ? <img src={entry.livePhotoUrl} alt="Guest" className="table-photo" />
                      : <div className="no-photo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" width="16" height="16">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    }
                  </td>
                  <td className="name-col">{entry.name} {entry.surname}</td>
                  <td>{entry.contactNo}</td>
                  <td>
                    <span className={`category-badge ${entry.category.toLowerCase()}`}>{entry.category}</span>
                  </td>
                  <td className="table-col">T {entry.tableNo}</td>
                  <td className="time-col">{entry.entryTime}</td>
                  <td className="actions-col">
                    <button onClick={() => handleView(entry)} className="action-btn view-btn" title="View Details">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(entry._id)} className="action-btn delete-btn" title="Delete">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetail && selectedEntry && (
        <EntryDetail entry={selectedEntry} onClose={() => { setShowDetail(false); setSelectedEntry(null); }} onUpdate={fetchEntries} />
      )}
    </div>
  );
}