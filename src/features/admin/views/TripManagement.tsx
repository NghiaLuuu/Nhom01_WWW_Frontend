import React, { useState, useEffect } from 'react';
import { Trip, TripRequest, TripService } from '../api/trip.service';
import { Route, RouteService } from '../api/route.service';
import { Vehicle, VehicleService } from '../api/vehicle.service';
import { DataTable, Column } from '../../../components/DataTable';
import { FormModal } from '../../../components/FormModal';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

export const TripManagement: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

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
        // Assuming search with empty params returns all trips for now
        api.get('/trips/search?departureLocation=&arrivalLocation=&date=').then(res => res.data),
        RouteService.getAll(),
        VehicleService.getAll()
      ]);
      
      if (tripsRes.success) setTrips(tripsRes.data);
      if (routesRes.success) setRoutes(routesRes.data);
      if (vehiclesRes.success) setVehicles(vehiclesRes.data);
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu chuyến xe');
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
    // Format LocalDateTime for input type="datetime-local" (YYYY-MM-DDTHH:mm)
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
        toast.success('Thêm chuyến xe thành công');
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
      // CRITICAL CONSTRAINT HANDLING
      const errorMsg = error.response?.data?.message;
      if (error.response?.status === 400 || error.response?.status === 409) {
        toast.error(errorMsg || 'Không thể xóa chuyến xe này vì đã có khách hàng đặt vé.');
      } else {
        toast.error('Có lỗi xảy ra khi xóa chuyến xe');
      }
    }
  };

  const columns: Column<Trip>[] = [
    { header: 'ID', accessor: 'id' },
    { 
      header: 'Tuyến Đường', 
      accessor: (row) => row.route ? `${row.route.departureLocation} - ${row.route.arrivalLocation}` : 'N/A'
    },
    { 
      header: 'Xe', 
      accessor: (row) => row.vehicle ? row.vehicle.licensePlate : 'N/A'
    },
    { 
      header: 'Thời Gian Khởi Hành', 
      accessor: (row) => new Date(row.departureTime).toLocaleString('vi-VN')
    },
    { 
      header: 'Giá (VNĐ)', 
      accessor: (row) => new Intl.NumberFormat('vi-VN').format(row.price)
    },
    { 
      header: 'Trạng Thái', 
      accessor: (row) => (
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
          row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          row.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
          row.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.status || 'N/A'}
        </span>
      )
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản Lý Chuyến Xe</h2>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-md shadow-blue-500/20 font-medium"
        >
          <Plus size={20} />
          <span>Thêm Chuyến Xe</span>
        </button>
      </div>

      <DataTable 
        data={trips} 
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
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Tuyến Đường</label>
            <select
              required
              value={routeId}
              onChange={(e) => setRouteId(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="" disabled>-- Chọn tuyến đường --</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.departureLocation} - {r.arrivalLocation} (Giá gốc: {r.basePrice})</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Xe Phân Công</label>
            <select
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="" disabled>-- Chọn xe --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.licensePlate} ({v.capacity} chỗ)</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Thời Gian Khởi Hành</label>
            <input 
              required
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Giá Vé Thực Tế (VNĐ)</label>
            <input 
              required
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="VD: 250000"
            />
          </div>

          {editingTrip && (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Trạng Thái</label>
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="PENDING">Chờ khởi hành</option>
                <option value="RUNNING">Đang chạy</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 shadow-md shadow-blue-500/20"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Chuyến Xe'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
