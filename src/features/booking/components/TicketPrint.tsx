import React, { forwardRef } from 'react';
import { 
  Bus, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2
} from 'lucide-react';
import type { BookingItem } from '../types/booking.types';

interface TicketPrintProps {
  booking: BookingItem;
  tickets?: any[];
}

export const TicketPrint = forwardRef<HTMLDivElement, TicketPrintProps>(({ booking, tickets }, ref) => {
  const depTime = booking?.trip?.departureTime ? new Date(booking.trip.departureTime) : null;
  const issueDate = booking?.createdAt ? new Date(booking.createdAt) : new Date();

  const activeTickets = tickets && tickets.length > 0 ? tickets : (booking?.tickets || []);
  const qrBase64 = activeTickets[0]?.qrCode;
  const seatNames = activeTickets.length > 0 
    ? activeTickets.map((t: any) => t.seat?.seatName || t.seatNumber).filter(Boolean).join(', ')
    : (booking?.seats?.join(', ') || 'Ghế đặt');

  return (
    <div
      ref={ref}
      id="eticket-pdf-content"
      className="ticket-print-container bg-white rounded-2xl border-2 border-slate-300 overflow-hidden text-slate-800 w-full max-w-2xl mx-auto shadow-lg"
      style={{
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header Banner */}
      <div 
        className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: '#1d4ed8' }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Bus size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">VEXE EXPRESS</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-400 text-slate-950 px-2 py-0.5 rounded">
                CHÍNH HÃNG
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">Hệ thống đặt vé xe khách toàn quốc</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 block">
            THẺ LÊN XE ĐIỆN TỬ
          </span>
          <span className="font-mono text-xl font-bold text-white tracking-wider block mt-0.5">
            VX-{booking.id.toString().padStart(6, '0')}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-4">
        
        {/* Route and Schedule Box */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2.5 mb-3 gap-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-700">
              <Calendar size={15} />
              <span>
                Ngày khởi hành: {depTime ? depTime.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Ngày đặt: <strong className="text-slate-900">{issueDate.toLocaleDateString('vi-VN')} {issueDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>
              </span>
              <span>•</span>
              <span>Dự kiến: ~{booking.trip?.route?.durationMinutes || 240} phút ({booking.trip?.route?.distanceKm || 300} km)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Departure */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                ĐIỂM XUẤT PHÁT (ĐI)
              </span>
              <div className="text-lg font-bold text-slate-900 leading-tight">
                {booking.trip?.route?.departureLocation}
              </div>
              <div className="text-xs font-bold text-blue-700 flex items-center space-x-1 mt-1.5">
                <Clock size={13} />
                <span>Giờ xe chạy: {depTime ? depTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                {booking.pickupPoint || 'Bến xe trung tâm (Vui lòng có mặt trước 30 phút)'}
              </p>
            </div>

            {/* Arrival */}
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                ĐIỂM ĐẾN (TRẢ)
              </span>
              <div className="text-lg font-bold text-slate-900 leading-tight">
                {booking.trip?.route?.arrivalLocation}
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-1.5">
                Dự kiến đến: {depTime && booking.trip?.route?.durationMinutes ? new Date(depTime.getTime() + booking.trip.route.durationMinutes * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Trong ngày'}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                {booking.dropoffPoint || 'Bến xe trả khách'}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Detail Boxes Grid */}
        <div className="grid grid-cols-3 gap-3">
          
          {/* Passenger Box */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between min-h-[90px]">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                HÀNH KHÁCH
              </span>
              <div className="text-sm font-bold text-slate-900 leading-snug break-words">
                {booking.customer?.fullName || 'Khách hàng'}
              </div>
            </div>
            <div className="mt-2 space-y-0.5">
              <div className="text-xs text-slate-700 font-mono">
                {booking.customer?.phoneNumber || '0912345678'}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {booking.customer?.email || 'N/A'}
              </div>
            </div>
          </div>

          {/* Seats Box */}
          <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 flex flex-col justify-between min-h-[90px]">
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                SỐ GHẾ & LOẠI XE
              </span>
              <div className="text-base font-bold text-blue-800 leading-tight">
                {seatNames}
              </div>
            </div>
            <div className="mt-2 space-y-0.5">
              <div className="text-xs font-semibold text-slate-800">
                {booking.trip?.vehicle?.type || 'Xe khách'}
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                Biển số: {booking.trip?.vehicle?.licensePlate || 'N/A'}
              </div>
            </div>
          </div>

          {/* Payment Box */}
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 flex flex-col justify-between min-h-[90px]">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                TỔNG THANH TOÁN
              </span>
              <div className="text-base font-bold text-emerald-700 leading-tight">
                {Number(booking.totalPrice).toLocaleString('vi-VN')}₫
              </div>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2 py-0.5 rounded">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>{booking.status === 'PAID' ? 'ĐÃ THANH TOÁN' : booking.status}</span>
              </span>
            </div>
          </div>

        </div>

        {/* Dashed Separator */}
        <div className="border-b-2 border-dashed border-slate-300 my-1" />

        {/* QR Verification and Guidelines */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="sm:col-span-2 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-800 uppercase">
              <ShieldCheck size={16} className="text-blue-600" />
              <span>HƯỚNG DẪN & QUY ĐỊNH LÊN XE</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1 pl-1">
              <li className="flex items-start space-x-1.5">
                <span className="text-blue-600 font-bold">•</span>
                <span>Xuất trình mã QR này trên điện thoại hoặc bản in khi lên xe.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-blue-600 font-bold">•</span>
                <span>Có mặt tại điểm đón trước ít nhất <strong>30 phút</strong> giờ khởi hành.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-blue-600 font-bold">•</span>
                <span>Mỗi vé kèm tối đa 20kg hành lý gửi kèm theo quy định.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 bg-white border-2 border-slate-800 rounded-xl">
            {qrBase64 ? (
              <img 
                src={`data:image/png;base64,${qrBase64}`} 
                alt="Ticket QR Code" 
                className="w-24 h-24 object-contain"
              />
            ) : (
              <QrCode size={80} className="text-slate-950" />
            )}
            <span className="text-[10px] font-mono font-bold text-slate-700 mt-1">
              *{activeTickets[0]?.ticketCode || `VX${booking.id.toString().padStart(6, '0')}`}*
            </span>
          </div>
        </div>

        {/* Barcode Strip */}
        <div className="pt-1 flex flex-col items-center">
          <div className="h-8 w-full max-w-sm flex justify-between items-end px-2">
            {Array.from({ length: 44 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-900"
                style={{
                  width: i % 4 === 0 ? '3px' : i % 3 === 0 ? '2px' : '1px',
                  height: i % 5 === 0 ? '100%' : i % 2 === 0 ? '70%' : '85%',
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1">
            Mã xác thực soát vé: 8938501239{booking.id.toString().padStart(6, '0')}
          </span>
        </div>

      </div>

      {/* Ticket Footer */}
      <div className="bg-slate-100 px-6 py-2.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-1">
        <span>Ngày giờ đặt vé: <strong className="text-slate-700">{issueDate.toLocaleDateString('vi-VN')} {issueDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong></span>
        <span>Tổng đài 24/7: <strong className="text-blue-700">1900 8888</strong> • vexe.vn</span>
        <span className="font-semibold text-slate-700">Trang 1/1</span>
      </div>

    </div>
  );
});

TicketPrint.displayName = 'TicketPrint';
