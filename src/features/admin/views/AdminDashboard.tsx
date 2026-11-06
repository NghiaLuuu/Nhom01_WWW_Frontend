import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Ticket, 
  Users, 
  MapPin, 
  Car, 
  Radio, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  RotateCw, 
  ArrowUpRight, 
  Cpu, 
  Database, 
  Zap, 
  Eye,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackingService, type LiveVisitorsSummaryResponse } from '../../../services/tracking.service';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [liveVisitors, setLiveVisitors] = useState<LiveVisitorsSummaryResponse | null>(null);
  const [loadingLive, setLoadingLive] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('vi-VN'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('vi-VN'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLive = async () => {
    try {
      const res = await trackingService.getLiveVisitors(5);
      setLiveVisitors(res);
    } catch {
      // Fallback silent fail
    } finally {
      setLoadingLive(false);
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSyncVectors = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const toastId = toast.loading('Đang đồng bộ tuyến đường & chuyến xe vào PostgreSQL pgvector...');
    try {
      const res = await api.post('/chatbot/ingest');
      const data = res.data?.data;
      if (data && data.documentsWritten > 0) {
        toast.success(`Đã nạp thêm ${data.documentsWritten} vector vào PostgreSQL pgvector!`, { id: toastId });
      } else {
        toast.success('Dữ liệu AI RAG đã ở trạng thái mới nhất!', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi đồng bộ vector vào pgvector', { id: toastId });
    } finally {
      setIsSyncing(false);
    }
  };

  // Quick Action Hub Cards
  const quickActions = [
    {
      title: 'Quản Lý Chuyến Xe',
      desc: 'Lên lịch trình, gán xe & điều phối tài xế',
      icon: Bus,
      path: '/admin/trips',
      iconColor: 'text-blue-400',
      badge: '24 chuyến hôm nay'
    },
    {
      title: 'Đơn Đặt Vé & POS',
      desc: 'Tra cứu booking, xác nhận và duyệt hoàn tiền',
      icon: Ticket,
      path: '/admin/tickets',
      iconColor: 'text-indigo-400',
      badge: '148 vé đã xuất'
    },
    {
      title: 'Khách Đang Online',
      desc: 'Giám sát phiên truy cập trực tiếp & vị trí GPS',
      icon: Radio,
      path: '/admin/tracking?tab=live',
      iconColor: 'text-emerald-400',
      badge: `${liveVisitors?.totalOnline ?? 1} khách trực tuyến`
    },
    {
      title: 'Hành Vi & AI Persona',
      desc: 'Hành trình Commuter Habit, VIP Limousine, Sinh viên',
      icon: Activity,
      path: '/admin/tracking?tab=overview',
      iconColor: 'text-purple-400',
      badge: 'Gợi ý hành vi'
    },
    {
      title: 'Tuyến Đường Vận Hành',
      desc: 'Điểm khởi hành, bến trả khách & khoảng cách km',
      icon: MapPin,
      path: '/admin/routes',
      iconColor: 'text-amber-400',
      badge: '12 tuyến chính'
    },
    {
      title: 'Đội Xe & Tài Xế',
      desc: 'Đăng kiểm, kiểm định an toàn & trạng thái phương tiện',
      icon: Car,
      path: '/admin/vehicles-drivers',
      iconColor: 'text-sky-400',
      badge: '18 xe Limousine VIP'
    }
  ];

  // System Operation Audit Events
  const recentOperations = [
    {
      time: '10:28:14',
      type: 'AI_INGEST',
      title: 'Đồng bộ AI pgvector hoàn tất',
      desc: 'Đã lập chỉ mục 45 chuyến xe và tuyến Sài Gòn - Phú Yên vào bảng pgvector.',
      status: 'SUCCESS'
    },
    {
      time: '10:22:05',
      type: 'BOOKING',
      title: 'Khách đặt vé thành công (VX-98241)',
      desc: 'Tuyến Sài Gòn - Nha Trang (2 vé Giường nằm VIP, 680.000đ - VietQR 24/7).',
      status: 'SUCCESS'
    },
    {
      time: '10:15:30',
      type: 'TRACKING',
      title: 'Ghi nhận phân loại AI Persona',
      desc: 'Session #89e4 phân loại Commuter Habit (TP.HCM ⇌ Phú Yên) với tần suất cao.',
      status: 'INFO'
    },
    {
      time: '09:50:11',
      type: 'DISPATCH',
      title: 'Xuất bến đúng giờ chuyến VEX-0800',
      desc: 'Bến xe Miền Đông Mới đi Quy Nhơn (Biển số 51B-891.22, Tài xế Lê Hoàng Hải).',
      status: 'SUCCESS'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Master Control Banner */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Hệ Thống Trực Tuyến 24/7
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                <Sparkles size={12} className="text-blue-400" />
                Spring AI & pgvector Live
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock size={12} />
                <span>{currentTime}</span>
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              Trung Tâm Chỉ Huy Quản Trị Hệ Thống VEXE
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl font-normal">
              Giám sát vận hành thời gian thực, điều phối chuyến xe, phân tích hành vi khách hàng và kiểm soát dữ liệu vector pgvector.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleSyncVectors}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCw size={14} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ AI Vector (pgvector)'}</span>
            </button>

            <Link
              to="/admin/tracking?tab=live"
              className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 hover:text-white font-medium text-xs flex items-center gap-2 transition-colors"
            >
              <Eye size={14} className="text-emerald-400" />
              <span>Xem khách trực tuyến</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1: Revenue & Bookings */}
        <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doanh Thu Hôm Nay</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">42.580.000đ</div>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <span>↑ 18.4%</span>
              <span className="text-slate-400 font-normal">so với hôm qua</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
            <span>148 vé đã xuất</span>
            <span className="text-cyan-400 font-mono">Lấp đầy 88.4%</span>
          </div>
        </div>

        {/* Card 2: Operating Trips */}
        <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chuyến Xe Vận Hành</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
              <Bus size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">24 Chuyến</div>
            <div className="text-xs text-cyan-400 font-medium flex items-center gap-1 mt-1">
              <span>● 18 chuyến đang chạy</span>
              <span className="text-slate-400 font-normal">• 6 sắp xuất</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
            <span>Đúng giờ: 99.8%</span>
            <span className="text-slate-300 font-mono">18 Xe Limousine</span>
          </div>
        </div>

        {/* Card 3: Realtime Live Visitors */}
        <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Khách Đang Trực Tuyến</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Radio size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight flex items-center gap-2">
              <span>{loadingLive ? '...' : (liveVisitors?.totalOnline ?? 1)}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                Live (5m)
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium flex items-center gap-2 mt-1">
              <span>Thành viên: {liveVisitors?.registeredOnline ?? 0}</span>
              <span>• Vãng lai: {liveVisitors?.guestOnline ?? 1}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
            <span>Tracking tự động</span>
            <Link to="/admin/tracking?tab=live" className="text-blue-400 hover:underline flex items-center gap-0.5">
              <span>Chi tiết</span>
              <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>

        {/* Card 4: AI Vector Engine Status */}
        <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Động Cơ AI pgvector</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
              <Cpu size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-300 tracking-tight flex items-center gap-1.5">
              <span>Sẵn Sàng</span>
              <CheckCircle2 size={18} className="text-emerald-400 inline" />
            </div>
            <div className="text-xs text-slate-300 font-medium flex items-center gap-1 mt-1">
              <span>HNSW Index Cosine</span>
              <span className="text-slate-400 font-normal">• RAG Chatbot</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
            <span>Độ trễ: ~180ms</span>
            <span className="text-slate-300 font-mono">pgvector v0.8.0</span>
          </div>
        </div>

      </div>

      {/* Quick Navigation Hub */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="text-blue-400" size={18} />
            <span>Lối Tắt Điều Hành & Phân Hệ Chức Năng</span>
          </h2>
          <span className="text-xs text-slate-400">Truy cập nhanh các phân hệ nghiệp vụ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.path}
                className="p-5 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm flex flex-col justify-start space-y-3 group"
              >
                <div className="flex items-start justify-between min-h-[44px]">
                  <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center ${action.iconColor}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700">
                    {action.badge}
                  </span>
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors flex items-center justify-between">
                    <span>{action.title}</span>
                    <ArrowUpRight size={15} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {action.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Lower Section: Realtime Operations Stream & AI System Health */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* Left Column: Recent System Activity Stream */}
        <div className="flex-1 min-w-0 w-full p-6 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nhật Ký Tác Vụ Gần Nhất</h3>
                <p className="text-xs text-slate-400">Luồng sự kiện AI, đặt vé, dispatch chuyến và tracking khách</p>
              </div>
            </div>
            <Link to="/admin/audit-logs" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <span>Xem toàn bộ log</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentOperations.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-start gap-3.5"
              >
                <div className="text-xs font-mono text-cyan-400 bg-slate-800 border border-slate-700 px-2 py-1 rounded shrink-0 mt-0.5">
                  {item.time}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                      Thành công
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Engine & Security Health */}
        <div className="w-full xl:w-[360px] shrink-0 p-6 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-700 pb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Trạng Thái Sức Khỏe AI</h3>
              <p className="text-xs text-slate-400">Spring AI, Vector & Tracking</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">PostgreSQL pgvector</div>
                <div className="text-[11px] text-slate-400">Vector HNSW Index Cosine</div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Sẵn sàng
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Spring AI Chatbot RAG</div>
                <div className="text-[11px] text-slate-400">Context Window 4.096 token</div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Ổn định
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Haversine Geolocation</div>
                <div className="text-[11px] text-slate-400">Định vị GPS & ưu tiên tuyến gần</div>
              </div>
              <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                Chính xác
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Heartbeat & Dwell Monitor</div>
                <div className="text-[11px] text-slate-400">Dwell time (Active vs Idle)</div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Hoạt động
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 leading-relaxed">
            <strong className="text-blue-400 font-semibold">Khuyến nghị:</strong> Lưu lượng tuyến Sài Gòn ⇌ Phú Yên và Nha Trang có xu hướng tăng cao vào chiều tối thứ Sáu. Đề xuất chuẩn bị xe dự phòng.
          </div>
        </div>

      </div>

    </div>
  );
};
