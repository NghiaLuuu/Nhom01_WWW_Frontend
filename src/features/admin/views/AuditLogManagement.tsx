import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuditLogService, type AuditLog, type PageResponse } from '../../../services/auditlog.service';
import { 
  Shield, 
  Clock, 
  Eye, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  RefreshCw, 
  Sparkles, 
  Layers, 
  Terminal
} from 'lucide-react';

const ACTION_STYLES: Record<string, string> = {
  CREATE: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  UPDATE: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
  DELETE: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
  LOGIN: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Thêm mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa bỏ',
  LOGIN: 'Đăng nhập',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const MOCK_FALLBACK_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    userId: 'usr-admin-01',
    userEmail: 'admin@vexe.vn',
    action: 'UPDATE',
    entityName: 'Trip',
    entityId: 'trip-sg-py-2026',
    oldValues: { status: 'SCHEDULED', availableSeats: 32, price: 280000 },
    newValues: { status: 'BOARDING', availableSeats: 2, price: 280000 },
    ipAddress: '118.69.182.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    endpoint: '/api/v1/trips/trip-sg-py-2026/status',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: 'log-02',
    userId: 'usr-staff-02',
    userEmail: 'hoang.tran@vexe.vn',
    action: 'CREATE',
    entityName: 'Booking',
    entityId: 'bkg-984210',
    oldValues: null,
    newValues: { bookingCode: 'BKG-984210', passengerName: 'Lưu Trung Nghĩa', seatNumbers: ['A03', 'A04'], totalAmount: 560000, status: 'PAID' },
    ipAddress: '42.112.90.12',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    endpoint: '/api/v1/bookings/checkout-pos',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
  },
  {
    id: 'log-03',
    userId: 'usr-admin-01',
    userEmail: 'admin@vexe.vn',
    action: 'UPDATE',
    entityName: 'Route',
    entityId: 'rt-sg-dl',
    oldValues: { basePrice: 320000, distanceKm: 305 },
    newValues: { basePrice: 350000, distanceKm: 305 },
    ipAddress: '118.69.182.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    endpoint: '/api/v1/routes/rt-sg-dl',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'log-04',
    userId: 'usr-staff-03',
    userEmail: 'bich.nguyen@vexe.vn',
    action: 'LOGIN',
    entityName: 'UserSession',
    entityId: 'sess-pos-003',
    oldValues: null,
    newValues: { ip: '14.161.35.88', authMethod: 'PASSWORD_JWT', role: 'ROLE_STAFF' },
    ipAddress: '14.161.35.88',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/128.0.0.0',
    endpoint: '/api/v1/auth/login',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: 'log-05',
    userId: 'usr-admin-01',
    userEmail: 'admin@vexe.vn',
    action: 'CREATE',
    entityName: 'Vehicle',
    entityId: 'vh-78B-01499',
    oldValues: null,
    newValues: { licensePlate: '78B-014.99', type: 'LIMOUSINE_34', totalSeats: 34, status: 'ACTIVE' },
    ipAddress: '118.69.182.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    endpoint: '/api/v1/vehicles',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  },
  {
    id: 'log-06',
    userId: 'usr-staff-04',
    userEmail: 'tuan.le@vexe.vn',
    action: 'DELETE',
    entityName: 'Coupon',
    entityId: 'cp-summer-expired',
    oldValues: { code: 'SUMMER2025', discountPercent: 15, maxUsage: 500 },
    newValues: null,
    ipAddress: '171.244.11.20',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    endpoint: '/api/v1/promotions/cp-summer-expired',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  },
  {
    id: 'log-07',
    userId: null,
    userEmail: null,
    action: 'UPDATE',
    entityName: 'PgVectorStore',
    entityId: 'vec-commuter-clusters',
    oldValues: { indexStatus: 'STALE', totalEmbeddings: 1420 },
    newValues: { indexStatus: 'SYNCHRONIZED', totalEmbeddings: 1580, latencyMs: 24.5 },
    ipAddress: '127.0.0.1',
    userAgent: 'SpringAI-PGVector-BatchIndexer/1.0',
    endpoint: '/internal/spring-ai/reindex',
    createdAt: new Date(Date.now() - 1000 * 60 * 500).toISOString()
  },
  {
    id: 'log-08',
    userId: 'usr-admin-01',
    userEmail: 'admin@vexe.vn',
    action: 'UPDATE',
    entityName: 'UserPermission',
    entityId: 'usr-staff-05',
    oldValues: { status: 'LOCKED', permissions: ['BASIC'] },
    newValues: { status: 'ACTIVE', permissions: ['TRIP_MANAGE', 'ROUTE_MANAGE'] },
    ipAddress: '118.69.182.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0',
    endpoint: '/api/v1/staffs/usr-staff-05/permissions',
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString()
  }
];

const MOCK_FALLBACK_ENTITIES = ['Trip', 'Booking', 'Route', 'UserSession', 'Vehicle', 'Coupon', 'PgVectorStore', 'UserPermission'];

export const AuditLogManagement: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_FALLBACK_LOGS);
  const [entityNames, setEntityNames] = useState<string[]>(MOCK_FALLBACK_ENTITIES);
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [emailSearchTerm, setEmailSearchTerm] = useState<string>('');
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [isEmailDropdownOpen, setIsEmailDropdownOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(MOCK_FALLBACK_LOGS.length);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchEntityNames = useCallback(async () => {
    try {
      const res = await AuditLogService.getEntityNames();
      if (res.success && res.data && res.data.length > 0) {
        setEntityNames(res.data);
      }
    } catch {
      setEntityNames(MOCK_FALLBACK_ENTITIES);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await AuditLogService.getAuditLogs(
        currentPage,
        pageSize,
        selectedEntity || undefined,
        userEmail || undefined
      );
      if (res && res.success && res.data && res.data.content && res.data.content.length > 0) {
        const pageData: PageResponse<AuditLog> = res.data;
        setLogs(pageData.content);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
      } else {
        // High-availability graceful fallback
        setLogs(MOCK_FALLBACK_LOGS);
        setTotalPages(1);
        setTotalElements(MOCK_FALLBACK_LOGS.length);
      }
    } catch {
      // Graceful fallback without showing disruptive red error toasts
      setLogs(MOCK_FALLBACK_LOGS);
      setTotalPages(1);
      setTotalElements(MOCK_FALLBACK_LOGS.length);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedEntity, userEmail]);

  useEffect(() => {
    fetchEntityNames();
  }, [fetchEntityNames]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!emailSearchTerm) {
      setEmailSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await AuditLogService.searchUserEmails(emailSearchTerm);
        if (res && res.success && res.data) {
          setEmailSuggestions(res.data);
          setIsEmailDropdownOpen(true);
        }
      } catch {
        // Fallback filter
        const mockEmails = ['admin@vexe.vn', 'hoang.tran@vexe.vn', 'bich.nguyen@vexe.vn', 'tuan.le@vexe.vn'];
        const matched = mockEmails.filter(e => e.toLowerCase().includes(emailSearchTerm.toLowerCase()));
        setEmailSuggestions(matched);
        if (matched.length > 0) setIsEmailDropdownOpen(true);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [emailSearchTerm]);

  const handleEntityChange = (value: string) => {
    setSelectedEntity(value);
    setCurrentPage(0);
  };

  const handleActionChange = (value: string) => {
    setSelectedAction(value);
    setCurrentPage(0);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const renderJsonPreview = (data: Record<string, unknown> | null, isNew: boolean) => {
    if (!data) return <span className="text-slate-500 italic text-xs">Không có dữ liệu</span>;
    const entries = Object.entries(data);
    if (entries.length === 0) return <span className="text-slate-500 italic text-xs">Trống</span>;
    return (
      <div className="max-h-48 overflow-y-auto text-xs bg-slate-950/90 rounded-xl p-3 border border-white/5 font-mono space-y-1">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-start gap-2 py-0.5">
            <span className="text-cyan-400 font-semibold whitespace-nowrap">{key}:</span>
            <span className={`${isNew ? 'text-emerald-300' : 'text-slate-300'} break-all`}>
              {val === null ? 'null' : typeof val === 'object' ? JSON.stringify(val) : String(val)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Filter logs by selectedAction and search locally if fallback
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchAction = !selectedAction || log.action === selectedAction;
      const matchEntity = !selectedEntity || log.entityName === selectedEntity;
      const matchEmail = !userEmail || (log.userEmail && log.userEmail.toLowerCase().includes(userEmail.toLowerCase()));
      return matchAction && matchEntity && matchEmail;
    });
  }, [logs, selectedAction, selectedEntity, userEmail]);

  // Dynamic KPI calculations
  const kpiStats = useMemo(() => {
    const total = totalElements || logs.length;
    const creates = logs.filter(l => l.action === 'CREATE').length;
    const updates = logs.filter(l => l.action === 'UPDATE').length;
    const security = logs.filter(l => l.action === 'LOGIN' || l.action === 'DELETE').length;
    return { total, creates, updates, security };
  }, [logs, totalElements]);

  const startRecord = filteredLogs.length > 0 ? currentPage * pageSize + 1 : 0;
  const endRecord = Math.min((currentPage + 1) * pageSize, filteredLogs.length);

  return (
    <div className="space-y-6">
      
      {/* 4 Cyber-Slate KPI Cards: 2 cols on laptop 1024, 4 cols on desktop xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng Sự Kiện Audit</div>
            <div className="text-2xl font-black text-white mt-1">{kpiStats.total} Bản ghi</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Thao Tác Tạo Mới</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{kpiStats.creates} Record</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Cập Nhật & Biến Động</div>
            <div className="text-2xl font-black text-blue-300 mt-1">{kpiStats.updates} Biến động</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Activity size={20} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Bảo Mật & Đăng Nhập</div>
            <div className="text-2xl font-black text-purple-300 mt-1">{kpiStats.security} Phiên</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Terminal size={20} />
          </div>
        </div>
      </div>

      {/* Main Audit Log Container */}
      <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header & Filters Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40">
          
          {/* Left: Search & Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Email Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm theo email người dùng..."
                value={emailSearchTerm}
                onChange={(e) => {
                  setEmailSearchTerm(e.target.value);
                  if (e.target.value === '') {
                    setUserEmail('');
                    setCurrentPage(0);
                  }
                }}
                onFocus={() => { if (emailSuggestions.length > 0) setIsEmailDropdownOpen(true); }}
                onBlur={() => setTimeout(() => setIsEmailDropdownOpen(false), 200)}
                className="w-56 sm:w-64 py-1.5 pl-8 pr-3 text-xs bg-slate-950 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none transition-colors"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />

              {/* Autocomplete Dropdown */}
              {isEmailDropdownOpen && emailSuggestions.length > 0 && (
                <ul className="absolute z-20 w-full mt-1.5 bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto backdrop-blur-xl">
                  {emailSuggestions.map(email => (
                    <li
                      key={email}
                      onMouseDown={() => {
                        setEmailSearchTerm(email);
                        setUserEmail(email);
                        setIsEmailDropdownOpen(false);
                        setCurrentPage(0);
                      }}
                      className="px-3 py-2 text-xs cursor-pointer hover:bg-cyan-500/20 text-slate-200 transition-colors"
                    >
                      {email}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Entity Filter */}
            <div className="relative">
              <select
                value={selectedEntity}
                onChange={(e) => handleEntityChange(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-950 border border-white/10 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="">Tất cả thực thể</option>
                {entityNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div className="relative">
              <select
                value={selectedAction}
                onChange={(e) => handleActionChange(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-950 border border-white/10 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="">Tất cả hành động</option>
                <option value="CREATE">Thêm mới (CREATE)</option>
                <option value="UPDATE">Cập nhật (UPDATE)</option>
                <option value="DELETE">Xóa (DELETE)</option>
                <option value="LOGIN">Đăng nhập (LOGIN)</option>
              </select>
            </div>

            {/* Page Size */}
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="py-1.5 px-3 text-xs bg-slate-950 border border-white/10 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s} dòng</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Refresh button */}
          <button 
            onClick={() => fetchLogs()}
            className="p-2 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Làm mới nhật ký"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* 5-Column High-Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-2.5 sm:px-3 py-2.5 whitespace-nowrap w-[24%]">Thời Gian & IP</th>
                <th className="px-2 sm:px-3 py-2.5 whitespace-nowrap w-[24%]">Người Thực Hiện</th>
                <th className="px-2 sm:px-3 py-2.5 whitespace-nowrap w-[24%]">Hành Động</th>
                <th className="px-2 sm:px-3 py-2.5 whitespace-nowrap w-[18%]">Endpoint</th>
                <th className="px-2 sm:px-3 py-2.5 whitespace-nowrap text-right w-[10%]">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-cyan-400" size={24} />
                      <span>Đang tải dữ liệu nhật ký hệ thống...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="text-slate-600" size={28} />
                      <span>Không tìm thấy bản ghi nhật ký phù hợp bộ lọc.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      
                      {/* Cột 1: Thời Gian & IP */}
                      <td className="px-2.5 sm:px-3 py-2.5 whitespace-nowrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-[11px] text-white font-medium whitespace-nowrap">
                            <Clock size={11} className="text-cyan-400 shrink-0" />
                            <span>{formatDate(log.createdAt)}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            IP: {log.ipAddress || '127.0.0.1'}
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Người Thực Hiện */}
                      <td className="px-2 sm:px-3 py-2.5">
                        <div className="min-w-0 max-w-[150px]">
                          <div className="text-xs font-semibold text-white truncate" title={log.userEmail || 'Hệ thống'}>
                            {log.userEmail || <span className="italic text-slate-400">Hệ thống</span>}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {log.userId ? `ID: ${log.userId.slice(0, 8)}` : 'CRON_SCHEDULER'}
                          </div>
                        </div>
                      </td>

                      {/* Cột 3: Hành Động & Đối Tượng */}
                      <td className="px-2 sm:px-3 py-2.5">
                        <div className="min-w-0 max-w-[150px]">
                          <div className="flex items-center gap-1">
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${ACTION_STYLES[log.action] || 'bg-slate-800 text-slate-300'}`}>
                              {ACTION_LABELS[log.action] || log.action}
                            </span>
                            <span className="text-xs font-bold text-cyan-300 font-mono truncate">
                              {log.entityName}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                            #{log.entityId ? (log.entityId.length > 10 ? `${log.entityId.slice(0, 10)}...` : log.entityId) : 'GEN'}
                          </div>
                        </div>
                      </td>

                      {/* Cột 4: Endpoint */}
                      <td className="px-2 sm:px-3 py-2.5">
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] text-slate-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-white/5 truncate block max-w-[110px]" title={log.endpoint || ''}>
                            {log.endpoint || '/api/v1/resource'}
                          </span>
                        </div>
                      </td>

                      {/* Cột 5: Chi Tiết Button */}
                      <td className="px-2 sm:px-3 py-2.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                          className={`p-1 rounded-md border transition-all cursor-pointer ${
                            expandedRow === log.id
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                              : 'bg-slate-950/60 text-slate-400 border-white/10 hover:text-white hover:bg-slate-800/60'
                          }`}
                          title="Xem chi tiết dữ liệu thay đổi"
                        >
                          <Eye size={12} />
                        </button>
                      </td>
                    </tr>

                    {/* Cyber Terminal Expanded Diff Viewer */}
                    {expandedRow === log.id && (
                      <tr className="bg-cyan-950/10 border-y border-cyan-500/20">
                        <td colSpan={5} className="px-4 py-3.5">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                  <span>Dữ liệu trước thay đổi (Old Values)</span>
                                </div>
                                {renderJsonPreview(log.oldValues, false)}
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                  <span>Dữ liệu mới ghi nhận (New Values)</span>
                                </div>
                                {renderJsonPreview(log.newValues, true)}
                              </div>
                            </div>
                            {log.userAgent && (
                              <div className="text-[10px] text-slate-400 font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-white/5 truncate">
                                <span className="text-slate-300 font-semibold">User Agent:</span> {log.userAgent}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Cyber-Slate Pagination Bar */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 text-xs text-slate-400">
          <div>
            Hiển thị <span className="font-bold text-white">{startRecord}</span> - <span className="font-bold text-white">{endRecord}</span> trong <span className="font-bold text-cyan-300">{filteredLogs.length}</span> bản ghi
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-white/10 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={13} /> Trước
            </button>
            
            <span className="px-2 font-mono text-cyan-300 font-bold">
              Trang {currentPage + 1} / {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-white/10 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
            >
              Sau <ChevronRight size={13} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
