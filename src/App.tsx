import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from './features/auth';
import { ForgotPasswordPage } from './features/auth/views/ForgotPasswordPage';
import { AdminLayout } from './layouts/AdminLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RouteManagement } from './features/admin/views/RouteManagement';
import { VehicleManagement } from './features/admin/views/VehicleManagement';
import { TripManagement } from './features/admin/views/TripManagement';
import { UserManagement } from './features/admin/views/UserManagement';
import { AuditLogManagement } from './features/admin/views/AuditLogManagement';
import { LandingPage } from './features/booking/views/LandingPage';
import { SearchPage } from './features/booking/views/SearchPage';
import { CheckoutPage } from './features/booking/views/CheckoutPage';
import { BookingSuccessPage } from './features/booking/views/BookingSuccessPage';
import { ProfilePage } from './features/customer/views/ProfilePage';
import { TicketManagement } from './features/admin/views/TicketManagement';
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
        {/* Public Routes with Public Layout */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="booking-success" element={<BookingSuccessPage />} />
        </Route>
        
        {/* Auth Routes */}
        <Route path="/login" element={<AuthWrapper isLogin={true} />} />
        <Route path="/register" element={<AuthWrapper isLogin={false} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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
          <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']}>
            <AdminLayout />
          </ProtectedRoute>
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
