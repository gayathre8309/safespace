
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/auth/LoginScreen';
import SignupScreen from './components/auth/SignupScreen';
import RoleSelectionScreen from './components/auth/RoleSelectionScreen';
import MainLayout from './components/layout/MainLayout';
import MonitoringScreen from './components/monitoring/MonitoringScreen';
import FlaggedContentDashboard from './components/dashboard/ParentDashboard';
import MoodTracker from './components/wellbeing/MoodTracker';
import SafeCircles from './components/wellbeing/SafeCircles';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/role-select" element={<RoleSelectionScreen />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <Route path="/" element={<MainLayout />}>
          {user.role === 'Child' ? (
            <>
              <Route index element={<Navigate to="/monitor" />} />
              <Route path="monitor" element={<MonitoringScreen />} />
              <Route path="mood-tracker" element={<MoodTracker />} />
              <Route path="safe-circles" element={<SafeCircles />} />
              <Route path="dashboard" element={<Navigate to="/monitor" />} />
            </>
          ) : (
            <>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<FlaggedContentDashboard />} />
              <Route path="monitor" element={<Navigate to="/dashboard" />} />
              <Route path="mood-tracker" element={<Navigate to="/dashboard" />} />
              <Route path="safe-circles" element={<Navigate to="/dashboard" />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      )}
    </Routes>
  );
};

export default App;
