import React, { useState } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PublicAiTripShelf } from '../../booking/components/PublicAiTripShelf';

export const ContactPage: React.FC = () => {
  useDocumentTitle("Liên hệ & Hỗ trợ 24/7 | VEXE");

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    topic: 'SUPPORT',
    bookingCode: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast.error("Vui lòng điền đầy đủ họ tên, số điện thoại và nội dung yêu cầu!");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("Yêu cầu hỗ trợ đã được gửi thành công! Chuyên viên CSKH sẽ phản hồi trong ít phút.");
    }, 800);
  };

  const offices = [
    {
      city: "Trụ Sở Chính - TP. Hồ Chí Minh",
      address: "Tòa nhà Công nghệ Thông tin IUH, Số 12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, TP. HCM",
      hotline: "1900 6868 (Nhánh 1)",
      email: "cskh.hcm@vexe.vn",
      hours: "07:00 - 22:00 (Hàng ngày)"
    },
    {
      city: "Chi Nhánh Đại Diện - Hà Nội",
      address: "Tầng 8, Tòa tháp Công nghệ, Số 1 Phố Thanh Bình, Phường Mộ Lao, Quận Hà Đông, Hà Nội",
      hotline: "1900 6868 (Nhánh 2)",
      email: "cskh.hn@vexe.vn",
      hours: "07:30 - 21:30 (Hàng ngày)"
    },
    {
      city: "Chi Nhánh Miền Trung - Đà Nẵng",
      address: "Số 158 Đường Nguyễn Tri Phương, Phường Chính Gián, Quận Thanh Khê, TP. Đà Nẵng",
      hotline: "1900 6868 (Nhánh 3)",
      email: "cskh.danang@vexe.vn",
      hours: "08:00 - 20:30 (Hàng ngày)"
    }
  ];

  const majorStations = [
    { name: "Bến xe Miền Đông Mới", city: "TP. Hồ Chí Minh", address: "501 Hoàng Hữu Nam, Long Bình, TP. Thủ Đức" },
    { name: "Bến xe Miền Tây", city: "TP. Hồ Chí Minh", address: "395 Kinh Dương Vương, An Lạc, Bình Tân" },
    { name: "Bến xe Mỹ Đình", city: "Hà Nội", address: "Số 20 Phạm Hùng, Mỹ Đình, Nam Từ Liêm" },
    { name: "Bến xe Nước Ngầm", city: "Hà Nội", address: "Km8 Giải Phóng, Hoàng Liệt, Hoàng Mai" },
    { name: "Bến xe Trung Tâm Đà Nẵng", city: "Đà Nẵng", address: "Tôn Đức Thắng, Hòa Minh, Liên Chiểu" },
    { name: "Bến xe Liên Tỉnh Đà Lạt", city: "Lâm Đồng", address: "Số 01 Tô Hiến Thành, Phường 3, TP. Đà Lạt" }
  ];

  return (
    <div className="w-full bg-[#0b1120] text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Hero Header */}
      <section className="relative pt-20 pb-12 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Clock size={14} className="text-blue-400" />
            <span>Tổng Đài Trực Tuyến 24/7/365</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Liên Hệ &{' '}
            <span className="text-blue-400">
              Hỗ Trợ Khách Hàng
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
            Mọi sự cố về vé, thay đổi lịch trình hoặc khiếu nại chất lượng dịch vụ xe, chúng tôi cam kết phản hồi ngay trong vòng 5 phút đối với các chuyến xe sắp khởi hành.
          </p>
        </div>
      </section>

      {/* Main Container: Flex for Form & Contact Info */}
      <section className="py-12 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Left Column: Contact Cards */}
          <div className="w-full lg:w-5/12 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 size={20} className="text-blue-400" />
                <span>Văn Phòng & Điểm Tiếp Nhận</span>
              </h2>

              {offices.map((office, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm space-y-3">
                  <div className="font-bold text-white text-base">{office.city}</div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-2">
                      <MapPin size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span>{office.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={15} className="text-emerald-400 shrink-0" />
                      <span>Hotline: <strong className="text-white font-mono">{office.hotline}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={15} className="text-indigo-400 shrink-0" />
                      <span>Email: <strong className="text-white">{office.email}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-amber-400 shrink-0" />
                      <span>Thời gian: {office.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Major Stations List */}
            <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <MapPin size={16} className="text-blue-400" />
                <span>Các Bến Xe Có Quầy Vé VEXE Trực Tiếp</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                {majorStations.map((st, sIdx) => (
                  <div key={sIdx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 space-y-0.5">
                    <div className="font-semibold text-white">{st.name}</div>
                    <div className="text-[11px] text-slate-400">{st.city}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Support Ticket Form */}
          <div className="w-full lg:w-7/12">
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm space-y-6">
              <div className="border-b border-slate-700 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare size={20} className="text-blue-400" />
                  <span>Gửi Yêu Cầu Hỗ Trợ Trực Tuyến</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Đội ngũ CSKH tiếp nhận và xử lý liên tục 24/7. Đối với trường hợp khẩn cấp khi xe sắp chạy, vui lòng gọi trực tiếp hotline 1900 6868.
                </p>
              </div>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Yêu Cầu Đã Được Tiếp Nhận</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Cảm ơn bạn đã liên hệ. Mã yêu cầu hỗ trợ đã được tạo và gửi thông báo đến chuyên viên thường trực. Chúng tôi sẽ phản hồi qua số điện thoại hoặc email trong ít phút.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Họ và Tên <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-white text-xs sm:text-sm placeholder:text-slate-500 outline-none transition-colors focus:ring-1 focus:ring-blue-500"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Số Điện Thoại <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-white text-xs sm:text-sm placeholder:text-slate-500 outline-none transition-colors focus:ring-1 focus:ring-blue-500"
                        placeholder="0912 345 678"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Địa Chỉ Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-white text-xs sm:text-sm placeholder:text-slate-500 outline-none transition-colors focus:ring-1 focus:ring-blue-500"
                        placeholder="khachhang@vexe.vn"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Mã Vé / Mã Đơn (Nếu có)
                      </label>
                      <input
                        type="text"
                        value={formData.bookingCode}
                        onChange={(e) => setFormData({ ...formData, bookingCode: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-white text-xs sm:text-sm placeholder:text-slate-500 outline-none transition-colors focus:ring-1 focus:ring-blue-500 font-mono"
                        placeholder="Ví dụ: BKG-883921"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Vấn Đề Cần Hỗ Trợ
                    </label>
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-white text-xs sm:text-sm outline-none transition-colors cursor-pointer focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="SUPPORT">Hỗ trợ thông tin chuyến xe & điểm đón</option>
                      <option value="CANCEL">Yêu cầu hoàn vé / Đổi lịch trình</option>
                      <option value="PAYMENT">Sự cố thanh toán / Xác nhận vé</option>
                      <option value="COMPLAINT">Khiếu nại chất lượng phục vụ của nhà xe</option>
                      <option value="PARTNER">Liên hệ hợp tác mở bán vé</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Nội Dung Chi Tiết <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-500 text-white text-xs sm:text-sm placeholder:text-slate-500 outline-none transition-colors resize-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <span>Đang gửi thông tin...</span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Gửi Yêu Cầu Hỗ Trợ Ngay</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Recommended Trips Shelf */}
      <PublicAiTripShelf
        title="Các Chuyến Xe Hỗ Trợ Đón Trả Tận Nơi"
        subtitle="Hệ thống tổng hợp các tuyến xe có dịch vụ xe trung chuyển miễn phí và tổng đài viên hỗ trợ trực tiếp tại bến."
        badgeLabel="HỖ TRỢ 24/7"
        pageContext="CONTACT"
        className="border-t border-slate-800"
      />

    </div>
  );
};
