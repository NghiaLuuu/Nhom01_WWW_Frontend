import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { type Trip } from '../../admin/api/trip.service';
import { BookingService } from '../api/booking.service';
import { TripList } from '../components/TripList';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowLeftRight, 
  SlidersHorizontal, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw,
  Clock,
  Bus,
  Tag,
  Check
} from 'lucide-react';
import { dispatchTrackAction } from '../../../hooks/useUserTracker';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const departureParam = searchParams.get('departure') || '';
  const arrivalParam = searchParams.get('arrival') || '';
  const dateParam = searchParams.get('date') || '';
  const tripIdParam = searchParams.get('tripId');

  // Input states for top search refinement bar
  const [departure, setDeparture] = useState(departureParam);
  const [arrival, setArrival] = useState(arrivalParam);
  const [date, setDate] = useState(dateParam);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [maxPrice, setMaxPrice] = useState<number>(800000);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'RECOMMENDED' | 'PRICE_ASC' | 'TIME_ASC' | 'RATING'>('RECOMMENDED');

  // Sync state if query params change
  useEffect(() => {
    setDeparture(departureParam);
    setArrival(arrivalParam);
    setDate(dateParam);
  }, [departureParam, arrivalParam, dateParam]);

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        if (tripIdParam) {
          const res = await BookingService.getTripById(tripIdParam);
          if (res.success && res.data) {
            setTrips([res.data]);
          }
        } else {
          const res = await BookingService.searchTrips(departureParam, arrivalParam, dateParam);
          if (res.success && Array.isArray(res.data)) {
            setTrips(res.data);
          } else {
            setTrips([]);
          }
        }
      } catch (error) {
        console.error('Lỗi tải chuyến xe:', error);
        setTrips([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [departureParam, arrivalParam, dateParam, tripIdParam]);

  // Handle Search Refinement submit
  const handleRefineSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchTrackAction('REFINE_SEARCH', { departure, arrival, date });
    setSearchParams({
      departure: departure.trim(),
      arrival: arrival.trim(),
      date: date
    });
  };

  // Swap Departure and Arrival
  const handleSwapLocations = () => {
    setDeparture(arrival);
    setArrival(departure);
  };

  // Quick date selector (Today, Tomorrow, Day After)
  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const dateStr = d.toISOString().split('T')[0];
    setDate(dateStr);
    setSearchParams({
      departure: departure.trim(),
      arrival: arrival.trim(),
      date: dateStr
    });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setMaxPrice(800000);
    setSelectedTimeSlots([]);
    setSelectedVehicleTypes([]);
    setSortBy('RECOMMENDED');
  };

  // Toggle Time Slot Filter
  const toggleTimeSlot = (slotKey: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(slotKey) ? prev.filter(k => k !== slotKey) : [...prev, slotKey]
    );
  };

  // Toggle Vehicle Type Filter
  const toggleVehicleType = (typeKey: string) => {
    setSelectedVehicleTypes(prev =>
      prev.includes(typeKey) ? prev.filter(k => k !== typeKey) : [...prev, typeKey]
    );
  };

  // Filter & Sort Logic
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips];

    // Filter by max price
    result = result.filter(trip => (trip.price || 0) <= maxPrice);

    // Filter by departure time slot
    if (selectedTimeSlots.length > 0) {
      result = result.filter(trip => {
        try {
          const hours = new Date(trip.departureTime).getHours();
          return selectedTimeSlots.some(slot => {
            if (slot === 'EARLY') return hours >= 0 && hours < 6;
            if (slot === 'MORNING') return hours >= 6 && hours < 12;
            if (slot === 'AFTERNOON') return hours >= 12 && hours < 18;
            if (slot === 'EVENING') return hours >= 18 && hours <= 23;
            return false;
          });
        } catch {
          return true;
        }
      });
    }

    // Filter by vehicle type
    if (selectedVehicleTypes.length > 0) {
      result = result.filter(trip => {
        const capacity = trip.vehicle?.capacity || 34;
        return selectedVehicleTypes.some(vt => {
          if (vt === 'LIMO_VIP' && capacity <= 24) return true;
          if (vt === 'LIMO_ROOM' && capacity > 24 && capacity <= 34) return true;
          if (vt === 'BED_45' && capacity > 34) return true;
          return false;
        });
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'TIME_ASC') {
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      }
      return 0; // RECOMMENDED / default
    });

    return result;
  }, [trips, maxPrice, selectedTimeSlots, selectedVehicleTypes, sortBy]);

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return 'Tất cả các ngày';
    try {
      const d = new Date(dateString);
      return `Thứ ${d.getDay() === 0 ? 'Chủ nhật' : d.getDay() + 1}, ${d.getDate()} thg ${d.getMonth() + 1}, ${d.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-32">
      
      {/* Top Search Refinement Sticky Bar */}
      <section className="sticky top-16 z-40 bg-slate-950/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-cyan-950/30 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleRefineSearch} className="flex flex-col lg:flex-row items-center gap-3">
            
            {/* Input: Departure */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                <MapPin size={16} />
              </div>
              <input 
                type="text"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                placeholder="Điểm đi (Ví dụ: TP.HCM)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/15 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwapLocations}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-white/10 flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer active:scale-90"
              title="Đổi chiều điểm đi / điểm đến"
            >
              <ArrowLeftRight size={15} />
            </button>

            {/* Input: Arrival */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-400">
                <MapPin size={16} />
              </div>
              <input 
                type="text"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                placeholder="Điểm đến (Ví dụ: Nha Trang)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/15 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Input: Date */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-amber-400">
                <Calendar size={16} />
              </div>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/15 focus:border-cyan-400 rounded-xl text-white text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full lg:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/25 shrink-0 cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Search size={16} />
              <span>Tìm chuyến</span>
            </button>

          </form>

          {/* Quick Date Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5 text-xs text-slate-400">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ngày nhanh:</span>
            <button
              type="button"
              onClick={() => setQuickDate(0)}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(1)}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              Ngày mai
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(2)}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              Ngày mốt
            </button>
          </div>

        </div>
      </section>

      {/* Main Content Area: Flex layout for sidebar + list */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Results Header Title */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
              <Sparkles size={13} className="text-cyan-400" />
              <span>Kết quả tìm kiếm xe khách chất lượng cao</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{departureParam && arrivalParam ? `${departureParam} → ${arrivalParam}` : 'Tất cả chuyến xe hiện có'}</span>
            </h1>
            
            <p className="text-slate-400 text-xs sm:text-sm font-light mt-1">
              {formatDateDisplay(dateParam)} • Tìm thấy <strong className="text-cyan-400 font-bold">{filteredAndSortedTrips.length}</strong> chuyến phù hợp
            </p>
          </div>

          {/* Quick Sort Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 overflow-x-auto shrink-0">
            <button
              onClick={() => setSortBy('RECOMMENDED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                sortBy === 'RECOMMENDED' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ✨ Gợi ý AI
            </button>
            <button
              onClick={() => setSortBy('PRICE_ASC')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                sortBy === 'PRICE_ASC' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💰 Giá rẻ nhất
            </button>
            <button
              onClick={() => setSortBy('TIME_ASC')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                sortBy === 'TIME_ASC' 
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⏰ Giờ sớm nhất
            </button>
          </div>
        </div>

        {/* 2 Columns: Flex sidebar + main trip list */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Multi-faceted Filter Sidebar */}
          <aside className="w-full lg:w-[320px] xl:w-[340px] shrink-0 rounded-3xl bg-slate-900/70 backdrop-blur-2xl border border-white/10 p-6 space-y-6 shadow-2xl">
            
            {/* Sidebar Title & Reset Button */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-cyan-400" />
                <span>Bộ lọc nâng cao</span>
              </h3>
              
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Đặt lại các tiêu chí lọc về mặc định"
              >
                <RotateCcw size={12} />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Filter: Max Price Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Giá vé tối đa:
                </span>
                <span className="text-sm font-black text-cyan-400 font-mono">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(maxPrice)}
                </span>
              </div>

              <input 
                type="range"
                min="100000"
                max="800000"
                step="20000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>100.000đ</span>
                <span>800.000đ</span>
              </div>
            </div>

            {/* Filter: Departure Time Slots */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={13} className="text-indigo-400" />
                <span>Khung giờ xuất bến</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'EARLY', label: 'Sáng sớm', desc: '00:00 - 06:00' },
                  { key: 'MORNING', label: 'Buổi sáng', desc: '06:00 - 12:00' },
                  { key: 'AFTERNOON', label: 'Buổi chiều', desc: '12:00 - 18:00' },
                  { key: 'EVENING', label: 'Buổi tối', desc: '18:00 - 24:00' }
                ].map(slot => {
                  const isActive = selectedTimeSlots.includes(slot.key);
                  return (
                    <button
                      key={slot.key}
                      type="button"
                      onClick={() => toggleTimeSlot(slot.key)}
                      className={`h-[60px] p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isActive 
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div className="h-4 font-semibold text-xs flex items-center justify-between">
                        <span>{slot.label}</span>
                        {isActive && <Check size={12} className="text-cyan-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{slot.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter: Vehicle Type */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Bus size={13} className="text-cyan-400" />
                <span>Loại xe & Dịch vụ</span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { key: 'LIMO_VIP', label: 'Limousine VIP 24 phòng', desc: 'Phòng riêng, ghế massage' },
                  { key: 'LIMO_ROOM', label: 'Limousine 34 phòng VIP', desc: 'Rèm che riêng tư, cổng sạc' },
                  { key: 'BED_45', label: 'Xe Giường nằm 45 chỗ', desc: 'Tiết kiệm, thoải mái' }
                ].map(vt => {
                  const isActive = selectedVehicleTypes.includes(vt.key);
                  return (
                    <div 
                      key={vt.key}
                      onClick={() => toggleVehicleType(vt.key)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-semibold' 
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{vt.label}</div>
                        <div className="text-[10px] text-slate-400 font-light">{vt.desc}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isActive ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-600'
                      }`}>
                        {isActive && <Check size={12} className="font-bold" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trust Guarantee Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 space-y-2 text-xs text-slate-300">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck size={15} />
                <span>Cam Kết Dịch Vụ VEXE</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-400 font-light list-disc list-inside">
                <li>100% giữ đúng số ghế đã chọn</li>
                <li>Hoàn tiền 150% nếu nhà xe tự ý hủy</li>
                <li>Đổi vé trực tuyến không mất phí trước 24h</li>
              </ul>
            </div>

          </aside>

          {/* Right Column: Trip Cards List */}
          <section className="flex-1 min-w-0 w-full">
            <TripList trips={filteredAndSortedTrips} isLoading={isLoading} />
          </section>

        </div>

      </main>
    </div>
  );
};
