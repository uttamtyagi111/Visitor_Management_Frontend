import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import PasswordReset from './components/auth/PasswordReset';
import PasswordVerify from './components/auth/PasswordVerify';
import Dashboard from './components/dashboard/Dashboard';
import VisitorRegistration from './components/dashboard/VisitorRegistration';
import PublicInvitePage from './components/invite/PublicInvitePage';
import './index.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-600 via-grey-900 to-slate-900">
          <Routes>
            <Route path="/api/visitor" element={<VisitorRegistration />} />
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
  );
}

export default App;
