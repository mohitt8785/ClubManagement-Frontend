// App.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext.jsx";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute.jsx";

// Pages
import Login from "./Pages/Login/Login.jsx";
import Dashboard from "./Pages/Dashboard/Dashboard.jsx";
import OwnerDashboard from "./Pages/OwnerDashboard/OwnerDashboard.jsx";

// Components
import EntryForm from "./Components/EntryForm/EntryForm.jsx";
import EntryDetail from "./Components/EntryDetail/EntryDetail.jsx";
import AllEntries from "./Components/AllEntries/AllEntries.jsx";


import { useAuth } from "./Context/AuthContext.jsx";
import Navbar from "./Components/Navbar/Navbar.jsx";
import OwnerNavbar from "./Components/OwnerNavbar/OwnerNavbar.jsx";
import ChangePassword from "./Pages/Setting/ChangePassword.jsx";

function HomeRedirect() {
  const stored = localStorage.getItem("jc_user");
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user.role === "owner") return <Navigate to="/owner" replace />;
    } catch { }
  }
  return <Navigate to="/dashboard" replace />;
}

function EntriesPage() {
  const { user } = useAuth();
  return (
    <>
      {user?.role === "owner" ? <OwnerNavbar /> : <Navbar />}
      <AllEntries />
    </>
  );
}






export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ── Public ── */}
        <Route path="/login" element={<Login />} />

        {/* ── Staff Routes ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute staffOnly>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* ── Owner Routes ── */}
        <Route path="/owner" element={
          <ProtectedRoute ownerOnly>
            <OwnerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute ownerOnly>
            <ChangePassword />
          </ProtectedRoute>
        } />


        {/* ── Shared Routes ── */}
        <Route path="/entry/new" element={
          <ProtectedRoute><EntryForm /></ProtectedRoute>
        } />
        <Route path="/entry/:id" element={
          <ProtectedRoute><EntryDetail /></ProtectedRoute>
        } />
        <Route path="/entries" element={
          <ProtectedRoute><EntriesPage /></ProtectedRoute>
        } />

        {/* ── Default ── */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />



      </Routes>
    </AuthProvider>
  );
}