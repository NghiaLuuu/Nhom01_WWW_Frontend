import React, { useState, useEffect } from 'react';
import { type Ticket, TicketService } from '../../../services/ticket.service';
import { DataTable, type Column } from '../../../components/DataTable';
import { AdminPageLayout } from '../../../components/AdminPageLayout';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const TicketManagement: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await TicketService.getAllTickets();
      if (res.success) {
        setTickets(res.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu đơn đặt vé');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const columns: Column<Ticket>[] = [
    { header: 'Mã Đơn', accessor: 'bookingCode', width: '15%' },
    { header: 'Khách Hàng', accessor: (row) => row.customer?.fullName || 'Khách vãng lai', width: '20%' },
    { header: 'Tuyến Đường', accessor: (row) => `${row.trip.route?.departureLocation} - ${row.trip.route?.arrivalLocation}`, width: '20%' },
    { header: 'Ghế', accessor: (row) => row.seats ? row.seats.join(', ') : 'N/A', align: 'center', width: '10%' },
    { header: 'Tổng Tiền', accessor: (row) => new Intl.NumberFormat('vi-VN').format(row.totalPrice) + 'đ', align: 'right', width: '10%' },
    { 
      header: 'Trạng Thái', 
      accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
          row.status === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
          row.status === 'CANCEL_REQUESTED' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
          row.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
          'bg-gray-100 text-gray-700 border-gray-200'
        }`}>
          {row.status === 'CANCEL_REQUESTED' ? 'Yêu cầu hủy' : row.status}
        </span>
      ),
      align: 'left',
      width: '15%'
    },
    {
      header: 'Thao Tác (Staff)',
      accessor: (row) => {
        if (row.cancelRequestId) {
          return (
            <Link to={`/admin/cancel-requests?requestId=${row.cancelRequestId}`} className="text-blue-700 hover:underline text-sm">Xem yêu cầu hủy</Link>
          );
        }
        return <div className="text-gray-400 text-xs italic text-right pr-4">Không</div>;
      },
      align: 'right',
      width: '10%'
    }
  ];

  return (
    <AdminPageLayout>
      <DataTable 
        data={tickets} 
        columns={columns} 
        isLoading={isLoading}
        keyExtractor={(row) => row.id}
      />
    </AdminPageLayout>
  );
};
