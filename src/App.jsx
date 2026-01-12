
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Eager load critical components (needed immediately)
import FarmerLayout from './components/FarmerLayout';
import AdminLayout from './components/AdminLayout';
import MockModeOverlay from './components/MockModeOverlay';
import Splash from './pages/Splash';
import Login from './pages/Login';

// Lazy load all other routes
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const SignupBasicInfo = lazy(() => import('./pages/SignupBasicInfo'));
// const SignupFarmInfo = lazy(() => import('./pages/SignupFarmInfo')); // Removed
const SignupAppInfo = lazy(() => import('./pages/SignupAppInfo'));
const SignupSummary = lazy(() => import('./pages/SignupSummary'));
const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard'));
const AdminDashboardNew = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminFarmers = lazy(() => import('./pages/admin/AdminFarmers'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminNews = lazy(() => import('./pages/admin/AdminNews'));
const UnifiedReport = lazy(() => import('./pages/UnifiedReport'));
const ReportStatus = lazy(() => import('./pages/ReportStatus'));
const PestReport = lazy(() => import('./pages/PestReport'));
const FloodReport = lazy(() => import('./pages/FloodReport'));
const DroughtReport = lazy(() => import('./pages/DroughtReport'));
const MixReport = lazy(() => import('./pages/MixReport'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const ReportConfirmation = lazy(() => import('./pages/ReportConfirmation'));
const FarmerProfile = lazy(() => import('./pages/FarmerProfile'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const FarmerMapPage = lazy(() => import('./pages/FarmerMapPage'));
const FarmerFarmsPage = lazy(() => import('./pages/FarmerFarmsPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const AdminFarmReports = lazy(() => import('./pages/AdminFarmReports'));
const AdminDailySummary = lazy(() => import('./pages/AdminDailySummary'));
const AdminOrganizedReport = lazy(() => import('./pages/AdminOrganizedReport'));
const AdminMapPage = lazy(() => import('./pages/admin/AdminMapPage'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-bg-surface">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-sm text-text-muted">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/signup/basic-info" element={<SignupBasicInfo />} />
            {/* Farm Info removed from flow */}
            <Route path="/signup/app-info" element={<SignupAppInfo />} />
            <Route path="/signup/summary" element={<SignupSummary />} />

            {/* Farmer Routes with Persistent Navbar */}
            <Route element={<FarmerLayout />}>
              <Route path="/dashboard" element={<FarmerDashboard />} />
              <Route path="/report" element={<UnifiedReport />} />
              <Route path="/status" element={<ReportStatus />} />
              <Route path="/profile" element={<FarmerProfile />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/my-map" element={<FarmerMapPage />} />
              <Route path="/my-farms" element={<FarmerFarmsPage />} />
              <Route path="/news" element={<NewsPage />} />
            </Route>

            {/* Admin Routes with Sidebar Layout */}
            <Route element={<AdminLayout />}>
              <Route path="/admin-dashboard" element={<AdminDashboardNew />} />
              <Route path="/admin/farmers" element={<AdminFarmers />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/news" element={<AdminNews />} />
              <Route path="/admin/map" element={<AdminMapPage />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            <Route path="/report/pest" element={<PestReport />} />
            <Route path="/report/flood" element={<FloodReport />} />
            <Route path="/report/drought" element={<DroughtReport />} />
            <Route path="/report/mix" element={<MixReport />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/report-confirmation" element={<ReportConfirmation />} />
            <Route path="/admin/farm-reports" element={<AdminFarmReports />} />
            <Route path="/admin/daily-summary" element={<AdminDailySummary />} />
            <Route path="/admin/organized-report" element={<AdminOrganizedReport />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <MockModeOverlay />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
