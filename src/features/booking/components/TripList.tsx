import React, { useState } from 'react';
import { type Trip } from '../../admin/api/trip.service';
import { BookingService, type Seat } from '../api/booking.service';
import { useBookingStore } from '../../../store/useBookingStore';
import { SeatMap } from './SeatMap';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  MapPin, 
  Bus as BusIcon, 
  Info, 
  Wifi, 
  Zap, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Luggage,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TripListProps {
  trips: Trip[];
  isLoading: boolean;
}

export const TripList: React.FC<TripListProps> = ({ trips, isLoading }) => {
  const navigate = useNavigate();
  const { selectedTrip, setSelectedTrip, selectedSeats, selectedSeatIds, startHoldTimer } = useBookingStore();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [expandedDetailTripId, setExpandedDetailTripId] = useState<number | null>(null);

  React.useEffect(() => {
    if (trips.length === 1 && selectedTrip?.id !== trips[0].id) {
      handleSelectTrip(trips[0]);
    }
  }, [trips]);

  const handleSelectTrip = async (trip: Trip) => {
    if (selectedTrip?.id === trip.id) {
      setSelectedTrip(null);
      return;
    }
    
    setSelectedTrip(trip);
    setLoadingSeats(true);
    try {
      const res = await BookingService.getSeatLayout(trip.id);
      if (res.success && res.data) {
        setSeats(res.data);
      }
    } catch (error) {
      toast.error('Không thể lấy sơ đồ ghế từ máy chủ');
      setSelectedTrip(null);
    } finally {
      setLoadingSeats(false);
    }
  };

  const toggleTripDetails = (tripId: number) => {
    setExpandedDetailTripId(prev => (prev === tripId ? null : tripId));
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 chỗ ngồi');
      return;
    }
    startHoldTimer();
    navigate('/checkout');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-white border border-gray-200 rounded-2xl p-6 animate-pulse space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 w-48 bg-gray-100 rounded"></div>
            <div className="h-10 w-full bg-gray-100 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-500 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4">
          <BusIcon size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy chuyến xe nào phù hợp</h3>
        <p className="text-gray-500 max-w-md mx-auto text-sm">
          Vui lòng thử chọn ngày khởi hành khác hoặc thay đổi điểm đi, điểm đến để tìm kiếm thêm chuyến.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {trips.map((trip) => {
        const isSeatMapOpen = selectedTrip?.id === trip.id;
        const isDetailOpen = expandedDetailTripId === trip.id;
        const availableSeatsCount = trip.availableSeats !== undefined 
          ? trip.availableSeats 
          : (trip.vehicle?.capacity || 40);

        return (
          <div 
            key={trip.id} 
            className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* THÔNG TIN TỔNG QUAN CHUYẾN XE */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Cột trái: Giờ giấc & Lộ trình */}
                <div className="flex-1 space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                      <BusIcon size={14} />
                      <span>{trip.vehicle?.type || 'Giường nằm Limousine cao cấp'}</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Còn {availableSeatsCount} chỗ trống
                    </span>
                    {trip.vehicle?.licensePlate && (
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        Biển số: {trip.vehicle.licensePlate}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Giờ xuất bến & Điểm đi */}
                    <div className="flex items-start space-x-3">
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100"></div>
                        <div className="w-0.5 h-12 bg-gray-200 my-1"></div>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-red-500 bg-white"></div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="text-xl font-extrabold text-gray-900">
                            {new Date(trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-sm font-semibold text-gray-800">
                            {trip.route?.departureLocation}
                          </div>
                          <div className="text-xs text-gray-400">
                            Khởi hành: {new Date(trip.departureTime).toLocaleDateString('vi-VN')}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            {trip.route?.arrivalLocation}
                          </div>
                          <div className="text-xs text-gray-400">
                            {trip.route?.distanceKm ? `Khoảng ${trip.route.distanceKm} km` : 'Điểm đến trả khách'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tiện ích tóm tắt */}
                    <div className="hidden sm:flex flex-col justify-center space-y-2 text-xs text-gray-500 border-l border-gray-100 pl-6">
                      <div className="flex items-center gap-2">
                        <Wifi size={14} className="text-blue-500" />
                        <span>Wifi tốc độ cao miễn phí</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" />
                        <span>Cổng sạc điện thoại từng vị trí</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span>Bảo hiểm chuyến đi trọn gói</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cột phải: Giá vé & Nút thao tác */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-8 gap-4 min-w-[220px]">
                  <div className="text-right w-full sm:w-auto lg:w-full">
                    <div className="text-xs text-gray-400">Giá vé mỗi ghế</div>
                    <div className="text-3xl font-black text-blue-600">
                      {formatCurrency(trip.price)}
                    </div>
                  </div>

                  <div className="flex flex-col w-full gap-2.5">
                    {/* Nút Chọn chuyến / Mở sơ đồ ghế */}
                    <button 
                      type="button"
                      onClick={() => handleSelectTrip(trip)}
                      className={`w-full py-3 px-5 rounded-2xl font-bold text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 ${
                        isSeatMapOpen 
                          ? 'bg-slate-800 text-white hover:bg-slate-900' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md shadow-blue-500/20'
                      }`}
                    >
                      <BusIcon size={16} />
                      <span>{isSeatMapOpen ? 'Đóng sơ đồ ghế' : 'Chọn chỗ & Đặt vé'}</span>
                    </button>

                    {/* Nút Xem chi tiết chuyến xe */}
                    <button
                      type="button"
                      onClick={() => toggleTripDetails(trip.id)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Info size={14} className="text-blue-500" />
                      <span>{isDetailOpen ? 'Thu gọn chi tiết' : 'Xem chi tiết chuyến xe'}</span>
                      {isDetailOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* PHẦN CHI TIẾT CHUYẾN XE (EXPANDABLE DETAIL PANEL) */}
            {isDetailOpen && (
              <div className="bg-slate-50 border-t border-gray-200 p-6 md:p-8 animate-in slide-in-from-top-2 duration-200">
                <div className="max-w-4xl mx-auto space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Lịch trình đón trả */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <MapPin size={16} className="text-red-500" />
                        <span>Lịch trình & Lộ trình</span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-2">
                        <div>
                          <span className="font-semibold text-gray-700">Điểm đón:</span> Bến xe trung tâm {trip.route?.departureLocation}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Điểm trả:</span> Bến xe khách {trip.route?.arrivalLocation}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Cự ly di chuyển:</span> {trip.route?.distanceKm ? `${trip.route.distanceKm} km` : 'Theo lộ trình chuẩn'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Thời gian dự kiến:</span> {trip.route?.durationMinutes ? `${Math.floor(trip.route.durationMinutes / 60)}h ${trip.route.durationMinutes % 60}p` : '5 - 6 tiếng'}
                        </div>
                      </div>
                    </div>

                    {/* 2. Tiện ích xe */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <Sparkles size={16} className="text-amber-500" />
                        <span>Tiện ích trên xe</span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>Wifi 5G tốc độ cao không giới hạn</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>Cổng sạc Type-C và USB tiện lợi</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>Nước suối và khăn lạnh miễn phí</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span>Chăn gối khử trùng thơm tho</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Chính sách & Hành lý */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <Luggage size={16} className="text-emerald-500" />
                        <span>Chính sách vé & Hành lý</span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-2">
                        <div>
                          <span className="font-semibold text-gray-700">Hành lý:</span> Tối đa 20kg hành lý ký gửi + túi xách tay.
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Đổi/Hủy vé:</span> Trước 24h miễn phí, trước 12h phí 10%.
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Lên xe:</span> Xuất trình mã vé điện tử QR trước 15 phút.
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* PHẦN SƠ ĐỒ GHẾ VÀ LỰA CHỌN CHỖ NGỒI (SEAT MAP EXPANSION) */}
            {isSeatMapOpen && (
              <div className="bg-slate-50/70 p-6 md:p-8 border-t border-gray-200 animate-in slide-in-from-top-3 duration-300">
                {loadingSeats ? (
                  <div className="text-center py-12 text-gray-500 space-y-3">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div className="text-sm font-semibold">Đang tải dữ liệu sơ đồ ghế thực tế...</div>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    
                    {/* Bản đồ ghế */}
                    <SeatMap seats={seats} />
                    
                    {/* Thanh tóm tắt chọn ghế cố định phía dưới */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-xl z-20">
                      <div>
                        <div className="text-xs text-gray-400 font-medium">Ghế bạn đang chọn:</div>
                        <div className="text-base font-bold text-gray-900">
                          {selectedSeats.length > 0 ? (
                            <span className="text-blue-600">{selectedSeats.join(', ')}</span>
                          ) : (
                            <span className="text-gray-400 font-normal">Chưa chọn ghế nào (Tối đa 5 ghế)</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                          <div className="text-xs text-gray-400 font-medium">Tổng tiền ({selectedSeats.length} vé):</div>
                          <div className="text-2xl font-black text-blue-600">
                            {formatCurrency(selectedSeats.length * trip.price)}
                          </div>
                        </div>

                        <button 
                          type="button"
                          onClick={handleContinue}
                          disabled={selectedSeats.length === 0}
                          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
                        >
                          Tiếp tục
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
};
