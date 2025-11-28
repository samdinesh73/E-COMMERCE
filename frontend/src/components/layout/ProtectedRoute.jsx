import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "lucide-react";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-12 w-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  try {
    // Debug logging to help diagnose role mismatches at runtime
    // eslint-disable-next-line no-console
    console.log("ProtectedRoute check:", { requiredRole, userRole: user?.role });

    // Normalize to trimmed lowercase strings for robust comparison
    const normalizedRequired = requiredRole != null ? String(requiredRole).trim().toLowerCase() : null;
    const normalizedUserRole = user?.role != null ? String(user.role).trim().toLowerCase() : null;

    if (normalizedRequired && normalizedUserRole !== normalizedRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Admin access is required.
          </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 text-sm text-gray-500">
                <strong>Debug:</strong> requiredRole={String(requiredRole)} user.role={String(user?.role)}
              </div>
            )}
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </a>
        </div>
      </div>
    );
  }
  } catch (err) {
    // Defensive: if some code passed an undefined identifier (e.g. requiredRole={admin})
    // avoid crashing the whole app — log and show access denied.
    // eslint-disable-next-line no-console
    console.error("ProtectedRoute role check error:", err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <a href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Go Back Home</a>
        </div>
      </div>
    );
  }

  return children;
}
