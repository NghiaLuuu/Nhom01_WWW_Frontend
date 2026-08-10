import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from './features/auth';
import { AdminLayout } from './layouts/AdminLayout';

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
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<AuthWrapper isLogin={true} />} />
        <Route path="/register" element={<AuthWrapper isLogin={false} />} />
        
        {/* Admin Routes with Layout Wrapper */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Outlet contents */}
          <Route index element={
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Bảng Điều Khiển</h2>
              <p className="text-gray-500">Chào mừng bạn đến với hệ thống quản trị VEXEBUS.</p>
            </div>
          } />
          
          <Route path="trips" element={
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-800">Quản Lý Chuyến Xe</h2>
            </div>
          } />
          
          {/* Catch all inside admin */}
          <Route path="*" element={
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500 py-20">
              Tính năng đang được phát triển...
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
