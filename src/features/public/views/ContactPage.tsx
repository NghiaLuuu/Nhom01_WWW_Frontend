import React, { useState } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
    }, 1000);
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
    <div className="w-full bg-slate-950 text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* Hero Header */}
      <section className="relative pt-24 pb-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-emerald-500/10 blur-[150px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Clock size={14} className="text-cyan-400" />
            <span>Tổng Đài Trực Tuyến 24/7/365</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Liên Hệ &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Hỗ Trợ Khách Hàng
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light">
            Mọi sự cố về vé, thay đổi lịch trình hoặc khiếu nại chất lượng dịch vụ xe, chúng tôi cam kết phản hồi ngay trong vòng 5 phút đối với các chuyến xe sắp khởi hành.
          </p>
        </div>
      </section>

      {/* Main Container: Flex for Form & Contact Info */}
      <section className="py-12 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Left Column: Contact Cards */}
          <div className="w-full lg:w-[440px] shrink-0 space-y-6">
            <div className="p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Phone className="text-cyan-400" size={20} />
                <span>Kênh Liên Lạc Trực Tiếp</span>
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tổng đài đặt vé & CSKH</div>
                  <div className="text-2xl font-black text-cyan-400 tracking-wider mt-1">1900 6868</div>
                  <div className="text-xs text-slate-400 mt-1 font-light">1.000đ/phút • Hoạt động xuyên suốt 24/7 cả ngày Lễ/Tết</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Đường dây nóng khẩn cấp & Zalo</div>
                  <div className="text-xl font-bold text-blue-400 mt-1">0988 888 888</div>
                  <div className="text-xs text-slate-400 mt-1 font-light">Dành riêng xử lý sự cố lỡ chuyến hoặc hủy chuyến đột xuất</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Hộp thư hỗ trợ điện tử</div>
                  <div className="text-base font-bold text-white mt-1">hotro@vexe.vn</div>
                  <div className="text-xs text-slate-400 mt-1 font-light">Phản hồi văn bản & hóa đơn VAT trong vòng 2 giờ làm việc</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
                <AlertCircle className="text-cyan-400 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-slate-300 leading-relaxed font-light">
                  <strong className="text-cyan-300 font-semibold">Cam kết bảo vệ quyền lợi:</strong> Khiếu nại thái độ tài xế, trễ giờ quá 30 phút hoặc tự ý dời chỗ ngồi sẽ được VEXE xác minh và bồi hoàn thỏa đáng theo chính sách Hoàn 150%.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="flex-1 min-w-0 w-full">
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Gửi Tin Nhắn / Yêu Cầu Hỗ Trợ</h2>
              <p className="text-slate-400 text-sm mb-6 font-light">
                Điền thông tin bên dưới, nhân viên hỗ trợ sẽ liên hệ lại qua điện thoại hoặc email ngay khi nhận được.
              </p>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-white">Yêu Cầu Đã Được Tiếp Nhận!</h4>
                  <p className="text-slate-300 text-sm max-w-md mx-auto font-light">
                    Mã hỗ trợ của bạn: <span className="font-mono font-bold text-emerald-400">#TK-{Math.floor(100000 + Math.random() * 900000)}</span>. Chúng tôi sẽ liên lạc lại trong thời gian sớm nhất.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ fullName: '', phone: '', email: '', topic: 'SUPPORT', bookingCode: '', message: '' });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Họ và tên *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 focus:border-cyan-500 text-white text-sm focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Số điện thoại *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0912 345 678"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 focus:border-cyan-500 text-white text-sm focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Địa chỉ Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 focus:border-cyan-500 text-white text-sm focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mã đơn vé (nếu có)</label>
                      <input
                        type="text"
                        value={formData.bookingCode}
                        onChange={(e) => setFormData({ ...formData, bookingCode: e.target.value })}
                        placeholder="VD: VX-892120"
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 focus:border-cyan-500 text-white text-sm focus:outline-none font-mono transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Chủ đề hỗ trợ</label>
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 focus:border-cyan-500 text-white text-sm focus:outline-none transition-colors"
                    >
                      <option value="SUPPORT">Tư vấn đặt vé & đổi chuyến</option>
                      <option value="REFUND">Yêu cầu hủy vé & hoàn tiền 150%</option>
                      <option value="COMPLAINT">Khiếu nại thái độ hoặc chất lượng xe</option>
                      <option value="PARTNER">Hợp tác mở bán vé xe nhà xe</option>
                      <option value="TECHNICAL">Báo cáo sự cố thanh toán / kỹ thuật</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nội dung chi tiết *</label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Mô tả cụ thể thông tin bạn cần giải quyết để chúng tôi hỗ trợ nhanh nhất..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-white/10 focus:border-cyan-500 text-white text-sm focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

      {/* Office Locations */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">Văn Phòng Đại Diện</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">Hệ Thống Trụ Sở Toàn Quốc</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offices.map((off, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-base min-h-[32px]">
                  <Building2 className="text-cyan-400 shrink-0" size={20} />
                  <span>{off.city}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-300 font-light min-h-[48px]">
                  <MapPin className="text-slate-400 shrink-0 mt-0.5" size={15} />
                  <span className="leading-relaxed">{off.address}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-400">
                <div>Điện thoại: <span className="text-white font-medium">{off.hotline}</span></div>
                <div>Email: <span className="text-white font-medium">{off.email}</span></div>
                <div>Giờ tiếp nhận: <span className="text-cyan-400 font-mono">{off.hours}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Major Bus Terminals */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Bến Xe Đầu Mối</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">Điểm Đón / Trả Khách Trọng Điểm</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {majorStations.map((station, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 hover:border-blue-500/30 transition-colors"
            >
              <div>
                <h5 className="text-white font-bold text-sm">{station.name}</h5>
                <p className="text-slate-400 text-xs mt-0.5 font-light">{station.address}</p>
              </div>
              <span className="text-[11px] font-mono font-medium text-cyan-300 px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/20 shrink-0">
                {station.city}
              </span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
