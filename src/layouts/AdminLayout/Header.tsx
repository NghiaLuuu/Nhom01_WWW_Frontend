import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncVectors = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const toastId = toast.loading('Đang đồng bộ dữ liệu vào PostgreSQL pgvector...');

    try {
      const res = await api.post('/chatbot/ingest');
      const data = res.data?.data;
      if (data) {
        if (data.documentsWritten > 0) {
          toast.success(
            `Đồng bộ hoàn tất! Đã nạp thêm ${data.documentsWritten} vector mới vào pgvector.`,
            { id: toastId }
          );
        } else {
          toast.success(
            `Dữ liệu đã đồng bộ mới nhất (${data.sourcesRead} mục đã lập chỉ mục vector)!`,
            { id: toastId }
          );
        }
      } else {
        toast.success('Đồng bộ AI vector thành công!', { id: toastId });
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Lỗi khi đồng bộ vector vào pgvector!',
        { id: toastId }
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="h-14 min-h-[3.5rem] bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
        {title || ''}
      </h1>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSyncVectors}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title="Đồng bộ các tuyến đường, chuyến xe mới vào PostgreSQL pgvector để AI Chatbot tra cứu"
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          )}
          <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ AI Vector (pgvector)'}</span>
        </button>
      </div>
    </header>
  );
};
