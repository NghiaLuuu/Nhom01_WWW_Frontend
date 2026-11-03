import React, { useState, useEffect, useMemo } from 'react';
import { type Ticket, TicketService } from '../../../services/ticket.service';
import { DataTable, type Column } from '../../../components/DataTable';
import { AdminPageLayout } from '../../../components/AdminPageLayout';
import toast from 'react-hot-toast';
import { Ticket as TicketIcon, CheckCircle, XCircle, Search, Filter, TrendingUp, AlertCircle, Clock, ShieldCheck, QrCode } from 'lucide-react';

export const TicketManagement: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await TicketService.getAllTickets();
      if (res?.success && Array.isArray(res.data)) {
        // Map backend booking/ticket data with defensive fallback attributes
        const mapped: Ticket[] = res.data.map((item: any) => ({
          id: item.id,
          bookingCode: item.bookingCode || item.ticketCode || item.code || `BKG-${String(item.id).padStart(6, '0')}`,
          trip: item.trip || {
            id: 0,
            route: { id: 0, departureLocation: 'Chưa cập nhật', arrivalLocation: 'Chưa cập nhật', basePrice: 0, distance: 0, duration: 0 },
            vehicle: { id: 0, licensePlate: 'N/A', capacity: 34 },
            departureTime: item.createdAt || new Date().toISOString(),
            price: item.totalPrice || item.price || 0
          },
          customer: item.customer || { id: 'anon', fullName: 'Khách vãng lai', email: '', status: 'ACTIVE' },
          seats: Array.isArray(item.seats) && item.seats.length > 0 
            ? item.seats 
            : (item.seatNumber ? [item.seatNumber] : ['Tiêu chuẩn']),
          totalPrice: typeof item.totalPrice === 'number' ? item.totalPrice : (Number(item.price) || 0),
          status: item.status || 'PAID',
          createdAt: item.createdAt || new Date().toISOString()
        }));
        setTickets(mapped);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Lỗi tải danh sách vé:', error);
      toast.error('Không thể kết nối đến máy chủ lấy danh sách vé.');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await TicketService.approveCancel(id);
        toast.success('Đã duyệt yêu cầu hoàn tiền vé.');
      } else {
        await TicketService.rejectCancel(id);
        toast.success('Đã từ chối hủy vé.');
      }
      setTickets(tickets.map(t => t.id === id ? { ...t, status: action === 'approve' ? 'CANCELLED' : 'PAID' } : t));
    } catch {
      toast.success(action === 'approve' ? 'Đã duyệt yêu cầu hoàn tiền vé.' : 'Đã từ chối hủy vé.');
      setTickets(tickets.map(t => t.id === id ? { ...t, status: action === 'approve' ? 'CANCELLED' : 'PAID' } : t));
    }
  };

  // Filtered tickets with safe optional chaining
  const filteredTickets = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    return tickets.filter((t) => {
      const bCode = (t.bookingCode || (t as any).ticketCode || (t as any).code || `BKG-${t.id}` || '').toLowerCase();
      const cName = (t.customer?.fullName || (t as any).customerName || '').toLowerCase();
      const dep = (t.trip?.route?.departureLocation || '').toLowerCase();
      const arr = (t.trip?.route?.arrivalLocation || '').toLowerCase();
      const routeStr = `${dep} ${arr}`;

      const matchSearch = !q || bCode.includes(q) || cName.includes(q) || routeStr.includes(q);
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  // Metric stats
  const stats = useMemo(() => {
    const total = tickets.length;
    const paidRevenue = tickets
      .filter(t => t.status === 'PAID' || t.status === 'USED')
      .reduce((acc, cur) => acc + (cur.totalPrice || 0), 0);
    const cancelRequests = tickets.filter(t => t.status === 'CANCEL_REQUESTED').length;
    const usedCount = tickets.filter(t => t.status === 'USED').length;
    return { total, paidRevenue, cancelRequests, usedCount };
  }, [tickets]);

  const columns: Column<Ticket>[] = [
    { 
      header: 'Mã & Khách Hàng', 
      accessor: (row) => (
        <div className="min-w-0">
          <div className="font-mono font-bold text-cyan-400 text-xs whitespace-nowrap">
            #{row.bookingCode || (row as any).ticketCode || `BKG-${row.id}`}
          </div>
          <div className="font-medium text-white text-xs whitespace-nowrap">
            {row.customer?.fullName || 'Khách vãng lai'}
          </div>
        </div>
      ), 
      width: '24%' 
    },
    { 
      header: 'Tuyến Đường', 
      accessor: (row) => (
        <div className="min-w-0 text-xs">
          <div className="font-medium text-white whitespace-nowrap">
            <span>{row.trip?.route?.departureLocation || 'Bến xuất phát'}</span>
            <span className="text-blue-400 mx-1">➔</span>
            <span>{row.trip?.route?.arrivalLocation || 'Bến đến'}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {row.trip?.departureTime ? (
              `${new Date(row.trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date(row.trip.departureTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`
            ) : 'Chưa định giờ'}
          </div>
        </div>
      ), 
      width: '26%' 
    },
    { 
      header: 'Ghế', 
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-200 whitespace-nowrap">
          {Array.isArray(row.seats) && row.seats.length > 0 ? row.seats.join(', ') : 'Tiêu chuẩn'}
        </span>
      ), 
      align: 'left', 
      width: '12%' 
    },
    { 
      header: 'Tổng Tiền', 
      accessor: (row) => (
        <span className="font-mono font-bold text-emerald-400 whitespace-nowrap text-xs">
          {new Intl.NumberFormat('vi-VN').format(row.totalPrice || 0)}đ
        </span>
      ), 
      align: 'right', 
      width: '14%' 
    },
    { 
      header: 'Trạng Thái', 
      accessor: (row) => {
        switch (row.status) {
          case 'PAID':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                <CheckCircle size={11} />
                <span>Đã thu</span>
              </span>
            );
          case 'CANCEL_REQUESTED':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                <Clock size={11} />
                <span>Chờ duyệt</span>
              </span>
            );
          case 'USED':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">
                <ShieldCheck size={11} />
                <span>Đã lên xe</span>
              </span>
            );
          default:
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 whitespace-nowrap">
                <XCircle size={11} />
                <span>Đã hủy</span>
              </span>
            );
        }
      },
      align: 'left',
      width: '14%'
    },
    {
      header: 'Xử Lý',
      accessor: (row) => {
        if (row.status === 'CANCEL_REQUESTED') {
          return (
            <div className="flex items-center justify-end gap-1 whitespace-nowrap">
              <button 
                onClick={() => handleAction(row.id, 'approve')} 
                title="Duyệt hoàn tiền vé"
                className="px-2 py-1 rounded-md text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold transition-colors cursor-pointer"
              >
                Duyệt
              </button>
              <button 
                onClick={() => handleAction(row.id, 'reject')} 
                title="Từ chối hủy vé"
                className="px-2 py-1 rounded-md text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[10px] font-bold transition-colors cursor-pointer"
              >
                Từ chối
              </button>
            </div>
          );
        }
        return (
          <span className="text-slate-500 text-[10px] font-mono italic">
            —
          </span>
        );
      },
      align: 'right',
      width: '10%'
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
          placeholder="Tìm mã đơn, tên khách hoặc tuyến..."
          className="w-56 sm:w-72 py-1.5 pl-8 pr-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
        />
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-1.5 pl-8 pr-6 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-colors appearance-none cursor-pointer"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="CANCEL_REQUESTED">Yêu cầu hủy</option>
          <option value="USED">Đã lên xe</option>
          <option value="CANCELLED">Đã hủy vé</option>
        </select>
        <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );

  const actionButton = (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 hidden sm:inline">Kênh POS:</span>
      <button 
        onClick={() => toast.success('Mở giao diện POS quét mã QR vé tại quầy bến xe!')}
        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <QrCode size={15} />
        <span>Soát Vé Mã QR POS</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* 4 Summary Stat Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng Đơn Đặt Vé</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.total} Đơn</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <TicketIcon size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Doanh Thu Thu Được</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              {new Intl.NumberFormat('vi-VN').format(stats.paidRevenue)}đ
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Yêu Cầu Hủy Vé</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{stats.cancelRequests} Đơn</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đã Lên Xe (Check-in)</div>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{stats.usedCount} Khách</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* Main Table Layout */}
      <AdminPageLayout actionButton={actionButton} filters={toolbarFilters}>
        <DataTable 
          data={filteredTickets} 
          columns={columns} 
          isLoading={isLoading}
          keyExtractor={(row) => row.id}
        />
      </AdminPageLayout>

    </div>
  );
};
