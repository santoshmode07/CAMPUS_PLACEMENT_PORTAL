import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import JobsList from './pages/JobsList';
import JobDetails from './pages/JobDetails';

function App() {
  const { user, loading } = useAuth();

  // If the initial check is verifying cookies with the backend, render a loading state
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <div className="loader-text">Restoring placement portal session...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes (If user is already logged in, redirect them to dashboard) */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
          />

          {/* Protected route (If user is not logged in, redirect them to login page) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/jobs" 
            element={
              <ProtectedRoute>
                <JobsList />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/jobs/:id" 
            element={
              <ProtectedRoute>
                <JobDetails />
              </ProtectedRoute>
            } 
          />

          {/* Base URLs */}
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
          />
          
          {/* Wildcard path - redirects everything else to home */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
