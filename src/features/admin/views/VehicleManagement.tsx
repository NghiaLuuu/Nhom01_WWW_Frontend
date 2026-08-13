import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleRequest, VehicleService } from '../api/vehicle.service';
import { DataTable, Column } from '../../../components/DataTable';
import { FormModal } from '../../../components/FormModal';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

export const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form State
  const [licensePlate, setLicensePlate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await VehicleService.getAll();
      if (res.success && res.data) {
        setVehicles(res.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách xe');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setLicensePlate('');
    setCapacity('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setLicensePlate(vehicle.licensePlate);
    setCapacity(vehicle.capacity.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: VehicleRequest = {
        licensePlate,
        capacity: Number(capacity)
      };

      if (editingVehicle) {
        await VehicleService.update(editingVehicle.id, payload);
        toast.success('Cập nhật xe thành công');
      } else {
        await VehicleService.create(payload);
        toast.success('Thêm xe thành công');
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu xe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa xe biển số ${vehicle.licensePlate}?`)) {
      return;
    }
    
    try {
      await VehicleService.delete(vehicle.id);
      toast.success('Xóa xe thành công');
      fetchVehicles();
    } catch (error: any) {
      // CRITICAL CONSTRAINT HANDLING
      const errorMsg = error.response?.data?.message;
      if (error.response?.status === 400 || error.response?.status === 409) {
        toast.error(errorMsg || 'Không thể xóa xe này vì đang được phân công cho chuyến xe hoạt động.');
      } else {
        toast.error('Có lỗi xảy ra khi xóa xe');
      }
    }
  };

  const columns: Column<Vehicle>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Biển Số Xe', accessor: 'licensePlate' },
    { header: 'Số Chỗ Ngồi', accessor: 'capacity' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản Lý Xe & Tài Xế</h2>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-md shadow-blue-500/20 font-medium"
        >
          <Plus size={20} />
          <span>Thêm Xe Mới</span>
        </button>
      </div>

      <DataTable 
        data={vehicles} 
        columns={columns} 
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        keyExtractor={(row) => row.id}
      />

      <FormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? "Cập Nhật Thông Tin Xe" : "Thêm Xe Mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Biển Số Xe</label>
            <input 
              required
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="VD: 51B-123.45"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Số Chỗ Ngồi</label>
            <input 
              required
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="VD: 45"
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
              {isSubmitting ? 'Đang lưu...' : 'Lưu Xe'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};
