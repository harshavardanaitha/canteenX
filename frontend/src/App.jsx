import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderListPage from './pages/OrderListPage';
import ComplaintsPage from './pages/ComplaintsPage';
import RewardsPage from './pages/RewardsPage';
import NotificationsPage from './pages/NotificationsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import ProfilePage from './pages/ProfilePage';

const ALL_ROLES = ['STUDENT', 'FACULTY', 'CANTEEN_STAFF', 'CANTEEN_MANAGER'];

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-400 font-medium">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
              <Navbar onOpenCart={() => setIsCartOpen(true)} />

              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Student dashboard — no auth guard so cart/menu works immediately */}
                  <Route path="/student" element={<StudentDashboard />} />

                  <Route path="/faculty" element={
                    <ProtectedRoute allowedRoles={['FACULTY']}>
                      <FacultyDashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/staff" element={
                    <ProtectedRoute allowedRoles={['CANTEEN_STAFF', 'CANTEEN_MANAGER']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/manager" element={
                    <ProtectedRoute allowedRoles={['CANTEEN_MANAGER']}>
                      <ManagerDashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/orders" element={<OrderListPage />} />
                  <Route path="/orders/:id" element={<OrderTrackingPage />} />

                  <Route path="/complaints" element={
                    <ProtectedRoute allowedRoles={ALL_ROLES}>
                      <ComplaintsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/rewards" element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY']}>
                      <RewardsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/notifications" element={
                    <ProtectedRoute allowedRoles={ALL_ROLES}>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/announcements" element={<AnnouncementsPage />} />

                  <Route path="/profile" element={
                    <ProtectedRoute allowedRoles={ALL_ROLES}>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </main>

              <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
