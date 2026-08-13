import React, { useState, useEffect } from 'react';
import { Route, RouteRequest, RouteService } from '../api/route.service';
import { DataTable, Column } from '../../../components/DataTable';
import { FormModal } from '../../../components/FormModal';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

export const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  // Form State
  const [departureLocation, setDepartureLocation] = useState('');
  const [arrivalLocation, setArrivalLocation] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const res = await RouteService.getAll();
      if (res.success && res.data) {
        setRoutes(res.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách tuyến đường');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setDepartureLocation('');
    setArrivalLocation('');
    setBasePrice('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (route: Route) => {
    setEditingRoute(route);
    setDepartureLocation(route.departureLocation);
    setArrivalLocation(route.arrivalLocation);
    setBasePrice(route.basePrice.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: RouteRequest = {
        departureLocation,
        arrivalLocation,
        basePrice: Number(basePrice)
      };

      if (editingRoute) {
        await RouteService.update(editingRoute.id, payload);
        toast.success('Cập nhật tuyến đường thành công');
      } else {
        await RouteService.create(payload);
        toast.success('Thêm tuyến đường thành công');
      }
      setIsModalOpen(false);
      fetchRoutes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu tuyến đường');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (route: Route) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tuyến đường ${route.departureLocation} - ${route.arrivalLocation}?`)) {
      return;
    }
    
    try {
      await RouteService.delete(route.id);
      toast.success('Xóa tuyến đường thành công');
      fetchRoutes();
    } catch (error: any) {
      // CRITICAL CONSTRAINT HANDLING
      const errorMsg = error.response?.data?.message;
      if (error.response?.status === 400 || error.response?.status === 409) {
        toast.error(errorMsg || 'Không thể xóa tuyến đường này vì đang có chuyến xe hoạt động hoặc dữ liệu liên kết.');
      } else {
        toast.error('Có lỗi xảy ra khi xóa tuyến đường');
      }
    }
  };

  const columns: Column<Route>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Điểm Đi', accessor: 'departureLocation' },
    { header: 'Điểm Đến', accessor: 'arrivalLocation' },
    { 
      header: 'Giá Cơ Bản (VNĐ)', 
      accessor: (row) => new Intl.NumberFormat('vi-VN').format(row.basePrice)
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản Lý Tuyến Đường</h2>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-md shadow-blue-500/20 font-medium"
        >
          <Plus size={20} />
          <span>Thêm Tuyến Đường</span>
        </button>
      </div>

      <DataTable 
        data={routes} 
        columns={columns} 
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        keyExtractor={(row) => row.id}
      />

      <FormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingRoute ? "Cập Nhật Tuyến Đường" : "Thêm Tuyến Đường Mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Điểm Đi</label>
            <input 
              required
              type="text"
              value={departureLocation}
              onChange={(e) => setDepartureLocation(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="VD: TP. Hồ Chí Minh"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Điểm Đến</label>
            <input 
              required
              type="text"
              value={arrivalLocation}
              onChange={(e) => setArrivalLocation(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="VD: Đà Lạt"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Giá Cơ Bản (VNĐ)</label>
            <input 
              required
              type="number"
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="VD: 250000"
            />
          </div>

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
              {isSubmitting ? 'Đang lưu...' : 'Lưu Tuyến Đường'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
