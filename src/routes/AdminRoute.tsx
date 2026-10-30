import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // If not authenticated, redirect to dedicated Admin Login Portal
    return <Navigate to="/login/admin" state={{ from: location }} replace />;
  }

  const roles = user?.roles || [];
  const isAdminOrStaff = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_STAFF');

  if (!isAdminOrStaff) {
    // Authenticated as Customer but lacks admin permission
    return <Navigate to="/login/admin" state={{ unauthorized: true, from: location }} replace />;
  }

  return <>{children}</>;
};
