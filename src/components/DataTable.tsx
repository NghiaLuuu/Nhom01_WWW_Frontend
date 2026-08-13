import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
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
    return <div className="text-center py-10 text-gray-500 font-medium animate-pulse">Đang tải dữ liệu...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-gray-500 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">Không có dữ liệu.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4">{col.header}</th>
            ))}
            {(onEdit || onDelete) && <th className="px-6 py-4 text-right">Thao tác</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-gray-50 transition-colors">
              {columns.map((col, idx) => (
                <td key={idx} className="px-6 py-4">
                  {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                  {onEdit && (
                    <button onClick={() => onEdit(row)} className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-md hover:bg-blue-50">
                      <Edit size={18} />
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(row)} className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-md hover:bg-red-50">
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
