import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle,
  Loader2,
  FileDown
} from 'lucide-react';
import type { BookingItem } from '../types/booking.types';
import { BookingService } from '../api/booking.service';
import { TicketPrint } from '../components/TicketPrint';
import { exportToPDF, generateTicketFileName } from '../../../utils/pdfExport';
import toast from 'react-hot-toast';

export const ETicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const ticketRef = useRef<HTMLDivElement>(null);

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
            setTickets(resTickets.data);
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
    if (!booking || !ticketRef.current) {
      toast.error('Chưa tải xong dữ liệu vé để xuất PDF');
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

      const success = await exportToPDF(ticketRef.current, fileName);

      if (success) {
        toast.success(`Đã tải về vé: ${fileName}`, { id: toastId });
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

  const expectedFileName = booking 
    ? generateTicketFileName(booking.id, booking.customer?.fullName, booking.trip?.departureTime)
    : 've-xe.pdf';

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
            onClick={() => navigate('/bookings')}
            className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:p-0 print:m-0">
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

      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* Actions bar (1 Nút Duy Nhất Để Tự Động Tải Vé) */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs no-print">
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
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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

        {/* Expected File Name info hint */}
        <div className="text-[11px] text-gray-500 text-right px-2 no-print flex items-center justify-end space-x-1">
          <span>Tên file:</span>
          <code className="bg-slate-200/80 px-2 py-0.5 rounded text-slate-800 font-mono font-bold">
            {expectedFileName}
          </code>
        </div>

        {/* Ticket Content Template (Rendered with clean CSS to prevent text distortion) */}
        <TicketPrint ref={ticketRef} booking={booking} tickets={tickets} />

      </div>
    </div>
  );
};
