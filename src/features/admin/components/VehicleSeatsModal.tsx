import { useModal } from '../../../context/ModalContext';
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Car, 
  Grid, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { VehicleService, type Vehicle } from '../api/vehicle.service';
import type { SeatItem } from '../../booking/types/booking.types';
import toast from 'react-hot-toast';

interface VehicleSeatsModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
}

export const VehicleSeatsModal: React.FC<VehicleSeatsModalProps> = ({
  isOpen,
  vehicle,
  onClose
}) => {
  const { confirm } = useModal();
  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [seatCountInput, setSeatCountInput] = useState<number>(34);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchSeats = async () => {
    if (!vehicle?.id) return;
    setIsLoading(true);
    try {
      const res = await VehicleService.getSeats(vehicle.id);
      if (res.success && Array.isArray(res.data)) {
        setSeats(res.data);
      } else {
        setSeats([]);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách ghế của xe');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && vehicle) {
      setSeatCountInput(vehicle.capacity || 34);
      fetchSeats();
    }
  }, [isOpen, vehicle]);

  const handleGenerateSeats = async () => {
    if (!vehicle?.id) return;
    if (seatCountInput <= 0 || seatCountInput > 100) {
      toast.error('Số lượng ghế phải từ 1 đến 100');
      return;
    }

    if (seats.length > 0) {
      const ok = await confirm({
        title: "Tạo lại sơ đồ ghế",
        message: `Xe này hiện đã có ${seats.length} ghế. Bạn có chắc muốn tạo lại danh sách với ${seatCountInput} ghế mới không? Tất cả ghế cũ sẽ được thay thế.`,
        type: "warning",
        confirmText: "Tạo lại danh sách",
        cancelText: "Hủy"
      });
      if (!ok) return;
    }

    setIsGenerating(true);
    const toastId = toast.loading('Đang khởi tạo sơ đồ ghế...');
    try {
      const res = await VehicleService.createSeats(vehicle.id, seatCountInput);
      if (res.success) {
        toast.success(`Đã khởi tạo thành công ${seatCountInput} ghế!`, { id: toastId });
        fetchSeats();
      } else {
        toast.error(res.message || 'Khởi tạo ghế thất bại', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo ghế', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-gray-100 overflow-hidden my-4 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Grid size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">Sơ Đồ Ghế - Xe {vehicle.licensePlate}</h2>
              <p className="text-xs text-slate-300">
                Sức chứa đăng ký: {vehicle.capacity} chỗ • Hiện có: {seats.length} ghế trong hệ thống
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bulk Generate Controls */}
        <div className="p-4 bg-blue-50/60 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center space-x-2">
            <label className="font-bold text-gray-700">Khởi tạo số ghế:</label>
            <input
              type="number"
              min={1}
              max={100}
              value={seatCountInput}
              onChange={e => setSeatCountInput(Number(e.target.value))}
              className="w-20 px-3 py-1.5 rounded-xl border border-gray-300 font-bold text-center bg-white"
            />
            <button
              onClick={handleGenerateSeats}
              disabled={isGenerating}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-xs flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Khởi Tạo Tự Động</span>
            </button>
          </div>

          <button
            onClick={fetchSeats}
            className="p-2 rounded-xl border border-gray-200 hover:bg-white text-gray-600 text-xs font-bold flex items-center space-x-1"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Tải lại</span>
          </button>
        </div>

        {/* Seat Layout View */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 text-center space-y-2">
              <RefreshCw size={24} className="animate-spin mx-auto text-blue-600" />
              <p className="text-xs text-gray-400">Đang tải sơ đồ ghế...</p>
            </div>
          ) : seats.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs space-y-2">
              <AlertCircle size={32} className="mx-auto text-amber-500" />
              <p className="font-bold text-gray-700">Xe này chưa có danh sách ghế!</p>
              <p className="max-w-xs mx-auto text-gray-500">
                Hãy nhấn nút "Khởi Tạo Tự Động" ở trên để sinh tự động danh sách các ghế (A01, A02, B01, B02...) cho xe này.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-bold">Danh sách {seats.length} vị trí ghế:</span>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Đã cấu hình hợp lệ
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 p-3 bg-gray-50 rounded-2xl border border-gray-200">
                {seats.map(seat => (
                  <div
                    key={seat.id}
                    className="p-2 rounded-xl bg-white border border-gray-200 text-center shadow-2xs"
                  >
                    <span className="text-[10px] text-gray-400 block">
                      {seat.floor ? `Tầng ${seat.floor}` : 'Chỗ'}
                    </span>
                    <span className="text-xs font-black text-gray-900 block">
                      {seat.seatName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
