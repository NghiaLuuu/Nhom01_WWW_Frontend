import { useModal } from '../../../context/ModalContext';
import React, { useState, useEffect, useMemo } from 'react';
import { type Trip, type TripRequest, TripService } from '../api/trip.service';
import { type Route, RouteService } from '../api/route.service';
import { type Vehicle, VehicleService } from '../api/vehicle.service';
import { DataTable, type Column } from '../../../components/DataTable';
import { FormModal } from '../../../components/FormModal';
import { AdminPageLayout } from '../../../components/AdminPageLayout';
import toast from 'react-hot-toast';
import { Plus, Bus, Clock, Search, Filter, CheckCircle2, PlayCircle, XCircle, Users } from 'lucide-react';
import { PassengerManifestModal } from '../components/PassengerManifestModal';

export const TripManagement: React.FC = () => {
  const { confirm } = useModal();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [manifestTrip, setManifestTrip] = useState<Trip | null>(null);

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
      
      setTrips(tripsRes?.success && Array.isArray(tripsRes.data) ? tripsRes.data : []);
      setRoutes(routesRes?.success && Array.isArray(routesRes.data) ? routesRes.data : []);
      setVehicles(vehiclesRes?.success && Array.isArray(vehiclesRes.data) ? vehiclesRes.data : []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu chuyến xe:', error);
      toast.error('Không thể kết nối đến máy chủ lấy dữ liệu chuyến xe.');
      setTrips([]);
      setRoutes([]);
      setVehicles([]);
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
    const isConfirmed = await confirm({
      title: 'Xóa chuyến xe',
      message: `Bạn có chắc chắn muốn xóa chuyến xe ID: ${trip.id}?`,
      confirmText: 'Xóa chuyến',
      cancelText: 'Hủy',
      type: 'danger'
    });
    if (!isConfirmed) return;
    
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
    const q = (searchTerm || '').toLowerCase();
    return trips.filter((t) => {
      const routeStr = t.route ? `${t.route.departureLocation || ''} ${t.route.arrivalLocation || ''}`.toLowerCase() : '';
      const plateStr = t.vehicle ? (t.vehicle.licensePlate || '').toLowerCase() : '';
      const matchSearch = !q || routeStr.includes(q) || plateStr.includes(q);
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
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1 text-slate-200 font-medium">
            <Clock size={12} className="text-cyan-400 shrink-0" />
            <span>{new Date(row.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {new Date(row.departureTime).toLocaleDateString('vi-VN')}
          </div>
        </div>
      ),
      width: '16%' 
    },
    { 
      header: 'Giá Vé', 
      accessor: (row) => (
        <span className="font-mono font-bold text-emerald-400 text-xs">
          {new Intl.NumberFormat('vi-VN').format(row.price)}đ
        </span>
      ), 
      align: 'right',
      width: '12%' 
    },
    { 
      header: 'Trạng Thái', 
      accessor: (row) => {
        switch (row.status) {
          case 'RUNNING':
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <PlayCircle size={11} className="animate-pulse" />
                Đang chạy
              </span>
            );
          case 'COMPLETED':
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={11} />
                Đã hoàn tất
              </span>
            );
          case 'CANCELLED':
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <XCircle size={11} />
                Đã hủy
              </span>
            );
          default:
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Clock size={11} />
                Chờ khởi hành
              </span>
            );
        }
      },
      width: '14%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium">Tổng Chuyến Xe</div>
          <div className="text-2xl font-black text-white mt-1 font-mono">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 backdrop-blur-sm">
          <div className="text-xs text-cyan-300 font-medium">Đang Chạy</div>
          <div className="text-2xl font-black text-cyan-400 mt-1 font-mono">{stats.running}</div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 backdrop-blur-sm">
          <div className="text-xs text-amber-300 font-medium">Chờ Khởi Hành</div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">{stats.pending}</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 backdrop-blur-sm">
          <div className="text-xs text-emerald-300 font-medium">Đã Hoàn Tất</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{stats.completed}</div>
        </div>
      </div>

      <AdminPageLayout
        title="Quản Lý Chuyến Xe"
        description="Điều hành, phân tài, định giá và kiểm soát tiến độ lịch trình xe khách toàn hệ thống"
        action={
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus size={16} />
            <span>Thêm Chuyến Mới</span>
          </button>
        }
      >
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-white/5 bg-slate-900/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tuyến đường, biển số xe..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter size={14} className="text-slate-400 shrink-0 ml-1" />
            <span className="text-xs text-slate-400 mr-1 shrink-0">Lọc:</span>
            {['ALL', 'PENDING', 'RUNNING', 'COMPLETED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Chờ xuất bến' : st === 'RUNNING' ? 'Đang chạy' : st === 'COMPLETED' ? 'Hoàn tất' : 'Đã hủy'}
              </button>
            ))}
          </div>
        </div>

        <DataTable<Trip>
          columns={columns}
          data={filteredTrips}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          actions={(row: Trip) => (
            <button
              onClick={() => setManifestTrip(row)}
              className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
              title="Xem & Xuất Danh Sách Hành Khách (Manifest)"
            >
              <Users size={15} />
            </button>
          )}
        />

        <FormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTrip ? `Chỉnh Sửa Chuyến Xe #${editingTrip.id}` : 'Thêm Chuyến Xe Mới'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Tuyến Đường Vận Hành</label>
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

      <PassengerManifestModal
        isOpen={Boolean(manifestTrip)}
        tripId={manifestTrip?.id || null}
        tripSummary={manifestTrip ? {
          departure: manifestTrip.route?.departureLocation || '',
          arrival: manifestTrip.route?.arrivalLocation || '',
          time: new Date(manifestTrip.departureTime).toLocaleTimeString('vi-VN'),
          licensePlate: manifestTrip.vehicle?.licensePlate || ''
        } : undefined}
        onClose={() => setManifestTrip(null)}
      />
    </div>
  );
};
