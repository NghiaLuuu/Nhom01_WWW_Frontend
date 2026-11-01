import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Check localStorage directly for immediate synchronous hydration protection
  const storedAuth = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.state;
      }
    } catch {
      // ignore
    }
    return null;
  }, []);

  const authed = isAuthenticated || Boolean(storedAuth?.isAuthenticated && storedAuth?.accessToken);
  const currentUser = user || storedAuth?.user;

  if (!authed) {
    // If not authenticated, redirect to dedicated Admin Login Portal
    return <Navigate to="/login/admin" state={{ from: location }} replace />;
  }

  const roles: string[] = currentUser?.roles || [];
  const isAdminOrStaff = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_STAFF');

  if (!isAdminOrStaff) {
    // Authenticated as Customer but lacks admin permission
    return <Navigate to="/login/admin" state={{ unauthorized: true, from: location }} replace />;
  }

  return <>{children}</>;
};
