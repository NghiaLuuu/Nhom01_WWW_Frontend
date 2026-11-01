import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from './features/auth';
import { AdminLoginPage } from './features/auth/views/AdminLoginPage';
import { ForgotPasswordPage } from './features/auth/views/ForgotPasswordPage';
import { AdminLayout } from './layouts/AdminLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { RouteManagement } from './features/admin/views/RouteManagement';
import { VehicleManagement } from './features/admin/views/VehicleManagement';
import { TripManagement } from './features/admin/views/TripManagement';
import { UserManagement } from './features/admin/views/UserManagement';
import { AuditLogManagement } from './features/admin/views/AuditLogManagement';
import { AdminProfilePage } from './features/admin/views/AdminProfilePage';
import { LandingPage } from './features/booking/views/LandingPage';
import { SearchPage } from './features/booking/views/SearchPage';
import { CheckoutPage } from './features/booking/views/CheckoutPage';
import { BookingSuccessPage } from './features/booking/views/BookingSuccessPage';
import { BookingHistoryPage } from './features/booking/views/BookingHistoryPage';
import { TicketDetailPage } from './features/booking/views/TicketDetailPage';
import { ETicketPage } from './features/booking/views/ETicketPage';
import { ProfilePage } from './features/customer/views/ProfilePage';
import { TicketManagement } from './features/admin/views/TicketManagement';
import { ReportManagement } from './features/admin/views/ReportManagement';
import { LiveVisitorDetailView } from './features/admin/views/LiveVisitorDetailView';
import { UserTrackingHub } from './features/admin/views/UserTrackingHub';
import { AdminDashboard } from './features/admin/views/AdminDashboard';
import { AboutPage } from './features/public/views/AboutPage';
import { AchievementsPage } from './features/public/views/AchievementsPage';
import { ContactPage } from './features/public/views/ContactPage';
import { FaqPage } from './features/public/views/FaqPage';
import { Toaster } from 'react-hot-toast';
import { ModalProvider } from './context/ModalContext';

// Wrapper to handle navigation for auth pages
const AuthWrapper = ({ isLogin }: { isLogin: boolean }) => {
  const navigate = useNavigate();
  return isLogin ? (
    <LoginPage onToggleView={() => navigate('/register')} />
  ) : (
    <RegisterPage onToggleView={() => navigate('/login')} />
  );
};

function App() {
  return (
    <BrowserRouter>
      <ModalProvider>
        <Routes>
          {/* Dedicated Admin Login Portal */}
          <Route path="/login/admin" element={<AdminLoginPage />} />

          {/* Public Routes with Public Layout */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="booking-success" element={<BookingSuccessPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="login" element={<AuthWrapper isLogin={true} />} />
            <Route path="register" element={<AuthWrapper isLogin={false} />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Protected Customer Booking Routes inside Public Layout */}
            <Route path="bookings" element={
              <ProtectedRoute>
                <BookingHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="bookings/:id" element={
              <ProtectedRoute>
                <TicketDetailPage />
              </ProtectedRoute>
            } />
            <Route path="my-tickets" element={<Navigate to="/bookings" replace />} />
          </Route>

          {/* Dedicated E-Ticket Route (Stand-alone for clean boarding pass / print layout) */}
          <Route path="/bookings/:id/e-ticket" element={
            <ProtectedRoute>
              <ETicketPage />
            </ProtectedRoute>
          } />

          {/* Customer Profile Route */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <PublicLayout />
            </ProtectedRoute>
          }>
            <Route index element={<ProfilePage />} />
          </Route>
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            {/* Outlet contents */}
            <Route index element={<AdminDashboard />} />
            
            <Route path="trips" element={<TripManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="tickets" element={<TicketManagement />} />

            <Route path="routes" element={<RouteManagement />} />
            <Route path="vehicles-drivers" element={<VehicleManagement />} />
            <Route path="audit-logs" element={<AuditLogManagement />} />
            <Route path="reports" element={<ReportManagement />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="tracking" element={<UserTrackingHub />} />
            <Route path="tracking/:sessionId" element={<LiveVisitorDetailView />} />
            <Route path="live-visitors" element={<Navigate to="/admin/tracking?tab=live" replace />} />
            <Route path="live-visitors/:sessionId" element={<LiveVisitorDetailView />} />
            <Route path="behavior-analytics" element={<Navigate to="/admin/tracking?tab=overview" replace />} />
            
            {/* Catch all inside admin */}
            <Route path="*" element={
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500 py-20">
                Tính năng đang được phát triển...
              </div>
            } />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </ModalProvider>
    </BrowserRouter>
  );
}

export default App;
