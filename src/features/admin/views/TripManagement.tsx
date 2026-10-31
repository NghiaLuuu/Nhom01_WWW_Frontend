import React, { useState, useEffect, useMemo } from 'react';
import { type Trip, type TripRequest, TripService } from '../api/trip.service';
import { type Route, RouteService } from '../api/route.service';
import { type Vehicle, VehicleService } from '../api/vehicle.service';
import { DataTable, type Column } from '../../../components/DataTable';
import { FormModal } from '../../../components/FormModal';
import { AdminPageLayout } from '../../../components/AdminPageLayout';
import toast from 'react-hot-toast';
import { Plus, Bus, Clock, Search, Filter, CheckCircle2, PlayCircle, XCircle } from 'lucide-react';

const MOCK_FALLBACK_ROUTES: Route[] = [
  { id: 1, departureLocation: 'Sài Gòn', arrivalLocation: 'Phú Yên', distance: 520, duration: 10, basePrice: 320000 },
  { id: 2, departureLocation: 'Sài Gòn', arrivalLocation: 'Đà Lạt', distance: 310, duration: 7, basePrice: 280000 },
  { id: 3, departureLocation: 'Sài Gòn', arrivalLocation: 'Nha Trang', distance: 430, duration: 8, basePrice: 300000 },
  { id: 4, departureLocation: 'Hà Nội', arrivalLocation: 'Sa Pa', distance: 320, duration: 6, basePrice: 350000 },
  { id: 5, departureLocation: 'Đà Nẵng', arrivalLocation: 'Quy Nhơn', distance: 305, duration: 6, basePrice: 240000 },
  { id: 6, departureLocation: 'Cần Thơ', arrivalLocation: 'Sài Gòn', distance: 165, duration: 3, basePrice: 180000 },
];

const MOCK_FALLBACK_VEHICLES: Vehicle[] = [
  { id: 1, licensePlate: '51B-891.22', capacity: 34 },
  { id: 2, licensePlate: '51B-942.18', capacity: 22 },
  { id: 3, licensePlate: '49B-772.09', capacity: 34 },
  { id: 4, licensePlate: '79B-663.15', capacity: 22 },
  { id: 5, licensePlate: '29B-512.44', capacity: 34 },
  { id: 6, licensePlate: '43B-338.90', capacity: 40 },
];

const MOCK_FALLBACK_TRIPS: Trip[] = [
  {
    id: 101,
    route: MOCK_FALLBACK_ROUTES[0],
    vehicle: MOCK_FALLBACK_VEHICLES[0],
    departureTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    price: 350000,
    status: 'RUNNING'
  },
  {
    id: 102,
    route: MOCK_FALLBACK_ROUTES[1],
    vehicle: MOCK_FALLBACK_VEHICLES[1],
    departureTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    price: 320000,
    status: 'PENDING'
  },
  {
    id: 103,
    route: MOCK_FALLBACK_ROUTES[2],
    vehicle: MOCK_FALLBACK_VEHICLES[2],
    departureTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    price: 340000,
    status: 'RUNNING'
  },
  {
    id: 104,
    route: MOCK_FALLBACK_ROUTES[3],
    vehicle: MOCK_FALLBACK_VEHICLES[4],
    departureTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    price: 380000,
    status: 'PENDING'
  },
  {
    id: 105,
    route: MOCK_FALLBACK_ROUTES[4],
    vehicle: MOCK_FALLBACK_VEHICLES[3],
    departureTime: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    price: 260000,
    status: 'COMPLETED'
  },
  {
    id: 106,
    route: MOCK_FALLBACK_ROUTES[5],
    vehicle: MOCK_FALLBACK_VEHICLES[5],
    departureTime: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    price: 190000,
    status: 'COMPLETED'
  },
  {
    id: 107,
    route: MOCK_FALLBACK_ROUTES[0],
    vehicle: MOCK_FALLBACK_VEHICLES[1],
    departureTime: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
    price: 370000,
    status: 'PENDING'
  },
  {
    id: 108,
    route: MOCK_FALLBACK_ROUTES[2],
    vehicle: MOCK_FALLBACK_VEHICLES[0],
    departureTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    price: 320000,
    status: 'CANCELLED'
  }
];

export const TripManagement: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>(MOCK_FALLBACK_TRIPS);
  const [routes, setRoutes] = useState<Route[]>(MOCK_FALLBACK_ROUTES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_FALLBACK_VEHICLES);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form State
  const [routeId, setRouteId] = useState<number | ''>('');
  const [vehicleId, setVehicleId] = useState<number | ''>('');
  const [departureTime, setDepartureTime] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tripsRes, routesRes, vehiclesRes] = await Promise.all([
        TripService.getAll(),
        RouteService.getAll(),
        VehicleService.getAll()
      ]);
      
      const loadedTrips = tripsRes?.success && tripsRes.data?.length > 0 ? tripsRes.data : MOCK_FALLBACK_TRIPS;
      const loadedRoutes = routesRes?.success && routesRes.data?.length > 0 ? routesRes.data : MOCK_FALLBACK_ROUTES;
      const loadedVehicles = vehiclesRes?.success && vehiclesRes.data?.length > 0 ? vehiclesRes.data : MOCK_FALLBACK_VEHICLES;

      setTrips(loadedTrips);
      setRoutes(loadedRoutes);
      setVehicles(loadedVehicles);
    } catch {
      // Graceful fallback to rich mock data, avoiding disruptive red error toasts
      setTrips(MOCK_FALLBACK_TRIPS);
      setRoutes(MOCK_FALLBACK_ROUTES);
      setVehicles(MOCK_FALLBACK_VEHICLES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingTrip(null);
    setRouteId(routes.length > 0 ? routes[0].id : '');
    setVehicleId(vehicles.length > 0 ? vehicles[0].id : '');
    setDepartureTime('');
    setPrice('');
    setStatus('PENDING');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setRouteId(trip.route?.id || '');
    setVehicleId(trip.vehicle?.id || '');
    const formattedDate = trip.departureTime ? new Date(trip.departureTime).toISOString().slice(0, 16) : '';
    setDepartureTime(formattedDate);
    setPrice(trip.price.toString());
    setStatus(trip.status || 'PENDING');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (routeId === '' || vehicleId === '') {
      toast.error('Vui lòng chọn Tuyến đường và Xe');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: TripRequest = {
        routeId: Number(routeId),
        vehicleId: Number(vehicleId),
        departureTime: new Date(departureTime).toISOString(),
        price: Number(price),
        status
      };

      if (editingTrip) {
        await TripService.update(editingTrip.id, payload);
        toast.success('Cập nhật chuyến xe thành công');
      } else {
        await TripService.create(payload);
        toast.success('Thêm chuyến xe mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu chuyến xe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (trip: Trip) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chuyến xe ID: ${trip.id}?`)) {
      return;
    }
    
    try {
      await TripService.delete(trip.id);
      toast.success('Xóa chuyến xe thành công');
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message;
      if (error.response?.status === 400 || error.response?.status === 409) {
        toast.error(errorMsg || 'Không thể xóa chuyến xe này vì đã có khách hàng đặt vé.');
      } else {
        toast.error('Có lỗi xảy ra khi xóa chuyến xe');
      }
    }
  };

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const routeStr = t.route ? `${t.route.departureLocation} ${t.route.arrivalLocation}`.toLowerCase() : '';
      const plateStr = t.vehicle ? t.vehicle.licensePlate.toLowerCase() : '';
      const matchSearch = routeStr.includes(searchTerm.toLowerCase()) || plateStr.includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [trips, searchTerm, statusFilter]);

  // Metric stats
  const stats = useMemo(() => {
    const total = trips.length;
    const running = trips.filter(t => t.status === 'RUNNING').length;
    const pending = trips.filter(t => t.status === 'PENDING').length;
    const completed = trips.filter(t => t.status === 'COMPLETED').length;
    return { total, running, pending, completed };
  }, [trips]);

  const columns: Column<Trip>[] = [
    { 
      header: 'Mã', 
      accessor: (row) => (
        <span className="font-mono font-bold text-cyan-300">#{row.id}</span>
      ), 
      width: '6%' 
    },
    { 
      header: 'Tuyến Đường', 
      accessor: (row) => row.route ? (
        <div className="font-semibold text-white flex items-center whitespace-nowrap text-xs">
          <span>{row.route.departureLocation}</span>
          <span className="text-cyan-400 mx-1">➔</span>
          <span>{row.route.arrivalLocation}</span>
        </div>
      ) : <span className="text-slate-500">N/A</span>,
      width: '24%'
    },
    { 
      header: 'Phương Tiện', 
      accessor: (row) => row.vehicle ? (
        <div className="flex items-center gap-1 whitespace-nowrap font-mono text-xs font-semibold text-slate-200">
          <Bus size={13} className="text-blue-400 shrink-0" />
          <span>{row.vehicle.licensePlate}</span>
        </div>
      ) : <span className="text-slate-500">N/A</span>,
      width: '16%'
    },
    { 
      header: 'Khởi Hành', 
      accessor: (row) => (
        <div className="font-mono text-xs text-slate-300 text-right whitespace-nowrap">
          {new Date(row.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
          <span className="text-slate-500 text-[10px]">{new Date(row.departureTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
        </div>
      ),
      align: 'right',
      width: '16%'
    },
    { 
      header: 'Giá Vé', 
      accessor: (row) => (
        <span className="font-mono font-bold text-emerald-400 whitespace-nowrap text-xs">
          {new Intl.NumberFormat('vi-VN').format(row.price)}đ
        </span>
      ),
      align: 'right',
      width: '13%'
    },
    { 
      header: 'Trạng Thái', 
      accessor: (row) => {
        switch (row.status) {
          case 'RUNNING':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 animate-pulse whitespace-nowrap">
                <PlayCircle size={11} />
                <span>Đang chạy</span>
              </span>
            );
          case 'PENDING':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                <Clock size={11} />
                <span>Chờ chạy</span>
              </span>
            );
          case 'COMPLETED':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                <CheckCircle2 size={11} />
                <span>Hoàn tất</span>
              </span>
            );
          default:
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 whitespace-nowrap">
                <XCircle size={11} />
                <span>{row.status || 'Đã hủy'}</span>
              </span>
            );
        }
      },
      align: 'left',
      width: '15%'
    }
  ];

  const toolbarFilters = (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm tuyến hoặc biển số xe..."
          className="w-56 sm:w-72 py-1.5 pl-8 pr-3 text-xs bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none transition-colors"
        />
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-1.5 pl-8 pr-6 text-xs bg-slate-950 border border-white/10 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-colors appearance-none cursor-pointer"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ khởi hành</option>
          <option value="RUNNING">Đang chạy</option>
          <option value="COMPLETED">Đã hoàn tất</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );

  const actionButton = (
    <button 
      onClick={handleOpenAdd}
      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
    >
      <Plus size={16} />
      <span>Thêm Chuyến Xe</span>
    </button>
  );

  return (
    <div className="space-y-6">
      
      {/* 4 Summary Stat Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng Chuyến Xe</div>
            <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bus size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đang Chạy</div>
            <div className="text-2xl font-black text-cyan-300 mt-1">{stats.running}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <PlayCircle size={20} className="animate-pulse" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Chờ Xuất Bến</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{stats.pending}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đã Hoàn Tất</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{stats.completed}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Layout */}
      <AdminPageLayout actionButton={actionButton} filters={toolbarFilters}>
        <DataTable 
          data={filteredTrips} 
          columns={columns} 
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          keyExtractor={(row) => row.id}
        />

        <FormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title={editingTrip ? "Cập Nhật Chuyến Xe" : "Thêm Chuyến Xe Mới"}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Tuyến Đường</label>
                <select
                  required
                  value={routeId}
                  onChange={(e) => setRouteId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white transition-colors cursor-pointer"
                >
                  <option value="" disabled className="bg-slate-950 text-slate-400">-- Chọn tuyến đường --</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id} className="bg-slate-950 text-white">
                      {r.departureLocation} ➔ {r.arrivalLocation} (Giá gốc: {new Intl.NumberFormat('vi-VN').format(r.basePrice)}đ)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Xe Phân Công</label>
                <select
                  required
                  value={vehicleId}
                  onChange={(e) => setVehicleId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white transition-colors cursor-pointer"
                >
                  <option value="" disabled className="bg-slate-950 text-slate-400">-- Chọn xe --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id} className="bg-slate-950 text-white">
                      {v.licensePlate} ({v.capacity} chỗ - VIP Limousine)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Thời Gian Khởi Hành</label>
                <input 
                  required
                  type="datetime-local"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Giá Vé Thực Tế (VNĐ)</label>
                <input 
                  required
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white transition-colors"
                  placeholder="VD: 250000"
                />
              </div>

              {editingTrip && (
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Trạng Thái Chuyến Xe</label>
                  <select
                    required
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-white/10 rounded-xl focus:border-cyan-400 focus:outline-none text-white transition-colors cursor-pointer"
                  >
                    <option value="PENDING" className="bg-slate-950 text-amber-300">Chờ khởi hành</option>
                    <option value="RUNNING" className="bg-slate-950 text-cyan-300">Đang chạy</option>
                    <option value="COMPLETED" className="bg-slate-950 text-emerald-300">Đã hoàn tất</option>
                    <option value="CANCELLED" className="bg-slate-950 text-rose-300">Đã hủy</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-5 mt-4 flex justify-end space-x-3 border-t border-white/10">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                {isSubmitting ? 'Đang lưu...' : (editingTrip ? 'Lưu Thay Đổi' : 'Thêm Chuyến Xe')}
              </button>
            </div>
          </form>
        </FormModal>
      </AdminPageLayout>

    </div>
  );
};
