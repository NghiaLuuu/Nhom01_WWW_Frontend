import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bus, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Printer, 
  RefreshCw, 
  Phone, 
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { BookingService } from '../../booking/api/booking.service';
import type { PassengerManifestItem } from '../../booking/types/booking.types';
import toast from 'react-hot-toast';

interface PassengerManifestModalProps {
  isOpen: boolean;
  tripId: number | null;
  tripSummary?: {
    departure: string;
    arrival: string;
    time: string;
    licensePlate: string;
  };
  onClose: () => void;
}

export const PassengerManifestModal: React.FC<PassengerManifestModalProps> = ({
  isOpen,
  tripId,
  tripSummary,
  onClose
}) => {
  const [manifest, setManifest] = useState<PassengerManifestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ISSUED' | 'USED' | 'CANCELLED'>('ALL');

  const fetchManifest = async () => {
    if (!tripId) return;
    setIsLoading(true);
    try {
      const res = await BookingService.getPassengerManifest(tripId);
      if (res.success && Array.isArray(res.data)) {
        setManifest(res.data);
      } else {
        setManifest([]);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách hành khách');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && tripId) {
      fetchManifest();
    }
  }, [isOpen, tripId]);

  const handleQuickCheckIn = async (item: PassengerManifestItem) => {
    const toastId = toast.loading(`Đang soát vé cho ghế ${item.seatName}...`);
    try {
      const res = await BookingService.checkInTicket({
        ticketCodeOrQr: item.ticketCode,
        tripId: tripId || undefined
      });
      if (res.success) {
        toast.success(`Đã soát vé thành công: Ghế ${item.seatName} - ${item.customerName}!`, { id: toastId });
        // Update item status locally
        setManifest(prev => prev.map(m => m.ticketId === item.ticketId ? { ...m, status: 'USED', usedAt: new Date().toISOString() } : m));
      } else {
        toast.error(res.message || 'Soát vé không thành công', { id: toastId });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Lỗi khi soát vé';
      toast.error(errMsg, { id: toastId });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const filteredItems = manifest.filter(item => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const totalPassengers = manifest.length;
  const usedCount = manifest.filter(m => m.status === 'USED').length;
  const issuedCount = manifest.filter(m => m.status === 'ISSUED').length;
  const cancelledCount = manifest.filter(m => m.status === 'CANCELLED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold">Danh Sách Hành Khách (Passenger Manifest)</h2>
              <p className="text-xs text-slate-300">
                Chuyến xe #{tripId} {tripSummary ? `• ${tripSummary.departure} → ${tripSummary.arrival} (${tripSummary.licensePlate})` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="In danh sách hành khách"
            >
              <Printer size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Check-in Gate Policy Notice */}
        <div className="bg-blue-50 px-6 py-2.5 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900 shrink-0">
          <div className="flex items-center space-x-2">
            <Clock size={14} className="text-blue-600 shrink-0" />
            <span>
              <strong>Quy định giờ soát vé:</strong> Mở cổng tối thiểu <strong>30 – 60 phút</strong> trước giờ khởi hành • Đóng cổng trước giờ xuất bến từ <strong>5 – 10 phút</strong> để tài xế/phụ xe chốt danh sách hành khách và xếp hành lý.
            </span>
          </div>
          {tripSummary?.time && (
            <span className="font-bold text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
              Giờ xuất bến: {tripSummary.time}
            </span>
          )}
        </div>

        {/* Stats Summary Bar */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-gray-700">Tổng đặt: <span className="text-blue-600">{totalPassengers}</span></span>
            <span className="font-bold text-gray-700">Đã lên xe: <span className="text-emerald-600">{usedCount}</span></span>
            <span className="font-bold text-gray-700">Chờ đón: <span className="text-amber-600">{issuedCount}</span></span>
            {cancelledCount > 0 && (
              <span className="font-bold text-gray-700">Đã hủy: <span className="text-rose-600">{cancelledCount}</span></span>
            )}
          </div>

          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Tất cả ({totalPassengers})
            </button>
            <button
              onClick={() => setFilter('ISSUED')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${filter === 'ISSUED' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Chưa lên xe ({issuedCount})
            </button>
            <button
              onClick={() => setFilter('USED')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${filter === 'USED' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Đã lên xe ({usedCount})
            </button>
          </div>
        </div>

        {/* Manifest Table */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 text-center space-y-2">
              <RefreshCw size={24} className="animate-spin mx-auto text-blue-600" />
              <p className="text-xs text-gray-400">Đang tải danh sách hành khách...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs space-y-1">
              <AlertCircle size={28} className="mx-auto text-gray-300" />
              <p>Chưa có hành khách nào đặt vé cho chuyến xe này.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Ghế</th>
                    <th className="py-3 px-3">Mã Vé</th>
                    <th className="py-3 px-3">Hành Khách</th>
                    <th className="py-3 px-3">Số Điện Thoại</th>
                    <th className="py-3 px-3 text-center">Trạng Thái</th>
                    <th className="py-3 px-3">Thời Điểm Lên Xe</th>
                    <th className="py-3 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredItems.map(item => (
                    <tr key={item.ticketId} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-black text-xs border border-blue-100">
                          {item.seatName}
                        </span>
                        {item.floor && (
                          <span className="ml-1 text-[10px] text-gray-400">T{item.floor}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-800">
                        {item.ticketCode}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900">
                        {item.customerName || 'Khách vãng lai'}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {item.customerPhone ? (
                          <a href={`tel:${item.customerPhone}`} className="hover:text-blue-600 flex items-center space-x-1">
                            <Phone size={12} className="text-gray-400" />
                            <span>{item.customerPhone}</span>
                          </a>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'USED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          item.status === 'ISSUED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          item.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {item.status === 'USED' ? 'Đã lên xe' :
                           item.status === 'ISSUED' ? 'Chưa lên xe' :
                           item.status === 'CANCELLED' ? 'Đã hủy' : item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">
                        {item.usedAt ? new Date(item.usedAt).toLocaleTimeString('vi-VN') : '-'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {item.status === 'ISSUED' ? (
                          <button
                            onClick={() => handleQuickCheckIn(item)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors shadow-xs flex items-center space-x-1 ml-auto"
                          >
                            <FileCheck2 size={13} />
                            <span>Soát Vé</span>
                          </button>
                        ) : item.status === 'USED' ? (
                          <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center space-x-1">
                            <CheckCircle2 size={14} />
                            <span>Hoàn tất</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
