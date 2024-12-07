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
    // determine appropriate redirect based on user's role
    let redirectPath = '/';
    
    switch (user.role) {
      case 'startup_owner':
      case 'investor':
        redirectPath = '/dashboard';
        break;
      case 'admin':
        redirectPath = '/admin/dashboard';
        break;
      default:
        // if unknown role, redirect to landing
        redirectPath = '/';
    }

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}; 