import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable wrapper component to protect private client-side routes.
 * If the user session exists, it renders the requested child component.
 * If the user is unauthenticated, it redirects them to the /login page.
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // If no user is logged in, redirect them to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user session is active, render the requested component
  return children;
};

export default ProtectedRoute;
