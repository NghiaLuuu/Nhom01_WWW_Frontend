import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  keyExtractor: (row: T) => string | number;
}

export const DataTable = <T,>({
  data,
  columns,
  isLoading,
  onEdit,
  onDelete,
  keyExtractor
}: DataTableProps<T>) => {
  if (isLoading) {
    return (
      <div className="text-center py-12 text-cyan-400 text-sm font-medium animate-pulse flex flex-col items-center justify-center gap-2">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>Đang nạp dữ liệu từ hệ thống...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm font-medium bg-slate-950/40">
        Không có dữ liệu hiển thị.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-slate-200">
        <thead className="bg-slate-950/80 text-cyan-300 border-b border-white/10 sticky top-0 z-10 text-xs font-bold uppercase tracking-wider">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={`px-2.5 sm:px-3 py-3 whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-2.5 sm:px-3 py-3 text-right whitespace-nowrap w-20">Thao tác</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="even:bg-white/[0.015] hover:bg-cyan-500/[0.06] transition-colors group">
              {columns.map((col, idx) => (
                <td 
                  key={idx} 
                  className={`px-2.5 sm:px-3 py-2.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-2.5 sm:px-3 py-2.5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(row)} 
                        title="Chỉnh sửa"
                        className="text-cyan-400 hover:text-white hover:bg-cyan-500/20 p-1 rounded-lg transition-colors flex items-center justify-center min-w-[28px] min-h-[28px]"
                      >
                        <Edit size={15} />
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(row)} 
                        title="Xóa"
                        className="text-rose-400 hover:text-white hover:bg-rose-500/20 p-1 rounded-lg transition-colors flex items-center justify-center min-w-[28px] min-h-[28px]"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
