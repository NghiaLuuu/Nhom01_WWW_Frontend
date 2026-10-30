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
import { ProfilePage } from './features/customer/views/ProfilePage';
import { TicketManagement } from './features/admin/views/TicketManagement';
import { UserBehaviorAnalytics } from './features/admin/views/UserBehaviorAnalytics';
import { LiveVisitorsDashboard } from './features/admin/views/LiveVisitorsDashboard';
import { LiveVisitorDetailView } from './features/admin/views/LiveVisitorDetailView';
import { AboutPage } from './features/public/views/AboutPage';
import { AchievementsPage } from './features/public/views/AchievementsPage';
import { ContactPage } from './features/public/views/ContactPage';
import { FaqPage } from './features/public/views/FaqPage';
import { Toaster } from 'react-hot-toast';

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
        </Route>

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
          <Route index element={
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bảng Điều Khiển</h2>
              <p className="text-gray-500">Chào mừng bạn đến với hệ thống quản trị VEXE.</p>
            </div>
          } />
          
          <Route path="trips" element={<TripManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="tickets" element={<TicketManagement />} />

          <Route path="routes" element={<RouteManagement />} />
          <Route path="vehicles-drivers" element={<VehicleManagement />} />
          <Route path="audit-logs" element={<AuditLogManagement />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="live-visitors" element={<LiveVisitorsDashboard />} />
          <Route path="live-visitors/:sessionId" element={<LiveVisitorDetailView />} />
          <Route path="behavior-analytics" element={<UserBehaviorAnalytics />} />
          
          {/* Catch all inside admin */}
          <Route path="*" element={
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500 py-20">
              Tính năng đang được phát triển...
            </div>
          } />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
