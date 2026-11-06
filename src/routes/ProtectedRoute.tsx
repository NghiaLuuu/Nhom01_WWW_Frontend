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

  // Check localStorage directly for immediate synchronous hydration protection on initial mount / F5
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

  const effectiveAuth = isAuthenticated || Boolean(storedAuth?.isAuthenticated && storedAuth?.accessToken);
  const effectiveAccess = accessToken || storedAuth?.accessToken;
  const effectiveRefresh = refreshToken || storedAuth?.refreshToken;
  const currentUser = user || storedAuth?.user;

  // Ensure both authenticated flag and tokens exist
  if (!effectiveAuth || !effectiveAccess || !effectiveRefresh) {
    // Redirect to login but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Check if user has at least one of the allowed roles
    const hasRole = currentUser?.roles?.some((role: string) => allowedRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
