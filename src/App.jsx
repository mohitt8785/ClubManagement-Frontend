import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import EntryDetailPage from "./Components/EntryDetail/EntryDetail.jsx"  // ✅ Page import karo
import ProtectedRoute from "./Components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Login Page */}
      <Route path="/login" element={<Login />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ Entry Detail PAGE - Not modal component */}
      <Route
        path="/entry/:id"
        element={
          <ProtectedRoute>
            <EntryDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;