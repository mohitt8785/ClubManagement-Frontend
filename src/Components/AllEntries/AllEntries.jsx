import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AllEntries.css";

const API_URL = `${import.meta.env.VITE_API_URL}/entries`;

export default function AllEntries() {
  // ✅ Saare hooks top pe
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // ✅ useCallback — stable function
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      if (res.data.success) {
        setEntries(res.data.data);
        setFilteredEntries(res.data.data);
      }
    } catch (err) {
      setError("Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ fetchEntries dependency mein
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // ✅ Filters
  useEffect(() => {
    let filtered = [...entries];

    if (searchTerm) {
      filtered = filtered.filter(e => {
        const s = searchTerm.toLowerCase();
        return (
          e.name.toLowerCase().includes(s) ||
          e.surname.toLowerCase().includes(s) ||
          e.contactNo.includes(s) ||
          e.srNo.toString().includes(s)
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

  // ✅ Delete — no console.logs
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;

    try {
      const res = await axios.delete(`${API_URL}/${id}`);
      if (res.data.success) {
        fetchEntries();
      }
    } catch (err) {
      alert("Failed to delete entry");
    }
  };

  // ✅ View
  const handleView = (entry) => {
    navigate(`/entry/${entry._id}`);
  };

  // ✅ Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setDateFilter("");
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
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Categories</option>
            <option value="Normal">Normal</option>
            <option value="VIP">VIP</option>
            <option value="VVIP">VVIP</option>
          </select>
        </div>
        <div className="filter-group">
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="filter-date"
          />
        </div>
        {(searchTerm || categoryFilter !== "All" || dateFilter) && (
          <button onClick={handleResetFilters} className="reset-filters-btn">
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
                  <td>
                    <span className={`category-badge ${entry.category.toLowerCase()}`}>
                      {entry.category}
                    </span>
                  </td>
                  {/* ✅ tableNo null check */}
                  <td className="table-col">
                    {entry.tableNo ? `T ${entry.tableNo}` : "—"}
                  </td>
                  <td className="time-col">{entry.entryTime}</td>
                  <td className="actions-col">
                    <button
                      onClick={() => handleView(entry)}
                      className="action-btn view-btn"
                      title="View Details"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="action-btn delete-btn"
                      title="Delete"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}