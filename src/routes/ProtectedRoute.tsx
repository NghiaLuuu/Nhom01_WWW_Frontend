import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, accessToken, refreshToken, user } = useAuthStore();
  const location = useLocation();

  // A persisted auth flag without both tokens can happen after a previous
  // failed refresh or when old localStorage data is restored. Do not render a
  // protected screen in that state because every API request would be 401.
  if (!isAuthenticated || !accessToken || !refreshToken) {
    // Redirect to login but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Check if user has at least one of the allowed roles
    const hasRole = user?.roles?.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      // If user is authenticated but not authorized, redirect to home or unauthorized page
      // Assuming non-admin goes to / or a forbidden page
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
