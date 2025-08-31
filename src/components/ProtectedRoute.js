// src/components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Check if there's a valid token

  if (!token) {
    // Redirect to login if token doesn't exist
    return <Navigate to="/login" />;
  }

  return children; // If token exists, render the protected component
};

export default ProtectedRoute;
