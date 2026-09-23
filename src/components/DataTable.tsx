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
    return <div className="text-center py-8 text-gray-500 text-sm font-medium animate-pulse">Đang tải dữ liệu...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500 text-sm font-medium bg-gray-50 border-t border-gray-200">Không có dữ liệu.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-gray-700">
        <thead className="bg-gray-50 text-gray-900 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={`px-4 py-3 font-semibold whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-4 py-3 text-right font-semibold whitespace-nowrap sticky right-0 bg-gray-50 w-24">Thao tác</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="even:bg-slate-50 hover:bg-slate-100 transition-colors group">
              {columns.map((col, idx) => (
                <td 
                  key={idx} 
                  className={`px-4 py-2.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-2.5 text-right whitespace-nowrap sticky right-0 bg-white group-even:bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-end gap-1">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(row)} 
                        title="Chỉnh sửa"
                        className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors flex items-center justify-center min-w-[32px] min-h-[32px]"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => onDelete(row)} 
                        title="Xóa"
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors flex items-center justify-center min-w-[32px] min-h-[32px]"
                      >
                        <Trash2 size={16} />
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
