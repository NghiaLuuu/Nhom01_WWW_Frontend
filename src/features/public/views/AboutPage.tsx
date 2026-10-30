import React from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Bus, Cpu, ShieldCheck, HeartHandshake, Zap, Compass, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  useDocumentTitle("Giới thiệu & Sứ mệnh | VEXE");

  return (
    <div className="w-full bg-slate-950 text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-500/10 blur-[140px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Compass size={14} className="text-cyan-400" />
            <span>Tiên phong đổi mới giao thông vận tải</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Cách Mạng Hóa Trải Nghiệm{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Xe Khách Liên Tỉnh
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light">
            VEXE được sinh ra để chấm dứt kỷ nguyên xếp hàng mua vé giấy, chen lấn bến xe và nỗi lo bị hét giá. Chúng tôi ứng dụng Trí tuệ nhân tạo (AI & pgvector) để mỗi hành trình của bạn đều an tâm, trọn vẹn và thông minh.
          </p>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="relative group p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6">
              <Cpu className="text-cyan-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Tầm Nhìn Công Nghệ Số</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Tích hợp cơ sở dữ liệu vector pgvector và mô hình ngôn ngữ lớn (LLM), giúp trợ lý AI tự động đề xuất lộ trình, tìm kiếm bằng ngữ nghĩa tự nhiên thay vì lọc thủ công khô khan.
            </p>
          </div>

          <div className="relative group p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-blue-500/40 transition-all duration-300 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-6">
              <ShieldCheck className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Minh Bạch & Cam Kết 100%</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Cam kết "3 Không": Không tăng giá bất thường dịp lễ, Không bán trùng ghế, Không bỏ rơi khách. Đảm bảo bồi thường 150% nếu nhà xe không cung cấp đúng chuyến xe đã đặt.
            </p>
          </div>

          <div className="relative group p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-indigo-500/40 transition-all duration-300 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6">
              <HeartHandshake className="text-indigo-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Kết Nối 100+ Đối Tác Uy Tín</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Hợp tác chặt chẽ cùng các hãng xe đầu ngành: Phương Trang, Thành Bưởi, Hoa Mai, Sao Việt... mang lại mạng lưới bao phủ hơn 500+ tuyến đường kết nối 63 tỉnh thành.
            </p>
          </div>

        </div>
      </section>

      {/* Brand Journey Timeline */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-5xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">Cột Mốc Phát Triển</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">Hành Trình Kiến Tạo VEXE</h2>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:left-8 before:md:left-1/2 before:w-0.5 before:bg-white/10">
          
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 group">
            <div className="md:w-1/2 md:text-right pr-0 md:pr-12 pl-16 md:pl-0">
              <span className="text-cyan-400 text-xs font-mono font-bold">Tháng 03 / 2024</span>
              <h4 className="text-lg font-bold text-white mt-1">Khởi nguồn ý tưởng</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">Đội ngũ kỹ sư IUH nghiên cứu mô hình số hóa bán vé xe khách thông minh, hướng tới chuẩn e-ticket thời gian thực.</p>
            </div>
            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-950 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] z-10" />
            <div className="md:w-1/2 pl-16 md:pl-12" />
          </div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 group">
            <div className="md:w-1/2 pr-0 md:pr-12" />
            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-950 border-2 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)] z-10" />
            <div className="md:w-1/2 pl-16 md:pl-12">
              <span className="text-blue-400 text-xs font-mono font-bold">Tháng 12 / 2025</span>
              <h4 className="text-lg font-bold text-white mt-1">Cột mốc 1.000.000 vé xuất xưởng</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">Hệ thống mở rộng kết nối hơn 80 hãng xe lớn, tích hợp cổng thanh toán bảo mật VNPAY, MoMo, ZaloPay.</p>
            </div>
          </div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8 group">
            <div className="md:w-1/2 md:text-right pr-0 md:pr-12 pl-16 md:pl-0">
              <span className="text-indigo-400 text-xs font-mono font-bold">Năm 2026</span>
              <h4 className="text-lg font-bold text-white mt-1">Nâng cấp Spring AI & pgvector</h4>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">Tiên phong triển khai cơ chế tìm kiếm vector ngữ nghĩa và Trợ lý AI tư vấn lịch trình chuẩn xác theo Chapter 7 Spring AI.</p>
            </div>
            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-950 border-2 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)] z-10" />
            <div className="md:w-1/2 pl-16 md:pl-12" />
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/60 border border-white/15 p-10 md:p-14 text-center overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Sẵn sàng cho chuyến đi tiếp theo của bạn?</h2>
            <p className="text-slate-300 text-sm">Hàng trăm chuyến xe chất lượng cao đang sẵn sàng phục vụ bạn với mức giá ưu đãi nhất.</p>
            <div className="pt-2">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20"
              >
                <span>Tìm Chuyến Xe Ngay</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
