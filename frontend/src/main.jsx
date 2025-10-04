import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignAuth from './pages/SignAuth';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './src_auth';

// This component handles the root URL.
// If you're logged in, it sends you to the dashboard. If not, it shows the sign-in page.
function AuthWrapper() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40 }}>Loading authentication...</div>;
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <SignAuth />;
}

// This component protects routes that require you to be logged in.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/" replace />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthWrapper />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);