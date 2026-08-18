import React, { useState, useEffect, useCallback } from 'react';
import { AuditLogService, type AuditLog, type PageResponse } from '../../../services/auditlog.service';
import { ChevronLeft, ChevronRight, Eye, Clock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const ACTION_STYLES: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN: 'bg-purple-100 text-purple-800',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Thêm mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  LOGIN: 'Đăng nhập',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const AuditLogManagement: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [entityNames, setEntityNames] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchEntityNames = useCallback(async () => {
    try {
      const res = await AuditLogService.getEntityNames();
      if (res.success) {
        setEntityNames(res.data);
      }
    } catch {
      // Silently fail - entity names are optional
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await AuditLogService.getAuditLogs(currentPage, pageSize, selectedEntity || undefined);
      if (res.success) {
        const pageData: PageResponse<AuditLog> = res.data;
        setLogs(pageData.content);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
      }
    } catch {
      toast.error('Không thể tải dữ liệu nhật ký.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedEntity]);

  useEffect(() => {
    fetchEntityNames();
  }, [fetchEntityNames]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleEntityChange = (value: string) => {
    setSelectedEntity(value);
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

  const renderJsonPreview = (data: Record<string, unknown> | null) => {
    if (!data) return <span className="text-gray-400 italic">—</span>;
    const entries = Object.entries(data);
    if (entries.length === 0) return <span className="text-gray-400 italic">Trống</span>;
    return (
      <div className="max-h-48 overflow-y-auto text-xs bg-gray-50 rounded-lg p-3 border border-gray-200 font-mono">
        {entries.map(([key, val]) => (
          <div key={key} className="flex gap-2 py-0.5">
            <span className="text-blue-600 font-semibold whitespace-nowrap">{key}:</span>
            <span className="text-gray-700 break-all">{val === null ? 'null' : String(val)}</span>
          </div>
        ))}
      </div>
    );
  };

  const startRecord = currentPage * pageSize + 1;
  const endRecord = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-blue-600" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Nhật Ký Hệ Thống</h2>
          <p className="text-gray-500 text-sm">Theo dõi lịch sử thao tác của người dùng trên hệ thống</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        {/* Entity Name Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Lọc theo bảng:</label>
          <select
            id="entity-filter"
            value={selectedEntity}
            onChange={(e) => handleEntityChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-w-[180px]"
          >
            <option value="">Tất cả</option>
            {entityNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Page Size */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Hiển thị:</label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s} dòng</option>
            ))}
          </select>
        </div>

        {/* Record Count */}
        <div className="ml-auto text-sm text-gray-500">
          Tổng: <span className="font-semibold text-gray-800">{totalElements}</span> bản ghi
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-500 font-medium animate-pulse">Đang tải dữ liệu...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-500 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
          Chưa có dữ liệu nhật ký.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3.5">Thời gian</th>
                <th className="px-4 py-3.5">Người thực hiện</th>
                <th className="px-4 py-3.5">Hành động</th>
                <th className="px-4 py-3.5">Bảng</th>
                <th className="px-4 py-3.5">ID Bản ghi</th>
                <th className="px-4 py-3.5">Endpoint</th>
                <th className="px-4 py-3.5">IP</th>
                <th className="px-4 py-3.5 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Clock size={14} className="text-gray-400" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-800 font-medium">{log.userEmail || <span className="italic text-gray-400">Hệ thống</span>}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${ACTION_STYLES[log.action] || 'bg-gray-100 text-gray-800'}`}>
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono font-medium">{log.entityName}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[120px] truncate" title={log.entityId || ''}>
                      {log.entityId || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={log.endpoint || ''}>
                      {log.endpoint || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{log.ipAddress || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          expandedRow === log.id
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                        }`}
                        title="Xem chi tiết dữ liệu thay đổi"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                  {/* Expanded Detail Row */}
                  {expandedRow === log.id && (
                    <tr className="bg-blue-50/30">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Dữ liệu cũ (Old Values)</p>
                            {renderJsonPreview(log.oldValues)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Dữ liệu mới (New Values)</p>
                            {renderJsonPreview(log.newValues)}
                          </div>
                        </div>
                        {log.userAgent && (
                          <div className="mt-3 text-xs text-gray-400 truncate">
                            <span className="font-medium text-gray-500">User Agent:</span> {log.userAgent}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Hiển thị <span className="font-semibold text-gray-700">{startRecord}</span> - <span className="font-semibold text-gray-700">{endRecord}</span> trong tổng số <span className="font-semibold text-gray-700">{totalElements}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} /> Trước
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 3) {
                  pageNum = i;
                } else if (currentPage > totalPages - 4) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'border border-gray-300 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Sau <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
