import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // We use metro_user as a soft check for rendering the routes
  // Secure endpoints will reject via 401 if the HTTP-only cookie is missing/invalid
  const isAuth = localStorage.getItem('metro_user');
  
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
