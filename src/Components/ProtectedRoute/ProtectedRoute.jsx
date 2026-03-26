// Components/ProtectedRoute/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const ProtectedRoute = ({ children, ownerOnly = false, staffOnly = false }) => {
  const { isLoggedIn, isOwner, isStaff, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#06060E",
        color: "rgba(201,168,76,0.5)",
        fontFamily: "'Outfit', sans-serif",
        fontSize: "11px",
        letterSpacing: "4px",
        textTransform: "uppercase",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "32px", height: "32px",
            border: "2px solid rgba(201,168,76,0.2)",
            borderTopColor: "#C9A84C",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          Authenticating…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Not logged in → login
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // Owner only route — staff ne try kiya → dashboard
  if (ownerOnly && !isOwner) return <Navigate to="/dashboard" replace />;

  // Staff only route — owner ne try kiya → owner dashboard
  if (staffOnly && !isStaff) return <Navigate to="/owner" replace />;

  return children;
};

export default ProtectedRoute;