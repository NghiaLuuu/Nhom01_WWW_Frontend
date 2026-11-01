import React, { useState, useEffect, useRef } from 'react';
import { BookingService } from '../../booking/api/booking.service';
import { TripService, type Trip } from '../api/trip.service';
import type { BookingItem, TicketItem, CheckInResult } from '../../booking/types/booking.types';
import { 
  Search, 
  RefreshCw, 
  Ticket, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  QrCode, 
  Eye, 
  AlertCircle,
  FileCheck2,
  ListFilter,
  CreditCard,
  Plus,
  ArrowLeftRight,
  Bus,
  ScanLine,
  Users
} from 'lucide-react';
import { CounterSaleModal } from '../components/CounterSaleModal';
import { ChangeSeatModal } from '../../booking/components/ChangeSeatModal';
import { PassengerManifestModal } from '../components/PassengerManifestModal';
import toast from 'react-hot-toast';

export const TicketManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'CHECK_IN'>('BOOKINGS');
  
  // Bookings state
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [ticketCounts, setTicketCounts] = useState<Record<number, number>>({});
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchTicketCode, setSearchTicketCode] = useState('');

  // Selected Booking for Tickets Modal
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [bookingTickets, setBookingTickets] = useState<TicketItem[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Counter Sale Modal
  const [isCounterSaleOpen, setIsCounterSaleOpen] = useState(false);

  // Change Seat Modal
  const [changeSeatTicket, setChangeSeatTicket] = useState<TicketItem | null>(null);

  // Check-In Tab State
  const [trips, setTrips] = useState<Trip[]>([]);
  const [checkInTripId, setCheckInTripId] = useState<number | ''>('');
  const [checkInCode, setCheckInCode] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [lastCheckInResult, setLastCheckInResult] = useState<CheckInResult | null>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInResult[]>([]);
  const checkInInputRef = useRef<HTMLInputElement>(null);

  // Manifest modal state
  const [selectedManifestTrip, setSelectedManifestTrip] = useState<Trip | null>(null);
  const [isManifestOpen, setIsManifestOpen] = useState(false);

  // Fetch Bookings from backend
  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      let res;
      if (!searchPhone.trim() && !searchTicketCode.trim()) {
        res = await BookingService.getAllBookingsAdmin();
      } else {
        res = await BookingService.searchBookings({
          phoneNumber: searchPhone.trim() || undefined,
          ticketCode: searchTicketCode.trim() || undefined,
        });
      }
      if (res.success && Array.isArray(res.data)) {
        // The admin booking endpoint may return only one nested ticket even when
        // the booking has multiple seats. Fetch the ticket lists for accurate counts.
        const bookingTicketCounts = await Promise.all(
          res.data.map(async (booking: BookingItem) => {
            const fallbackCount = booking.tickets?.length || booking.seats?.length || 1;
            try {
              const ticketsRes = await BookingService.getTicketsByBookingId(booking.id);
              return [booking.id, ticketsRes.success && Array.isArray(ticketsRes.data)
                ? ticketsRes.data.length
                : fallbackCount] as const;
            } catch {
              return [booking.id, fallbackCount] as const;
            }
          })
        );
        setTicketCounts(Object.fromEntries(bookingTicketCounts));
        setBookings(res.data);
      } else {
        setTicketCounts({});
        setBookings([]);
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error('Lỗi khi tải danh sách đơn đặt vé');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Fetch Trips for Check-in tab
  const fetchTripsForCheckIn = async () => {
    try {
      const res = await TripService.getAll();
      if (res.success && Array.isArray(res.data)) {
        setTrips(res.data);
      }
    } catch (err) {
      console.error('Error loading trips for check-in:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'BOOKINGS') {
      fetchBookings();
    } else if (activeTab === 'CHECK_IN') {
      fetchTripsForCheckIn();
      setTimeout(() => checkInInputRef.current?.focus(), 100);
    }
  }, [activeTab]);

  // Selected Trip & Real-time Gate Schedule Calculation
  const selectedTrip = trips.find(t => t.id === Number(checkInTripId));

  const getTripGateStatus = (trip?: Trip) => {
    if (!trip || !trip.departureTime) return null;
    const depTime = new Date(trip.departureTime);
    const now = new Date();
    // Gate open: 60 minutes before departure
    const openTime = new Date(depTime.getTime() - 60 * 60 * 1000);
    // Gate close: 10 minutes before departure
    const closeTime = new Date(depTime.getTime() - 10 * 60 * 1000);

    const isBeforeOpen = now.getTime() < openTime.getTime();
    const isOpen = now.getTime() >= openTime.getTime() && now.getTime() <= closeTime.getTime();
    const isClosed = now.getTime() > closeTime.getTime() && now.getTime() < depTime.getTime();
    const isDeparted = now.getTime() >= depTime.getTime();

    const minUntilOpen = Math.max(0, Math.round((openTime.getTime() - now.getTime()) / 60000));
    const minUntilClose = Math.max(0, Math.round((closeTime.getTime() - now.getTime()) / 60000));

    return {
      depTime,
      openTime,
      closeTime,
      isBeforeOpen,
      isOpen,
      isClosed,
      isDeparted,
      minUntilOpen,
      minUntilClose
    };
  };

  const currentGateInfo = getTripGateStatus(selectedTrip);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  // Open Tickets Modal for a booking
  const handleOpenTicketsModal = async (booking: BookingItem) => {
    setSelectedBooking(booking);
    setIsLoadingTickets(true);
    try {
      const res = await BookingService.getTicketsByBookingId(booking.id);
      if (res.success && Array.isArray(res.data)) {
        setBookingTickets(res.data);
      } else {
        setBookingTickets([]);
      }
    } catch (err) {
      toast.error('Không thể tải chi tiết danh sách vé');
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Update specific ticket status (only used for reverting a check-in).
  const handleUpdateTicketStatus = async (ticketId: number, status: 'USED' | 'CANCELLED' | 'ISSUED') => {
    if (status === 'USED') {
      const ticket = bookingTickets.find(item => item.id === ticketId);
      if (!ticket?.ticketCode) {
        toast.error('Không tìm thấy mã vé để soát vé.');
        return;
      }

      await doCheckIn(ticket.ticketCode);
      return;
    }

    const toastId = toast.loading('Đang cập nhật trạng thái vé...');
    try {
      const res = await BookingService.updateTicketStatus(ticketId, status);
      if (res.success) {
        toast.success('Đã cập nhật trạng thái vé!', { id: toastId });
        setBookingTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
      } else {
        toast.error(res.message || 'Cập nhật thất bại', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái vé', { id: toastId });
    }
  };

  // Cancel Single Ticket
  const handleCancelSingleTicket = async (ticket: TicketItem) => {
    const reason = window.prompt(`Xác nhận hủy vé ${ticket.ticketCode} (Ghế ${ticket.seat?.seatName})?\nNhập lý do hủy:`, 'Khách yêu cầu hủy vé');
    if (reason === null) return;

    const toastId = toast.loading('Đang xử lý hủy vé lẻ...');
    try {
      const res = await BookingService.cancelSingleTicket(ticket.id, reason);
      if (res.success) {
        toast.success('Hủy vé thành công!', { id: toastId });
        setBookingTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'CANCELLED' } : t));
      } else {
        toast.error(res.message || 'Hủy vé không thành công', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi hủy vé', { id: toastId });
    }
  };

  // Check-in is only permitted during the gate window enforced by the server.
  const doCheckIn = async (code: string) => {
    if (!code.trim()) {
      toast.error('Vui lòng nhập hoặc quét mã vé!');
      return;
    }

    if (currentGateInfo && !currentGateInfo.isOpen) {
      const message = currentGateInfo.isBeforeOpen
        ? `Chưa đến giờ soát vé. Cổng mở lúc ${currentGateInfo.openTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}.`
        : 'Cổng soát vé đã đóng để chốt danh sách hành khách và xếp hành lý.';
      setCheckInError(message);
      toast.error(message);
      return;
    }

    setIsCheckingIn(true);
    setCheckInError(null);
    const toastId = toast.loading('Đang xác thực và soát vé...');
    try {
      const res = await BookingService.checkInTicket({
        ticketCodeOrQr: code.trim(),
        tripId: checkInTripId !== '' ? Number(checkInTripId) : undefined
      });

      if (res.success && res.data) {
        toast.success(`HỢP LỆ: Soát vé thành công cho ${res.data.customerName}!`, { id: toastId });
        setLastCheckInResult(res.data);
        setRecentCheckIns(prev => [res.data, ...prev.slice(0, 9)]);
        setCheckInCode('');
      } else {
        setCheckInError(res.message || 'Vé không hợp lệ');
        toast.error(res.message || 'Vé không hợp lệ', { id: toastId });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Lỗi khi kiểm tra vé';
      setCheckInError(errMsg);
      toast.error(errMsg, { id: toastId });
    } finally {
      setIsCheckingIn(false);
      checkInInputRef.current?.focus();
    }
  };

  // Handle Check-In Form Submit
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doCheckIn(checkInCode);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="mr-1" />
            Đã thanh toán
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 size={12} className="mr-1" />
            Đã hoàn thành
          </span>
        );
      case 'PENDING_PAYMENT':
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} className="mr-1" />
            Đang giữ chỗ
          </span>
        );
      case 'CANCEL_REQUESTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <AlertCircle size={12} className="mr-1" />
            Yêu cầu hủy
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} className="mr-1" />
            Đã hủy
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
            Hết hạn giữ chỗ
          </span>
        );
      case 'ISSUED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="mr-1" />
            Đã xuất vé
          </span>
        );
      default: {
        const viMap: Record<string, string> = {
          PAID: 'Đã thanh toán',
          COMPLETED: 'Đã hoàn thành',
          SUCCESS: 'Thành công',
          PENDING: 'Chờ xử lý',
          PENDING_PAYMENT: 'Chờ thanh toán',
          CANCELLED: 'Đã hủy',
          CANCEL_REQUESTED: 'Yêu cầu hủy',
          EXPIRED: 'Hết hạn',
          ISSUED: 'Đã xuất vé',
          USED: 'Đã sử dụng',
          RESERVED: 'Đã giữ chỗ',
          ACTIVE: 'Hoạt động',
        };
        const text = viMap[status] || status;
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {text}
          </span>
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Ticket size={16} />
            <span>Hệ thống Quản lý Vé & Đơn Đặt Chỗ</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Quản lý Đơn Đặt Vé & Soát Vé
          </h1>
          <p className="text-xs text-gray-500">
            Bán vé tại quầy POS, tra cứu đơn vé thời gian thực và soát vé lên xe QR.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* POS Counter Sale Button */}
          <button
            onClick={() => setIsCounterSaleOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center space-x-2 text-xs font-bold shadow-md shadow-blue-600/20"
          >
            <CreditCard size={15} />
            <span>Bán Vé Tại Quầy (POS)</span>
          </button>

          <button
            onClick={() => {
              if (activeTab === 'BOOKINGS') fetchBookings();
              else fetchTripsForCheckIn();
            }}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors flex items-center space-x-2 text-xs font-bold"
          >
            <RefreshCw size={15} className={isLoadingBookings ? 'animate-spin text-blue-600' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('BOOKINGS')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'BOOKINGS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Ticket size={14} />
              <span>Đơn đặt vé ({bookings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('CHECK_IN')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'CHECK_IN'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ScanLine size={14} />
              <span>Soát Vé Lên Xe (Check-in)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Bookings Filter */}
        {activeTab === 'BOOKINGS' && (
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm theo số điện thoại khách..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm theo mã vé lẻ (VX...)..."
                value={searchTicketCode}
                onChange={(e) => setSearchTicketCode(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={isLoadingBookings}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center space-x-1"
              >
                <Search size={14} />
                <span>Tìm kiếm</span>
              </button>
              {(searchPhone || searchTicketCode) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchPhone('');
                    setSearchTicketCode('');
                    fetchBookings();
                  }}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </form>
        )}

        {/* Tab 2: Check-in Tab */}
        {activeTab === 'CHECK_IN' && (
          <div className="space-y-5 pt-2">
            
            {/* Check-in Time Policy Banner */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-4 sm:p-5 border border-blue-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Clock size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-blue-950 text-sm tracking-tight">
                    Thời Gian Cho Phép Soát Vé Lên Xe
                  </h3>
                  <div className="text-xs text-blue-900 space-y-1">
                    <p className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                      <span><strong>Mở cổng soát vé:</strong> Tối thiểu <strong>30 – 60 phút</strong> trước giờ xe khởi hành.</span>
                    </p>
                    <p className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0"></span>
                      <span><strong>Đóng cổng soát vé:</strong> Trước giờ xe xuất bến từ <strong>5 – 10 phút</strong> để tài xế/phụ xe chốt danh sách hành khách và xếp hành lý.</span>
                    </p>
                  </div>
                </div>
              </div>

              {selectedTrip && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedManifestTrip(selectedTrip);
                    setIsManifestOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center space-x-1.5 shrink-0"
                >
                  <Users size={15} />
                  <span>Bảng Kê & Chốt Danh Sách (#{selectedTrip.id})</span>
                </button>
              )}
            </div>

            {/* Selected Trip Gate Status Live Banner */}
            {selectedTrip && currentGateInfo && (
              <div className={`p-4 rounded-2xl border transition-all ${
                currentGateInfo.isOpen 
                  ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                  : currentGateInfo.isBeforeOpen
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                  : currentGateInfo.isClosed
                  ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                  : 'bg-gray-100 border-gray-300 text-gray-700'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        currentGateInfo.isOpen 
                          ? 'bg-emerald-600 text-white animate-pulse'
                          : currentGateInfo.isBeforeOpen
                          ? 'bg-amber-500 text-white'
                          : currentGateInfo.isClosed
                          ? 'bg-rose-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}>
                        {currentGateInfo.isOpen ? '🟢 ĐANG MỞ CỔNG SOÁT VÉ' :
                         currentGateInfo.isBeforeOpen ? '🟡 CHƯA ĐẾN GIỜ SOÁT VÉ' :
                         currentGateInfo.isClosed ? '🔴 CỔNG ĐÃ ĐÓNG (CHỐT DANH SÁCH & HÀNH LÝ)' :
                         '⚫ XE ĐÃ XUẤT BẾN'}
                      </span>
                      <span className="text-xs font-bold">
                        Chuyến #{selectedTrip.id}: {selectedTrip.route?.departureLocation} → {selectedTrip.route?.arrivalLocation} ({selectedTrip.vehicle?.licensePlate})
                      </span>
                    </div>

                    <p className="text-xs font-medium">
                      {currentGateInfo.isOpen && (
                        <span>
                          Cổng đang mở đón khách! Dự kiến đóng cổng lúc <strong>{currentGateInfo.closeTime.toLocaleTimeString('vi-VN')}</strong> (còn <strong>{currentGateInfo.minUntilClose} phút</strong> để chốt danh sách & xếp hành lý).
                        </span>
                      )}
                      {currentGateInfo.isBeforeOpen && (
                        <span>
                          Cổng chưa đến giờ mở. Sẽ mở vào lúc <strong>{currentGateInfo.openTime.toLocaleTimeString('vi-VN')}</strong> (còn <strong>{currentGateInfo.minUntilOpen} phút</strong> nữa). Xe xuất bến lúc {currentGateInfo.depTime.toLocaleTimeString('vi-VN')}.
                        </span>
                      )}
                      {currentGateInfo.isClosed && (
                        <span>
                          Cổng soát vé đã ĐÓNG lúc <strong>{currentGateInfo.closeTime.toLocaleTimeString('vi-VN')}</strong>. Tài xế & phụ xe đang chốt danh sách và xếp hành lý. Xe xuất bến lúc <strong>{currentGateInfo.depTime.toLocaleTimeString('vi-VN')}</strong>.
                        </span>
                      )}
                      {currentGateInfo.isDeparted && (
                        <span>
                          Chuyến xe đã xuất bến vào lúc <strong>{currentGateInfo.depTime.toLocaleString('vi-VN')}</strong>.
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-mono font-bold shrink-0">
                    <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-current/20">
                      Mở: {currentGateInfo.openTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>→</span>
                    <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-current/20">
                      Đóng: {currentGateInfo.closeTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Scanner Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="relative z-10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    <ScanLine size={16} />
                    <span>Cổng Soát Vé / Quét Mã QR Lên Xe</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Chỉ cho phép soát vé trong khung giờ mở cổng.
                  </span>
                </div>
                
                <form onSubmit={handleCheckInSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Lọc theo chuyến xe (Tùy chọn)
                    </label>
                    <select
                      value={checkInTripId}
                      onChange={e => setCheckInTripId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tất cả các chuyến</option>
                      {trips.map(trip => {
                        const g = getTripGateStatus(trip);
                        const statusTag = g ? (g.isOpen ? ' [Đang mở]' : g.isBeforeOpen ? ' [Chưa mở]' : g.isClosed ? ' [Đã đóng]' : ' [Đã chạy]') : '';
                        return (
                          <option key={trip.id} value={trip.id}>
                            #{trip.id} - {trip.route?.departureLocation} → {trip.route?.arrivalLocation} ({new Date(trip.departureTime).toLocaleTimeString('vi-VN')}){statusTag}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Mã vé hoặc Nội dung quét QR *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          ref={checkInInputRef}
                          type="text"
                          required
                          placeholder="Quét mã QR hoặc nhập mã vé (vd: VX...)"
                          value={checkInCode}
                          onChange={e => setCheckInCode(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isCheckingIn || Boolean(currentGateInfo && !currentGateInfo.isOpen)}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed text-white text-xs font-black transition-colors shadow-md shadow-emerald-600/30 flex items-center space-x-1.5 shrink-0"
                      >
                        {isCheckingIn ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
                        <span>Soát Vé</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Check-in Live Result Alert */}
            {lastCheckInResult && (
              <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-300 animate-in fade-in space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        HỢP LỆ - ĐÃ SOÁT VÉ
                      </span>
                      <h3 className="text-xl font-black text-emerald-950 mt-0.5">
                        {lastCheckInResult.customerName || 'Hành khách'} - Ghế {lastCheckInResult.seatName}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl">
                    {lastCheckInResult.ticketCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/80 p-4 rounded-xl border border-emerald-200 text-xs">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Chuyến xe:</span>
                    <span className="font-bold text-gray-900">{lastCheckInResult.departureLocation} → {lastCheckInResult.arrivalLocation}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Giờ khởi hành:</span>
                    <span className="font-bold text-gray-900">{new Date(lastCheckInResult.departureTime).toLocaleString('vi-VN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Biển số xe:</span>
                    <span className="font-bold text-blue-600">{lastCheckInResult.licensePlate}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Số điện thoại:</span>
                    <span className="font-bold text-gray-900">{lastCheckInResult.customerPhone || '-'}</span>
                  </div>
                </div>
              </div>
            )}

            {checkInError && (
              <div className="bg-rose-50 rounded-2xl p-5 border-2 border-rose-300 space-y-3 animate-in fade-in">
                <div className="flex items-start space-x-3 text-xs text-rose-800 font-bold">
                  <XCircle size={24} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-black text-rose-950 uppercase tracking-tight">VÉ KHÔNG HỢP LỆ HOẶC CÓ CẢNH BÁO</p>
                    <p className="text-rose-700 font-semibold leading-relaxed">{checkInError}</p>
                  </div>
                </div>

              </div>
            )}

            {/* Recent Check-in Logs */}
            {recentCheckIns.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Hành khách vừa soát vé gần nhất ({recentCheckIns.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {recentCheckIns.map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-blue-700 font-mono">{item.ticketCode}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Ghế {item.seatName}
                        </span>
                      </div>
                      <p className="font-bold text-gray-900 truncate">{item.customerName}</p>
                      <p className="text-[10px] text-gray-400">
                        {item.departureLocation} → {item.arrivalLocation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab Content: Bookings List */}
      {activeTab === 'BOOKINGS' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoadingBookings ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw size={24} className="animate-spin mx-auto text-blue-600" />
              <p className="text-xs text-gray-400">Đang tải danh sách đơn đặt vé...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Ticket size={32} className="mx-auto text-gray-300" />
              <p className="text-xs text-gray-500 font-bold">Không tìm thấy đơn đặt vé nào</p>
              <p className="text-[11px] text-gray-400">Thử tìm kiếm với số điện thoại hoặc mã vé khác</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3.5 px-4">Mã Đơn</th>
                    <th className="py-3.5 px-4">Khách Hàng</th>
                    <th className="py-3.5 px-4">Chuyến Xe</th>
                    <th className="py-3.5 px-4">Ghế / Vé</th>
                    <th className="py-3.5 px-4 text-right">Tổng Tiền</th>
                    <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                    <th className="py-3.5 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((booking) => {
                    const trip = booking.trip;
                    const seatCount = ticketCounts[booking.id] || booking.tickets?.length || booking.seats?.length || 1;
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-blue-600">#{booking.id}</span>
                          <span className="block text-[10px] text-gray-400">
                            {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-gray-900">{booking.customer?.fullName || 'Khách vãng lai'}</div>
                          <div className="text-[11px] text-gray-500 flex items-center space-x-1">
                            <Phone size={11} className="text-gray-400" />
                            <span>{booking.customer?.phoneNumber || booking.customer?.email || '-'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-gray-800">
                            {trip?.route?.departureLocation} → {trip?.route?.arrivalLocation}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {trip?.departureTime ? new Date(trip.departureTime).toLocaleString('vi-VN') : '-'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                            {seatCount} vé
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-gray-900">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalPrice)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenTicketsModal(booking)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors inline-flex items-center space-x-1"
                          >
                            <Eye size={13} />
                            <span>Xem vé & QR</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tickets & QR Inspection Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  CHI TIẾT VÉ & MÃ SOÁT QR
                </span>
                <h3 className="text-xl font-black text-gray-900">
                  Đơn hàng #{selectedBooking.id} • {selectedBooking.customer?.fullName || 'Khách hàng'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
              >
                ✕
              </button>
            </div>

            {isLoadingTickets ? (
              <div className="text-center py-12 space-y-2">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500">Đang tải danh sách vé và mã QR...</p>
              </div>
            ) : bookingTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Không có vé riêng lẻ nào được tạo cho đơn này.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingTickets.map((ticket) => {
                  const isCancelled = selectedBooking.status === 'CANCELLED' || ticket.status === 'CANCELLED';

                  return (
                  <div key={ticket.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      {/* QR Thumbnail */}
                      <div className="w-20 h-20 bg-white p-1 rounded-xl border border-gray-200 flex items-center justify-center flex-shrink-0">
                        {ticket.qrCode ? (
                          <img 
                            src={ticket.qrCode.startsWith('data:image') ? ticket.qrCode : `data:image/png;base64,${ticket.qrCode}`} 
                            alt="QR" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <QrCode size={40} className="text-gray-400" />
                        )}
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-blue-600 text-sm font-mono">{ticket.ticketCode}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCancelled ? 'bg-rose-100 text-rose-800' :
                            ticket.status === 'USED' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {isCancelled || ticket.status === 'CANCELLED' ? 'Đã hủy' : ticket.status === 'USED' ? 'Đã soát vé' : ticket.status === 'ISSUED' ? 'Đã xuất vé' : ticket.status === 'RESERVED' ? 'Đã giữ chỗ' : ticket.status === 'NO_SHOW' ? 'Vắng mặt' : ticket.status}
                          </span>
                        </div>
                        <p className="text-gray-700 font-bold">
                          Ghế: <span className="text-blue-700 text-sm">{ticket.seat?.seatName || ticket.seatNumber || 'N/A'}</span> (Tầng {ticket.seat?.floor || 1})
                        </p>
                        <p className="text-gray-500 text-[11px]">
                          Giá vé: {new Intl.NumberFormat('vi-VN').format(ticket.price)}₫
                        </p>
                      </div>
                    </div>

                    {/* Staff Control Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {!isCancelled && ticket.status === 'ISSUED' && (
                        <>
                          <button
                            onClick={() => handleUpdateTicketStatus(ticket.id, 'USED')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center space-x-1"
                          >
                            <FileCheck2 size={13} />
                            <span>Soát vé</span>
                          </button>
                          <button
                            onClick={() => setChangeSeatTicket(ticket)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs transition-colors flex items-center space-x-1"
                          >
                            <ArrowLeftRight size={13} />
                            <span>Đổi ghế</span>
                          </button>
                        </>
                      )}
                      {!isCancelled && ticket.status === 'USED' && (
                        <button
                          onClick={() => handleUpdateTicketStatus(ticket.id, 'ISSUED')}
                          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold text-xs transition-colors"
                        >
                          Hoàn tác
                        </button>
                      )}
                      {!isCancelled && (
                        <button
                          onClick={() => handleCancelSingleTicket(ticket)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold text-xs transition-colors"
                        >
                          Hủy vé
                        </button>
                      )}
                      {isCancelled && (
                        <span className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-semibold text-xs">
                          Đã hủy
                        </span>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

      {/* POS Counter Sale Modal */}
      <CounterSaleModal
        isOpen={isCounterSaleOpen}
        onClose={() => setIsCounterSaleOpen(false)}
        onSuccess={fetchBookings}
      />

      {/* Change Seat Modal */}
      <ChangeSeatModal
        isOpen={Boolean(changeSeatTicket)}
        ticket={changeSeatTicket}
        tripId={selectedBooking?.trip?.id || null}
        vehicleId={selectedBooking?.trip?.vehicle?.id || null}
        onClose={() => setChangeSeatTicket(null)}
        onSuccess={(updated) => {
          setBookingTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
          setChangeSeatTicket(null);
        }}
      />

      {/* Passenger Manifest Modal */}
      <PassengerManifestModal
        isOpen={isManifestOpen}
        tripId={selectedManifestTrip?.id || null}
        tripSummary={selectedManifestTrip ? {
          departure: selectedManifestTrip.route?.departureLocation || '',
          arrival: selectedManifestTrip.route?.arrivalLocation || '',
          time: new Date(selectedManifestTrip.departureTime).toLocaleTimeString('vi-VN'),
          licensePlate: selectedManifestTrip.vehicle?.licensePlate || ''
        } : undefined}
        onClose={() => {
          setIsManifestOpen(false);
          setSelectedManifestTrip(null);
        }}
      />

    </div>
  );
};
