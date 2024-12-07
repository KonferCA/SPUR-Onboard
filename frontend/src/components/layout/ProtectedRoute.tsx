import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // if not logged in, redirect to landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // check if user's role is allowed
  if (!allowedRoles.includes(user.role as UserRole)) {
    // redirect to user dashboard if unauthorized
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}; 