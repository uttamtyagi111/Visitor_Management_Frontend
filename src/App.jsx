import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/auth/Login';
import PasswordReset from './components/auth/PasswordReset';
import PasswordVerify from './components/auth/PasswordVerify';
import Dashboard from './components/dashboard/Dashboard';
import VisitorRegistration from './components/dashboard/VisitorRegistration';
import PublicInvitePage from './components/invite/PublicInvitePage';
import './index.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  
  // Show loading while initializing authentication
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-600 via-grey-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-600 via-grey-900 to-slate-900">
              <Routes>
              <Route path="/visitor" element={<VisitorRegistration />} />
              <Route path="/invite" element={<PublicInvitePage />} />
              <Route path="/invite/:inviteCode" element={<PublicInvitePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/password-reset" element={<PasswordReset />} />
              <Route path="/password-verify" element={<PasswordVerify />} />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
