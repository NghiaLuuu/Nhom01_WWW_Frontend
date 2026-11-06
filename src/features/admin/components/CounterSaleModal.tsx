import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Bus,
  User,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2,
  Printer,
  RefreshCw,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { BookingService } from '../../booking/api/booking.service';
import { TripService, type Trip } from '../api/trip.service';
import type { SeatItem, BookingItem } from '../../booking/types/booking.types';
import { SearchableSelect } from '../../../components/SearchableSelect';
import toast from 'react-hot-toast';

interface CounterSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CounterSaleModal: React.FC<CounterSaleModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [departureFilter, setDepartureFilter] = useState('');
  const [arrivalFilter, setArrivalFilter] = useState('');
  const [departureDateFilter, setDepartureDateFilter] = useState('');

  // Seat map state
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [occupiedSeatIds, setOccupiedSeatIds] = useState<number[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);

  // Customer state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'VNPAY'>('CASH');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state
  const [createdBooking, setCreatedBooking] = useState<BookingItem | null>(null);

  // Load active trips
  useEffect(() => {
    if (isOpen) {
      setCreatedBooking(null);
      setSelectedTripId(null);
      setSelectedSeatIds([]);
      setDepartureFilter('');
      setArrivalFilter('');
      setDepartureDateFilter('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setNote('');
      fetchTrips();
    }
  }, [isOpen]);

  const fetchTrips = async () => {
    setIsLoadingTrips(true);
    try {
      const res = await TripService.getAll();
      if (res.success && Array.isArray(res.data)) {
        // Filter trips in the future or active
        setTrips(res.data);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách chuyến xe');
    } finally {
      setIsLoadingTrips(false);
    }
  };

  // When trip changes, load vehicle seats and occupied seats
  useEffect(() => {
    if (!selectedTripId) return;
    const currentTrip = trips.find(t => t.id === selectedTripId);
    if (!currentTrip || !currentTrip.vehicle) return;

    const loadSeats = async () => {
      setIsLoadingSeats(true);
      setSelectedSeatIds([]);
      try {
        const [seatsRes, occupiedRes] = await Promise.all([
          BookingService.getSeatsByVehicle(currentTrip.vehicle.id),
          BookingService.getOccupiedSeats(selectedTripId)
        ]);

        if (seatsRes.success && Array.isArray(seatsRes.data)) {
          setSeats(seatsRes.data);
        }
        if (occupiedRes.success && Array.isArray(occupiedRes.data)) {
          setOccupiedSeatIds(occupiedRes.data);
        }
      } catch (err) {
        toast.error('Lỗi khi tải sơ đồ ghế cho chuyến xe này');
      } finally {
        setIsLoadingSeats(false);
      }
    };

    loadSeats();
  }, [selectedTripId, trips]);

  const departureLocations = [...new Set(trips.map(trip => trip.route?.departureLocation).filter(Boolean))];
  const arrivalLocations = [...new Set(trips.map(trip => trip.route?.arrivalLocation).filter(Boolean))];
  const filteredTrips = trips.filter(trip => {
    const departureDate = trip.departureTime?.slice(0, 10);
    return trip.posBookingOpen !== false
      && (!departureFilter || trip.route?.departureLocation?.toLocaleLowerCase('vi-VN').includes(departureFilter.toLocaleLowerCase('vi-VN')))
      && (!arrivalFilter || trip.route?.arrivalLocation?.toLocaleLowerCase('vi-VN').includes(arrivalFilter.toLocaleLowerCase('vi-VN')))
      && (!departureDateFilter || departureDate === departureDateFilter);
  });
  const selectedTrip = filteredTrips.find(t => t.id === selectedTripId);

  const resetTripSelection = () => {
    setSelectedTripId(null);
    setSeats([]);
    setOccupiedSeatIds([]);
    setSelectedSeatIds([]);
  };

  const toggleSeat = (seatId: number) => {
    if (occupiedSeatIds.includes(seatId)) return;
    setSelectedSeatIds(prev =>
      prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]
    );
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const totalPrice = selectedTrip ? selectedTrip.price * selectedSeatIds.length : 0;

  const floorOneSeats = seats.filter(seat => seat.floor === 1 || !seat.floor);
  const floorTwoSeats = seats.filter(seat => seat.floor === 2);
  // Older vehicles may not have a floor assigned. Show their layout as two decks
  // when the vehicle is large enough, so the counter screen remains consistent.
  const splitIntoDecks = floorTwoSeats.length > 0 || seats.length > 18;
  const lowerDeck = floorTwoSeats.length > 0
    ? floorOneSeats
    : seats.slice(0, Math.ceil(seats.length / 2));
  const upperDeck = floorTwoSeats.length > 0
    ? floorTwoSeats
    : seats.slice(Math.ceil(seats.length / 2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId) {
      toast.error('Vui lòng chọn chuyến xe!');
      return;
    }
    if (selectedSeatIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ghế ngồi!');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Vui lòng nhập họ tên khách hàng!');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại khách hàng!');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Đang xử lý xuất vé tại quầy...');
    try {
      const res = await BookingService.createCounterSale({
        tripId: selectedTripId,
        seatIds: selectedSeatIds,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        paymentMethod: paymentMethod,
        note: note.trim() || undefined
      });

      if (res.success && res.data) {
        toast.success('Bán vé và xuất hóa đơn tại quầy thành công!', { id: toastId });
        setCreatedBooking(res.data);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.message || 'Xuất vé không thành công', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo đơn bán vé tại quầy', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-hidden">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[calc(100vh-1.5rem)] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Bán Vé Trực Tiếp Tại Quầy</h2>
              <p className="text-xs text-slate-300">Xuất vé nhanh cho khách hàng vãng lai thanh toán tiền mặt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
          {createdBooking ? (
            /* Success Screen */
            <div className="py-8 px-4 text-center max-w-lg mx-auto space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900">Xuất Vé Thành Công!</h3>
                <p className="text-xs text-gray-500">
                  Đơn đặt vé đã được kích hoạt trạng thái <span className="font-bold text-emerald-600">ĐÃ THANH TOÁN</span>.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 text-left border border-gray-200 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã đơn đặt vé:</span>
                  <span className="font-mono font-bold text-blue-600">#{createdBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hành khách:</span>
                  <span className="font-bold text-gray-900">{customerName} ({customerPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Chuyến xe:</span>
                  <span className="font-medium text-gray-900">
                    {selectedTrip?.route.departureLocation} → {selectedTrip?.route.arrivalLocation}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số ghế đã chọn:</span>
                  <span className="font-bold text-blue-600">
                    {seats.filter(s => selectedSeatIds.includes(s.id)).map(s => s.seatName).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-sm">
                  <span className="font-bold text-gray-700">Tổng thu tiền mặt:</span>
                  <span className="font-black text-emerald-600">{formatVND(totalPrice)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a
                  href={`/bookings/${createdBooking.id}/e-ticket`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Printer size={16} />
                  <span>In Vé Lên Xe / Vé Điện Tử</span>
                </a>
                <button
                  onClick={() => {
                    setCreatedBooking(null);
                    setSelectedSeatIds([]);
                    setCustomerName('');
                    setCustomerPhone('');
                  }}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  Bán Vé Tiếp Theo
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Step 1: Select Trip */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <Bus size={14} className="text-blue-600" />
                  <span>1. Chọn chuyến xe khởi hành</span>
                </label>

                {isLoadingTrips ? (
                  <div className="p-4 text-center text-xs text-gray-400">Đang tải danh sách chuyến...</div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="space-y-1">
                        <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1"><MapPin size={12} /> Điểm đi</span>
                        <input
                          type="search"
                          list="pos-departure-locations"
                          value={departureFilter}
                          onChange={(e) => { setDepartureFilter(e.target.value); resetTripSelection(); }}
                          placeholder="Nhập điểm đi"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-medium bg-white"
                        />
                        <datalist id="pos-departure-locations">
                          {departureLocations.map(location => <option key={location} value={location} />)}
                        </datalist>
                      </label>
                      <label className="space-y-1">
                        <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1"><MapPin size={12} /> Điểm đến</span>
                        <input
                          type="search"
                          list="pos-arrival-locations"
                          value={arrivalFilter}
                          onChange={(e) => { setArrivalFilter(e.target.value); resetTripSelection(); }}
                          placeholder="Nhập điểm đến"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-medium bg-white"
                        />
                        <datalist id="pos-arrival-locations">
                          {arrivalLocations.map(location => <option key={location} value={location} />)}
                        </datalist>
                      </label>
                      <label className="space-y-1">
                        <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1"><Calendar size={12} /> Ngày đi</span>
                        <input
                          type="date"
                          value={departureDateFilter}
                          onChange={(e) => { setDepartureDateFilter(e.target.value); resetTripSelection(); }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-medium bg-white"
                        />
                      </label>
                    </div>

                    <SearchableSelect
                      value={selectedTripId ?? ''}
                      onChange={(e) => setSelectedTripId(e.target.value ? Number(e.target.value) : null)}
                      disabled={filteredTrips.length === 0}
                      placeholder={filteredTrips.length ? 'Chọn chuyến xe phù hợp' : 'Không có chuyến xe phù hợp'}
                      emptyMessage="Không tìm thấy kết quả"
                      options={filteredTrips.map(trip => ({
                        value: trip.id,
                        label: `#${trip.id} | ${trip.route?.departureLocation} → ${trip.route?.arrivalLocation} | ${new Date(trip.departureTime).toLocaleString('vi-VN')} | Xe ${trip.vehicle?.licensePlate} (${formatVND(trip.price)}/vé)`,
                      }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-bold text-gray-900 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                )}
              </div>

              {/* Step 2: Seat Map Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 size={14} className="text-blue-600" />
                    <span>2. Chọn ghế ngồi trên xe ({selectedSeatIds.length} ghế đã chọn)</span>
                  </label>
                  <div className="flex items-center space-x-3 text-[11px]">
                    <span className="flex items-center space-x-1">
                      <div className="w-3.5 h-3.5 rounded-md bg-white border border-gray-300" />
                      <span className="text-gray-500">Còn trống</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="w-3.5 h-3.5 rounded-md bg-blue-600" />
                      <span className="text-gray-900 font-bold">Đang chọn</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="w-3.5 h-3.5 rounded-md bg-gray-200 border border-gray-300" />
                      <span className="text-gray-400">Đã bán</span>
                    </span>
                  </div>
                </div>

                {isLoadingSeats ? (
                  <div className="p-8 text-center text-xs text-gray-400">Đang tải sơ đồ ghế...</div>
                ) : (
                  <div className={`grid gap-4 ${splitIntoDecks ? 'grid-cols-1 md:grid-cols-2' : 'max-w-md mx-auto'}`}>
                    {[
                      { title: splitIntoDecks ? 'Tầng 1 (Dưới)' : 'Sơ đồ ghế xe', deckSeats: lowerDeck },
                      ...(splitIntoDecks ? [{ title: 'Tầng 2 (Trên)', deckSeats: upperDeck }] : []),
                    ].map(({ title, deckSeats }) => (
                      <section key={title} className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3">
                        <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
                          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
                          <span className="text-xs font-medium text-gray-500">{deckSeats.length} chỗ</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {deckSeats.map(seat => {
                            const isOccupied = occupiedSeatIds.includes(seat.id);
                            const isSelected = selectedSeatIds.includes(seat.id);
                            return (
                              <button
                                key={seat.id}
                                type="button"
                                disabled={isOccupied}
                                onClick={() => toggleSeat(seat.id)}
                                className={`h-11 rounded-xl text-center font-bold text-xs transition-all flex flex-col items-center justify-center ${isOccupied
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                                  : isSelected
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600 ring-offset-1'
                                    : 'bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50 border-2 border-gray-200'
                                }`}
                              >
                                <span>{seat.seatName}</span>
                                {isOccupied && <span className="text-[9px] font-normal opacity-70">Đã đặt</span>}
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Customer Information & Payment */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <User size={14} className="text-blue-600" />
                  <span>3. Thông tin hành khách & Thanh toán</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Họ và tên khách *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0912345678"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Email (để nhận vé điện tử)</label>
                    <input
                      type="email"
                      placeholder="khachhang@email.com"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Hình thức thanh toán</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 bg-white"
                    >
                      <option value="CASH">Tiền mặt tại quầy (Đã thu tiền)</option>
                      <option value="VNPAY">Chuyển khoản VNPay QR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-600 mb-1 block">Ghi chú (Tùy chọn)</label>
                  <input
                    type="text"
                    placeholder="Điểm đón khách, yêu cầu riêng..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Total & Action Footer */}
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-gray-500">Tổng tiền thu trực tiếp:</p>
                  <p className="text-xl font-black text-blue-700">{formatVND(totalPrice)}</p>
                  <p className="text-[10px] text-gray-400">({selectedSeatIds.length} vé x {formatVND(selectedTrip?.price || 0)})</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-white"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || selectedSeatIds.length === 0}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/20 flex items-center space-x-2"
                  >
                    {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                    <span>Xác Nhận Xuất Vé Tại Quầy</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  , document.body);
};
