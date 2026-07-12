import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { StateProvider } from './contexts/StateContext';
import { ToastProvider } from './contexts/ToastContext';

// Layout & Auth
import { Layout } from './components/layout/Layout';
import { Login, ForgotPassword, ResetPassword } from './components/auth/AuthPages';

// Feature Modules
import { Dashboard } from './components/dashboard/Dashboard';
import { VehicleManagement } from './components/vehicles/VehicleManagement';
import { DriverManagement } from './components/drivers/DriverManagement';
import { TripManagement } from './components/trips/TripManagement';
import { Maintenance } from './components/maintenance/Maintenance';
import { FuelLogs } from './components/fuel/FuelLogs';
import { Expenses } from './components/expenses/Expenses';
import { Reports } from './components/reports/Reports';
import { Analytics } from './components/analytics/Analytics';
import { Notifications } from './components/notifications/Notifications';
import { Documents } from './components/documents/Documents';
import { Settings } from './components/settings/Settings';
import { Profile } from './components/profile/Profile';

// Error Views
import { NotFound } from './components/ui/ErrorPages';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StateProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                
                {/* Authentication routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Main Dashboard Layout Protected Module */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="fleet" element={<VehicleManagement />} />
                  <Route path="drivers" element={<DriverManagement />} />
                  <Route path="trips" element={<TripManagement />} />
                  <Route path="dispatch" element={<TripManagement />} />
                  <Route path="maintenance" element={<Maintenance />} />
                  <Route path="fuel" element={<FuelLogs />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                  
                  {/* 404 Fallback within Layout */}
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Catch-all redirect to login/dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </StateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
