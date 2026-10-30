import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Phone, Mail, MapPin, ShieldCheck, CheckCircle2, Award, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-white/10 pt-16 pb-10 relative overflow-hidden font-sans">
      {/* Subtle Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-32 bg-blue-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Trust Badges Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-white/10">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-cyan-400" size={24} />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Cam kết Giữ Chỗ 100%</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hoàn tiền 150% nếu nhà xe không cung cấp đúng chuyến</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="text-emerald-400" size={24} />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Giá Vé Minh Bạch 3 Không</h4>
              <p className="text-xs text-slate-400 mt-0.5">Không tăng giá vô cớ - Không phí ẩn - Không hủy chuyến</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Award className="text-purple-400" size={24} />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">100+ Nhà Xe Tuyển Chọn</h4>
              <p className="text-xs text-slate-400 mt-0.5">Phương Trang, Thành Bưởi, Hoa Mai, Sao Việt,...</p>
            </div>
          </div>
        </div>

        {/* Main 4-Column Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: About VEXE */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                <Bus className="text-white" size={18} />
              </div>
              <span className="text-2xl font-black text-white tracking-wider font-mono">VEXE</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 font-light">
              Hệ thống công nghệ đặt vé xe khách liên tỉnh tiên phong ứng dụng Trí tuệ nhân tạo (AI & pgvector) giúp tối ưu hóa lịch trình và trải nghiệm di chuyển của hơn 500.000+ hành khách.
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 font-mono">
                <span>Giấy phép Vận tải số: 01/2026/GPOV-SGTVT</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-cyan-400 pl-2.5">
              Về Chúng Tôi
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <span>Giới thiệu thương hiệu</span>
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                  <span>Thành tích & Đối tác chiến lược</span>
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-cyan-400 transition-colors">
                  <span>Mạng lưới các tuyến xe hot</span>
                </Link>
              </li>
              <li>
                <Link to="/login/admin" className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1">
                  <span>Cổng Nhân viên & Quản trị</span>
                  <ExternalLink size={10} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2.5">
              Hỗ Trợ & Chính Sách
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/faq" className="hover:text-cyan-400 transition-colors">
                  <span>Cẩm nang hướng dẫn đặt vé online</span>
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-cyan-400 transition-colors">
                  <span>Chính sách đổi trả & Hoàn tiền vé</span>
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-cyan-400 transition-colors">
                  <span>Quy định an toàn & Hành lý ký gửi</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-cyan-400 transition-colors">
                  <span>Mạng lưới trạm đón & Bến xe trung chuyển</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Channels */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-indigo-500 pl-2.5">
              Tổng Đài Điều Hành
            </h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start space-x-3">
                <MapPin size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                <span>Trụ sở chính: 12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-cyan-400 shrink-0" />
                <span className="text-white font-bold text-sm font-mono">1900 1234 (24/7)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-cyan-400 shrink-0" />
                <span>support@vexe.vn</span>
              </li>
            </ul>

            {/* Payment Partners Icons */}
            <div className="pt-4 mt-4 border-t border-white/5">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2 font-semibold">Đối tác thanh toán bảo mật</span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">VNPAY</span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">MoMo</span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">ZaloPay</span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px]">Visa/Master</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 VEXE Platform. Bản quyền thuộc về Nhóm 01 WWW - Đại học Công nghiệp TP.HCM (IUH).</p>
          <div className="flex space-x-6 text-slate-400">
            <Link to="/faq" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link>
            <Link to="/faq" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
