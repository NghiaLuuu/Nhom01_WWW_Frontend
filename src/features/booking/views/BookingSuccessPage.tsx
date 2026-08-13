import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';

export const BookingSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingDetails = location.state?.bookingDetails;

  if (!bookingDetails) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden">
        {/* Success Header */}
        <div className="bg-green-50 p-8 text-center border-b border-green-100">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Thanh toán thành công!</h1>
          <p className="text-green-700 font-medium text-lg">Chuyến đi của bạn đã được xác nhận</p>
        </div>

        {/* Ticket Info */}
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Mã đặt vé</p>
                <p className="text-2xl font-bold text-blue-600">{bookingDetails.bookingId}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tên khách hàng</p>
                  <p className="font-semibold text-gray-900">{bookingDetails.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                  <p className="font-semibold text-gray-900">{bookingDetails.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vị trí ghế</p>
                  <p className="font-semibold text-gray-900">{bookingDetails.seats.join(', ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                  <p className="font-semibold text-red-600">
                    {new Intl.NumberFormat('vi-VN').format(bookingDetails.totalPrice)}đ
                  </p>
                </div>
              </div>
            </div>
            
            {/* Dummy QR Code */}
            <div className="flex flex-col items-center justify-center md:border-l border-gray-200 md:pl-8">
              <div className="w-40 h-40 bg-gray-100 p-2 rounded-xl mb-4 border-2 border-dashed border-gray-300 flex items-center justify-center">
                 <div className="text-center text-gray-400 text-xs">
                    [ QR Code giả lập ] <br/><br/>
                    Dùng mã này để lên xe
                 </div>
              </div>
              <p className="text-xs text-gray-500 text-center">Vui lòng xuất trình mã này<br/>cho lơ xe khi lên xe</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 p-6 flex flex-col md:flex-row justify-center gap-4">
          <button 
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            <Download size={18} />
            <span>Tải vé điện tử</span>
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
          >
            <ArrowLeft size={18} />
            <span>Về trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
