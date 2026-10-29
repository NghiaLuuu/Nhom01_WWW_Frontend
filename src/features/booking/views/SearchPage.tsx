import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { type Trip } from '../../admin/api/trip.service';
import { type Route } from '../../admin/api/route.service';
import { BookingService, type RouteLocations } from '../api/booking.service';
import { TripList } from '../components/TripList';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Navigation, 
  Filter, 
  Bus, 
  Clock, 
  SlidersHorizontal 
} from 'lucide-react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

export const SearchPage: React.FC = () => {
  useDocumentTitle('Tra cứu chuyến & tuyến xe');
  const [searchParams, setSearchParams] = useSearchParams();

  const initialDeparture = searchParams.get('departure') || '';
  const initialArrival = searchParams.get('arrival') || '';
  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const initialTab = searchParams.get('tab') === 'routes' ? 'routes' : 'trips';
  const tripId = searchParams.get('tripId');

  // Form states
  const [departure, setDeparture] = useState(initialDeparture);
  const [arrival, setArrival] = useState(initialArrival);
  const [date, setDate] = useState(initialDate);
  const [activeTab, setActiveTab] = useState<'trips' | 'routes'>(initialTab);

  // Data states
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [locations, setLocations] = useState<RouteLocations>({ departures: [], arrivals: [] });
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routeKeyword, setRouteKeyword] = useState('');

  // Filters & Sorting for Trips
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [sortBy, setSortBy] = useState<'early' | 'late' | 'price-asc' | 'price-desc'>('early');

  // Load locations on mount
  useEffect(() => {
    BookingService.getRouteLocations().then(res => {
      if (res.success && res.data) {
        setLocations(res.data);
      }
    });
  }, []);

  // Fetch Trips
  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoadingTrips(true);
      try {
        if (tripId) {
          const res = await BookingService.getTripById(tripId);
          if (res.success && res.data) {
            setTrips([res.data]);
          }
        } else {
          const res = await BookingService.searchTrips(departure, arrival, date);
          if (res.success && res.data) {
            setTrips(res.data);
          }
        }
      } catch (error) {
        console.error('Lỗi tải danh sách chuyến xe:', error);
      } finally {
        setIsLoadingTrips(false);
      }
    };

    fetchTrips();
  }, [departure, arrival, date, tripId]);

  // Fetch Routes when switching to routes tab
  useEffect(() => {
    if (activeTab === 'routes') {
      setIsLoadingRoutes(true);
      BookingService.getActiveRoutes().then(res => {
        if (res.success && res.data) {
          setRoutes(res.data);
        }
      }).finally(() => {
        setIsLoadingRoutes(false);
      });
    }
  }, [activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('trips');
    setSearchParams({
      departure,
      arrival,
      date
    });
  };

  const handleSelectRoute = (r: Route) => {
    setDeparture(r.departureLocation);
    setArrival(r.arrivalLocation);
    setActiveTab('trips');
    setSearchParams({
      departure: r.departureLocation,
      arrival: r.arrivalLocation,
      date
    });
  };

  // Filter & Sort trips in client
  const filteredTrips = trips.filter(trip => {
    if (timeFilter === 'all') return true;
    const hour = new Date(trip.departureTime).getHours();
    if (timeFilter === 'morning') return hour >= 5 && hour < 12;
    if (timeFilter === 'afternoon') return hour >= 12 && hour < 18;
    if (timeFilter === 'evening') return hour >= 18 || hour < 5;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'early') return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    if (sortBy === 'late') return new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime();
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  // Filter routes by keyword
  const filteredRoutes = routes.filter(r => {
    if (!routeKeyword.trim()) return true;
    const q = routeKeyword.toLowerCase();
    return r.departureLocation.toLowerCase().includes(q) || r.arrivalLocation.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Datalists for autocomplete */}
      <datalist id="search-departures">
        {locations.departures.map((item, idx) => (
          <option key={idx} value={item} />
        ))}
      </datalist>
      <datalist id="search-arrivals">
        {locations.arrivals.map((item, idx) => (
          <option key={idx} value={item} />
        ))}
      </datalist>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* THANH TÌM KIẾM NHANH (SEARCH BAR) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            
            {/* Điểm đi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1.5">
                <Navigation size={14} className="text-blue-600" />
                <span>Điểm đi</span>
              </label>
              <input
                type="text"
                list="search-departures"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                placeholder="Nơi xuất phát"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Điểm đến */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1.5">
                <MapPin size={14} className="text-red-500" />
                <span>Điểm đến</span>
              </label>
              <input
                type="text"
                list="search-arrivals"
                value={arrival}
                onChange={(e) => setArrival(e.target.value)}
                placeholder="Nơi đến"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Ngày đi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1.5">
                <Calendar size={14} className="text-amber-500" />
                <span>Ngày khởi hành</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>

            {/* Nút tìm kiếm */}
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <Search size={18} />
              <span>Tra cứu vé</span>
            </button>
          </form>
        </div>

        {/* TAB CHUYỂN ĐỔI: CHUYẾN XE VS TUYẾN ĐƯỜNG */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('trips')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'trips'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Bus size={18} />
              <span>Danh Sách Chuyến Xe ({filteredTrips.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('routes')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'routes'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <MapPin size={18} />
              <span>Tra Cứu Tuyến Đường</span>
            </button>
          </div>

          {activeTab === 'trips' && (
            <div className="hidden md:flex items-center gap-3 text-xs text-gray-500 font-medium">
              <span>{departure || 'Tất cả điểm đi'}</span>
              <span>→</span>
              <span>{arrival || 'Tất cả điểm đến'}</span>
              <span>•</span>
              <span>{date ? new Date(date).toLocaleDateString('vi-VN') : 'Mọi ngày'}</span>
            </div>
          )}
        </div>

        {/* NỘI DUNG TAB 1: DANH SÁCH CHUYẾN XE */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            
            {/* Bộ lọc nhanh cho chuyến xe */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-500 font-semibold flex items-center gap-1">
                  <Filter size={14} /> Buổi xuất bến:
                </span>
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    timeFilter === 'all' ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setTimeFilter('morning')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    timeFilter === 'morning' ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sáng (05:00 - 12:00)
                </button>
                <button
                  onClick={() => setTimeFilter('afternoon')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    timeFilter === 'afternoon' ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Chiều (12:00 - 18:00)
                </button>
                <button
                  onClick={() => setTimeFilter('evening')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    timeFilter === 'evening' ? 'bg-blue-100 text-blue-700 font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tối (18:00 - 24:00)
                </button>
              </div>

              {/* Sắp xếp */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-semibold flex items-center gap-1">
                  <SlidersHorizontal size={14} /> Sắp xếp:
                </span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 font-medium outline-none cursor-pointer focus:bg-white"
                >
                  <option value="early">Giờ đi: Sớm nhất</option>
                  <option value="late">Giờ đi: Muộn nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                </select>
              </div>
            </div>

            {/* Danh sách chuyến xe */}
            <TripList trips={filteredTrips} isLoading={isLoadingTrips} />
          </div>
        )}

        {/* NỘI DUNG TAB 2: TRA CỨU TUYẾN ĐƯỜNG (PACKAGE ROUTE FOR CUSTOMER) */}
        {activeTab === 'routes' && (
          <div className="space-y-6">
            
            {/* Thanh lọc tuyến đường */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                value={routeKeyword}
                onChange={(e) => setRouteKeyword(e.target.value)}
                placeholder="Lọc tuyến đường theo địa danh (ví dụ: Đà Lạt, Nha Trang, Sài Gòn...)"
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>

            {isLoadingRoutes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-white rounded-2xl border border-gray-200 animate-pulse"></div>
                ))}
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-500">
                <MapPin size={32} className="mx-auto text-gray-300 mb-3" />
                <p>Không tìm thấy tuyến đường nào phù hợp với từ khóa.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                          Mã tuyến: #{route.id}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                          Đang hoạt động
                        </span>
                      </div>

                      <div className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                        <span>{route.departureLocation}</span>
                        <ArrowRight size={16} className="text-gray-400" />
                        <span>{route.arrivalLocation}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {route.distanceKm && <span>Quãng đường: {route.distanceKm} km</span>}
                        {route.durationMinutes && (
                          <span>Thời gian: {Math.floor(route.durationMinutes / 60)}h {route.durationMinutes % 60}p</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-gray-400">Giá vé cơ bản</div>
                        <div className="text-lg font-black text-blue-600">
                          {new Intl.NumberFormat('vi-VN').format(route.basePrice)}đ
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectRoute(route)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Search size={14} />
                        <span>Tìm chuyến tuyến này</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
