import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9FF]">
        <div className="w-12 h-12 rounded-full border-2 border-[#D6CFFF] border-t-[#17151F] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/account?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return children;
}
