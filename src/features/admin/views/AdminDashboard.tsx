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
      color: 'from-cyan-500/20 to-blue-600/20',
      border: 'hover:border-cyan-500/50',
      iconColor: 'text-cyan-400',
      badge: '24 chuyến hôm nay'
    },
    {
      title: 'Đơn Đặt Vé & POS',
      desc: 'Tra cứu booking, xác nhận và duyệt hoàn tiền',
      icon: Ticket,
      path: '/admin/tickets',
      color: 'from-blue-500/20 to-indigo-600/20',
      border: 'hover:border-blue-500/50',
      iconColor: 'text-blue-400',
      badge: '148 vé đã xuất'
    },
    {
      title: 'Khách Đang Online',
      desc: 'Giám sát phiên truy cập trực tiếp & vị trí GPS',
      icon: Radio,
      path: '/admin/live-visitors',
      color: 'from-emerald-500/20 to-teal-600/20',
      border: 'hover:border-emerald-500/50',
      iconColor: 'text-emerald-400',
      badge: `${liveVisitors?.totalOnline ?? 1} khách đang online`
    },
    {
      title: 'Hành Vi & AI Persona',
      desc: 'Hành trình Commuter Habit, VIP Limousine, Sinh viên',
      icon: Activity,
      path: '/admin/behavior-analytics',
      color: 'from-purple-500/20 to-pink-600/20',
      border: 'hover:border-purple-500/50',
      iconColor: 'text-purple-400',
      badge: 'Hệ thống gợi ý AI'
    },
    {
      title: 'Tuyến Đường Vận Hành',
      desc: 'Điểm khởi hành, bến trả khách & khoảng cách km',
      icon: MapPin,
      path: '/admin/routes',
      color: 'from-amber-500/20 to-orange-600/20',
      border: 'hover:border-amber-500/50',
      iconColor: 'text-amber-400',
      badge: '12 tuyến chính'
    },
    {
      title: 'Đội Xe & Tài Xế',
      desc: 'Đăng kiểm, kiểm định an toàn & trạng thái phương tiện',
      icon: Car,
      path: '/admin/vehicles-drivers',
      color: 'from-rose-500/20 to-red-600/20',
      border: 'hover:border-rose-500/50',
      iconColor: 'text-rose-400',
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
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Hệ Thống Trực Tuyến 24/7
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Sparkles size={12} className="text-cyan-400" />
                Spring AI & pgvector HNSW Live
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock size={12} />
                <span>{currentTime}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Trung Tâm Chỉ Huy Quản Trị Hệ Thống VEXE
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl font-light">
              Giám sát vận hành thời gian thực, điều phối chuyến xe, phân tích hành vi khách hàng bằng AI và kiểm soát dòng dữ liệu vector pgvector.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleSyncVectors}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-950/50 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RotateCw size={14} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ AI Vector (pgvector)'}</span>
            </button>

            <Link
              to="/admin/live-visitors"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white font-medium text-xs flex items-center gap-2 transition-colors"
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
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 transition-all shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doanh Thu Hôm Nay</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">42.580.000đ</div>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <span>↑ 18.4%</span>
              <span className="text-slate-400 font-light">so với hôm qua</span>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>148 vé đã xuất</span>
            <span className="text-cyan-300 font-mono">Lấp đầy 88.4%</span>
          </div>
        </div>

        {/* Card 2: Operating Trips */}
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-blue-500/40 transition-all shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chuyến Xe Vận Hành</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Bus size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white tracking-tight">24 Chuyến</div>
            <div className="text-xs text-cyan-400 font-medium flex items-center gap-1 mt-1">
              <span>● 18 chuyến đang chạy</span>
              <span className="text-slate-400 font-light">• 6 sắp xuất</span>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Đúng giờ: 99.8%</span>
            <span className="text-blue-300 font-mono">18 Xe Limousine</span>
          </div>
        </div>

        {/* Card 3: Realtime Live Visitors */}
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 transition-all shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Khách Đang Trực Tuyến</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio size={16} className="animate-pulse" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-300 tracking-tight flex items-center gap-2">
              <span>{loadingLive ? '...' : (liveVisitors?.totalOnline ?? 1)}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                Live (5m)
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium flex items-center gap-2 mt-1">
              <span>Thành viên: {liveVisitors?.registeredOnline ?? 0}</span>
              <span>• Khách vãng lai: {liveVisitors?.guestOnline ?? 1}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Tracking tự động</span>
            <Link to="/admin/live-visitors" className="text-emerald-400 hover:underline flex items-center gap-0.5">
              <span>Chi tiết</span>
              <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>

        {/* Card 4: AI Vector Engine Status */}
        <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-purple-500/40 transition-all shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Động Cơ AI pgvector</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Cpu size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-300 tracking-tight flex items-center gap-1.5">
              <span>Sẵn Sàng</span>
              <CheckCircle2 size={18} className="text-emerald-400 inline" />
            </div>
            <div className="text-xs text-slate-300 font-medium flex items-center gap-1 mt-1">
              <span>HNSW Index Cosine</span>
              <span className="text-slate-400 font-light">• RAG Chatbot</span>
            </div>
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Độ trễ gợi ý: ~180ms</span>
            <span className="text-purple-300 font-mono">pgvector v0.8.0</span>
          </div>
        </div>

      </div>

      {/* Quick Navigation Hub (6 Operations) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="text-cyan-400" size={18} />
            <span>Lối Tắt Điều Hành & Phân Hệ Chức Năng</span>
          </h2>
          <span className="text-xs text-slate-400 font-light">Truy cập tức thì các phân hệ cốt lõi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.path}
                className={`p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 ${action.border} transition-all duration-300 group hover:scale-[1.01] shadow-xl flex flex-col justify-start space-y-4`}
              >
                <div className="flex items-start justify-between min-h-[44px]">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} border border-white/10 flex items-center justify-center ${action.iconColor} group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-300 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    {action.badge}
                  </span>
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between min-h-[24px]">
                    <span>{action.title}</span>
                    <ArrowUpRight size={16} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 font-light leading-relaxed min-h-[36px]">
                    {action.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two-Column Lower Section: Realtime Operations Stream & AI System Health */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        
        {/* Left Column: Recent System Activity Stream */}
        <div className="flex-1 min-w-0 w-full p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nhật Ký Tác Vụ Vận Hành Gần Nhất</h3>
                <p className="text-xs text-slate-400 font-light">Luồng sự kiện AI, đặt vé, dispatch chuyến và tracking khách</p>
              </div>
            </div>
            <Link to="/admin/audit-logs" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <span>Xem toàn bộ log</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentOperations.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex items-start gap-3.5"
              >
                <div className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-1 rounded-md shrink-0 mt-0.5">
                  {item.time}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shrink-0">
                      Thành công
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-light leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Engine & Security Health */}
        <div className="w-full lg:w-[360px] shrink-0 p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Trạng Thái Sức Khỏe AI</h3>
              <p className="text-xs text-slate-400 font-light">Spring AI, Vector & Tracking</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">PostgreSQL pgvector</div>
                <div className="text-[11px] text-slate-400">Vector HNSW Index Cosine</div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Sẵn sàng
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Spring AI Chatbot RAG</div>
                <div className="text-[11px] text-slate-400">Context Window 4.096 token</div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Ổn định
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Haversine Geolocation</div>
                <div className="text-[11px] text-slate-400">Định vị GPS & ưu tiên tuyến gần</div>
              </div>
              <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                Chính xác
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Heartbeat & Dwell Monitor</div>
                <div className="text-[11px] text-slate-400">Dwell time (Active vs Idle)</div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Hoạt động
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 leading-relaxed font-light">
            <strong className="text-white font-semibold">Khuyến nghị AI:</strong> Lưu lượng tuyến Sài Gòn ⇌ Phú Yên và Nha Trang có xu hướng tăng cao vào chiều tối thứ Sáu. Đề xuất chuẩn bị xe dự phòng.
          </div>
        </div>

      </div>

    </div>
  );
};
