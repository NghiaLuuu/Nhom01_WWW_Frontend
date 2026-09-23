import React, { useState, useEffect } from 'react';
import { type Vehicle, type VehicleRequest, VehicleService } from '../api/vehicle.service';
import { DataTable, type Column } from '../../../components/DataTable';
import { FormModal } from '../../../components/FormModal';
import { AdminPageLayout } from '../../../components/AdminPageLayout';
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
    { header: 'ID', accessor: 'id', width: '15%' },
    { header: 'Biển Số Xe', accessor: 'licensePlate', width: '50%' },
    { header: 'Số Chỗ Ngồi', accessor: 'capacity', align: 'right', width: '20%' },
  ];

  const actionButton = (
    <button 
      onClick={handleOpenAdd}
      className="flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
    >
      <Plus size={16} />
      <span>Thêm Xe Mới</span>
    </button>
  );

  return (
    <AdminPageLayout actionButton={actionButton}>
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
            <label className="block text-sm font-medium text-gray-700">Biển Số Xe</label>
            <input 
              required
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="VD: 51B-123.45"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Số Chỗ Ngồi</label>
            <input 
              required
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="VD: 45"
            />
          </div>

          <div className="pt-5 mt-2 flex justify-end space-x-2 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-700 border border-transparent rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 transition-colors"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Xe'}
            </button>
          </div>
        </form>
      </FormModal>
    </AdminPageLayout>
  );
};
