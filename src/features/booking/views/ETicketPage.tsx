import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { 
  ArrowLeft, 
  AlertCircle,
  Loader2,
  FileDown
} from 'lucide-react';
import type { BookingItem, TicketItem } from '../types/booking.types';
import { BookingService } from '../api/booking.service';
import { TicketPrint } from '../components/TicketPrint';
import { exportToPDF, generateTicketFileName } from '../../../utils/pdfExport';
import toast from 'react-hot-toast';

export const ETicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isStaffOrAdmin = user?.roles?.some((r: string) => ['ROLE_ADMIN', 'ROLE_STAFF', 'ADMIN', 'STAFF'].includes(r));

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ticketRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const res = await BookingService.getBookingById(id);
        if (res.success && res.data) {
          setBooking(res.data);
        } else if (res.data) {
          setBooking(res.data);
        } else {
          setError('Không tìm thấy thông tin vé.');
        }

        try {
          const resTickets = await BookingService.getTicketsByBookingId(Number(id));
          if (resTickets.success && Array.isArray(resTickets.data)) {
            // The ticket list does not always include the QR image. Load the
            // official QR for each ticket before allowing it to be printed.
            const ticketsWithQr = await Promise.all(
              resTickets.data.map(async (ticket) => {
                if (ticket.qrCode?.trim()) return ticket;

                try {
                  const qrRes = await BookingService.getTicketQrCode(ticket.id);
                  const qrData = qrRes.success ? qrRes.data : undefined;
                  const qrCode = typeof qrData === 'string'
                    ? qrData
                    : (qrData as unknown as { qrCode?: string })?.qrCode;

                  return qrCode ? { ...ticket, qrCode } : ticket;
                } catch {
                  return ticket;
                }
              })
            );
            setTickets(ticketsWithQr);
          }
        } catch (e) {
          console.warn('Could not fetch tickets list:', e);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải thông tin vé điện tử');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const handleDownloadTicket = async () => {
    const renderedTickets = ticketRefs.current.filter(
      (ticketElement): ticketElement is HTMLDivElement => ticketElement !== null
    );
    const ticketsToPrint = tickets.length > 0 ? tickets : (booking?.tickets || []);

    if (!booking || renderedTickets.length === 0) {
      toast.error('Chưa tải xong dữ liệu vé để xuất PDF');
      return;
    }

    if (ticketsToPrint.length > 0 && ticketsToPrint.some(ticket => !ticket.qrCode?.trim())) {
      toast.error('Mã QR chính thức chưa tải xong. Vui lòng thử lại sau ít giây.');
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading('Đang khởi tạo file PDF vé xe...');

    try {
      const fileName = generateTicketFileName(
        booking.id,
        booking.customer?.fullName,
        booking.trip?.departureTime
      );

      const success = await exportToPDF(renderedTickets, fileName);

      if (success) {
        toast.success(`Đã tải về ${renderedTickets.length} vé: ${fileName}`, { id: toastId });
      } else {
        toast.error('Không thể tạo file PDF. Vui lòng thử lại.', { id: toastId });
      }
    } catch (err) {
      console.error('Download PDF error:', err);
      toast.error('Lỗi khi xuất PDF', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center space-y-4 max-w-sm w-full animate-pulse">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={24} />
          </div>
          <div className="h-5 bg-gray-200 rounded w-32 mx-auto" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm text-center space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="font-bold text-gray-900">Không tìm thấy vé</h3>
          <p className="text-xs text-gray-500">{error || 'Vé không tồn tại'}</p>
          <button
            onClick={() => navigate(isStaffOrAdmin ? '/admin/tickets' : '/bookings')}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const ticketItems = tickets.length > 0
    ? tickets
    : booking.tickets && booking.tickets.length > 0
      ? booking.tickets
      : [undefined];

  return (
    <div className="min-h-screen bg-slate-100 py-3 px-3 sm:px-4 print:bg-white print:p-0 print:m-0">
      {/* Embedded Print CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 12px !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .ticket-print-container {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: 1.5px solid #cbd5e1 !important;
            border-radius: 12px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="max-w-2xl mx-auto space-y-2.5">
        
        {/* Actions bar (1 Nút Duy Nhất Để Tự Động Tải Vé) */}
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-xs no-print">
          <button
            onClick={() => navigate(`/bookings/${booking.id}`)}
            className="inline-flex items-center space-x-2 text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Chi tiết đơn #{booking.id}</span>
          </button>

          {/* 1 Nút Duy Nhất: Tải vé PDF */}
          <button
            onClick={handleDownloadTicket}
            disabled={isDownloading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang tạo PDF...</span>
              </>
            ) : (
              <>
                <FileDown size={16} />
                <span>Tải vé PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Each seat is rendered as its own ticket and its own PDF page. */}
        <div className="space-y-3">
          {ticketItems.map((ticket, index) => (
            <TicketPrint
              key={ticket?.id || `ticket-${index}`}
              ref={(element) => {
                ticketRefs.current[index] = element;
              }}
              booking={booking}
              ticket={ticket}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
