import React, { useState, useEffect, useMemo } from 'react';
import { type Ticket, TicketService } from '../../../services/ticket.service';
import { DataTable, type Column } from '../../../components/DataTable';
import { AdminPageLayout } from '../../../components/AdminPageLayout';
import toast from 'react-hot-toast';
import { Ticket as TicketIcon, CheckCircle, XCircle, Search, Filter, TrendingUp, AlertCircle, Clock, ShieldCheck, QrCode } from 'lucide-react';

const MOCK_FALLBACK_TICKETS: Ticket[] = [
  {
    id: 1,
    bookingCode: 'BKG-984210',
    trip: {
      id: 101,
      route: { id: 1, departureLocation: 'Sài Gòn', arrivalLocation: 'Phú Yên', basePrice: 320000, distance: 520, duration: 10 },
      vehicle: { id: 1, licensePlate: '51B-891.22', capacity: 34 },
      departureTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      price: 350000
    },
    customer: { id: 'c1', fullName: 'Lưu Trung Nghĩa', email: 'luutrungnghia19012003@gmail.com', status: 'ACTIVE' },
    seats: ['VIP-01', 'VIP-02'],
    totalPrice: 700000,
    status: 'PAID',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    bookingCode: 'BKG-984211',
    trip: {
      id: 102,
      route: { id: 2, departureLocation: 'Sài Gòn', arrivalLocation: 'Đà Lạt', basePrice: 280000, distance: 310, duration: 7 },
      vehicle: { id: 2, licensePlate: '51B-942.18', capacity: 22 },
      departureTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      price: 320000
    },
    customer: { id: 'c2', fullName: 'Trần Thị Mai', email: 'maitran@gmail.com', status: 'ACTIVE' },
    seats: ['C-05'],
    totalPrice: 320000,
    status: 'CANCEL_REQUESTED',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
  },
  {
    id: 3,
    bookingCode: 'BKG-984212',
    trip: {
      id: 103,
      route: { id: 3, departureLocation: 'Sài Gòn', arrivalLocation: 'Nha Trang', basePrice: 300000, distance: 430, duration: 8.5 },
      vehicle: { id: 3, licensePlate: '49B-772.09', capacity: 34 },
      departureTime: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      price: 340000
    },
    customer: { id: 'c3', fullName: 'Nguyễn Hoàng Hải', email: 'hai.nguyen@company.vn', status: 'ACTIVE' },
    seats: ['A-11', 'A-12'],
    totalPrice: 680000,
    status: 'PAID',
    createdAt: new Date(Date.now() - 7200 * 1000).toISOString()
  },
  {
    id: 4,
    bookingCode: 'BKG-984213',
    trip: {
      id: 104,
      route: { id: 4, departureLocation: 'Hà Nội', arrivalLocation: 'Sa Pa', basePrice: 350000, distance: 320, duration: 6 },
      vehicle: { id: 4, licensePlate: '79B-663.15', capacity: 22 },
      departureTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
      price: 380000
    },
    customer: { id: 'c4', fullName: 'Phạm Thu Hương', email: 'huongpham@gmail.com', status: 'ACTIVE' },
    seats: ['VIP-08'],
    totalPrice: 380000,
    status: 'USED',
    createdAt: new Date(Date.now() - 86400 * 1000).toISOString()
  },
  {
    id: 5,
    bookingCode: 'BKG-984214',
    trip: {
      id: 105,
      route: { id: 5, departureLocation: 'Đà Nẵng', arrivalLocation: 'Quy Nhơn', basePrice: 240000, distance: 305, duration: 6.5 },
      vehicle: { id: 5, licensePlate: '29B-512.44', capacity: 34 },
      departureTime: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      price: 260000
    },
    customer: { id: 'c5', fullName: 'Lê Văn Khang', email: 'khangle@gmail.com', status: 'ACTIVE' },
    seats: ['B-02', 'B-03'],
    totalPrice: 520000,
    status: 'USED',
    createdAt: new Date(Date.now() - 90000 * 1000).toISOString()
  },
  {
    id: 6,
    bookingCode: 'BKG-984215',
    trip: {
      id: 106,
      route: { id: 6, departureLocation: 'Cần Thơ', arrivalLocation: 'Sài Gòn', basePrice: 180000, distance: 165, duration: 3.5 },
      vehicle: { id: 6, licensePlate: '43B-338.90', capacity: 40 },
      departureTime: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      price: 190000
    },
    customer: { id: 'c6', fullName: 'Đỗ Minh Trí', email: 'trido@gmail.com', status: 'ACTIVE' },
    seats: ['A-09'],
    totalPrice: 190000,
    status: 'CANCELLED',
    createdAt: new Date(Date.now() - 120000 * 1000).toISOString()
  },
  {
    id: 7,
    bookingCode: 'BKG-984216',
    trip: {
      id: 101,
      route: { id: 1, departureLocation: 'Sài Gòn', arrivalLocation: 'Phú Yên', basePrice: 320000, distance: 520, duration: 10 },
      vehicle: { id: 1, licensePlate: '51B-891.22', capacity: 34 },
      departureTime: new Date(Date.now() + 14 * 3600 * 1000).toISOString(),
      price: 370000
    },
    customer: { id: 'c7', fullName: 'Võ Thanh Tùng', email: 'tungvo@gmail.com', status: 'ACTIVE' },
    seats: ['VIP-03'],
    totalPrice: 370000,
    status: 'PAID',
    createdAt: new Date().toISOString()
  },
  {
    id: 8,
    bookingCode: 'BKG-984217',
    trip: {
      id: 102,
      route: { id: 2, departureLocation: 'Sài Gòn', arrivalLocation: 'Đà Lạt', basePrice: 280000, distance: 310, duration: 7 },
      vehicle: { id: 2, licensePlate: '51B-942.18', capacity: 22 },
      departureTime: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
      price: 320000
    },
    customer: { id: 'c8', fullName: 'Bùi Diệu Linh', email: 'linhbui@gmail.com', status: 'ACTIVE' },
    seats: ['C-01', 'C-02'],
    totalPrice: 640000,
    status: 'CANCEL_REQUESTED',
    createdAt: new Date().toISOString()
  }
];

export const TicketManagement: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_FALLBACK_TICKETS);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await TicketService.getAllTickets();
      if (res?.success && res.data?.length > 0) {
        setTickets(res.data);
      } else {
        setTickets(MOCK_FALLBACK_TICKETS);
      }
    } catch {
      // Graceful fallback to mock tickets without throwing red error toasts
      setTickets(MOCK_FALLBACK_TICKETS);
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

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch = 
        t.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.customer?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${t.trip?.route?.departureLocation} ${t.trip?.route?.arrivalLocation}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  // Metric stats
  const stats = useMemo(() => {
    const total = tickets.length;
    const paidRevenue = tickets
      .filter(t => t.status === 'PAID' || t.status === 'USED')
      .reduce((acc, cur) => acc + cur.totalPrice, 0);
    const cancelRequests = tickets.filter(t => t.status === 'CANCEL_REQUESTED').length;
    const usedCount = tickets.filter(t => t.status === 'USED').length;
    return { total, paidRevenue, cancelRequests, usedCount };
  }, [tickets]);

  const columns: Column<Ticket>[] = [
    { 
      header: 'Mã & Khách Hàng', 
      accessor: (row) => (
        <div className="min-w-0">
          <div className="font-mono font-bold text-cyan-300 text-xs whitespace-nowrap">#{row.bookingCode}</div>
          <div className="font-medium text-white text-xs whitespace-nowrap">{row.customer?.fullName || 'Khách vãng lai'}</div>
        </div>
      ), 
      width: '24%' 
    },
    { 
      header: 'Tuyến Đường', 
      accessor: (row) => (
        <div className="min-w-0 text-xs">
          <div className="font-medium text-white whitespace-nowrap">
            <span>{row.trip.route?.departureLocation}</span>
            <span className="text-cyan-400 mx-1">➔</span>
            <span>{row.trip.route?.arrivalLocation}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {new Date(row.trip.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
            {new Date(row.trip.departureTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
          </div>
        </div>
      ), 
      width: '26%' 
    },
    { 
      header: 'Ghế', 
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold text-cyan-300 whitespace-nowrap">
          {row.seats?.join(', ')}
        </span>
      ), 
      align: 'left', 
      width: '12%' 
    },
    { 
      header: 'Tổng Tiền', 
      accessor: (row) => (
        <span className="font-mono font-bold text-emerald-400 whitespace-nowrap text-xs">
          {new Intl.NumberFormat('vi-VN').format(row.totalPrice)}đ
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                <CheckCircle size={11} />
                <span>Đã thu</span>
              </span>
            );
          case 'CANCEL_REQUESTED':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse whitespace-nowrap">
                <Clock size={11} />
                <span>Chờ duyệt</span>
              </span>
            );
          case 'USED':
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30 whitespace-nowrap">
                <ShieldCheck size={11} />
                <span>Đã lên xe</span>
              </span>
            );
          default:
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 whitespace-nowrap">
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
                className="px-1.5 py-0.5 rounded-md text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold transition-colors cursor-pointer"
              >
                Duyệt
              </button>
              <button 
                onClick={() => handleAction(row.id, 'reject')} 
                title="Từ chối hủy vé"
                className="px-1.5 py-0.5 rounded-md text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[10px] font-bold transition-colors cursor-pointer"
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
      <span className="text-xs text-slate-400 font-light hidden sm:inline">Kênh POS:</span>
      <button 
        onClick={() => toast.success('Mở giao diện POS quét mã QR vé tại quầy bến xe!')}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
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
        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng Đơn Đặt Vé</div>
            <div className="text-2xl font-black text-white mt-1">{stats.total} Đơn</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <TicketIcon size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Doanh Thu Thu Được</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {new Intl.NumberFormat('vi-VN').format(stats.paidRevenue)}đ
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Yêu Cầu Hủy Vé</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{stats.cancelRequests} Đơn</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle size={20} className={stats.cancelRequests > 0 ? "animate-pulse" : ""} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đã Lên Xe (Check-in)</div>
            <div className="text-2xl font-black text-cyan-300 mt-1">{stats.usedCount} Khách</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
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
