import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Phone, Mail, MapPin, ShieldCheck, CheckCircle2, Award, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-slate-800">
          <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-800/60 border border-slate-750">
            <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-blue-400" size={22} />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold leading-snug">Cam kết giữ chỗ 100%</h4>
              <p className="text-xs text-slate-400 mt-1">Hoàn tiền 150% nếu nhà xe không cung cấp đúng chuyến</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-800/60 border border-slate-750">
            <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="text-emerald-400" size={22} />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold leading-snug">Giá vé minh bạch</h4>
              <p className="text-xs text-slate-400 mt-1">Không tăng giá vô cớ, không phụ phí ẩn, rõ ràng từng chặng</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-800/60 border border-slate-750">
            <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Award className="text-amber-400" size={22} />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold leading-snug">100+ Nhà xe tuyển chọn</h4>
              <p className="text-xs text-slate-400 mt-1">Phương Trang, Thành Bưởi, Hoa Mai, Sao Việt, Toàn Thắng</p>
            </div>
          </div>
        </div>

        {/* Main 4-Column Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: About VEXE */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Bus size={20} />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">VEXE</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Hệ thống công nghệ đặt vé xe khách liên tỉnh trực tuyến, kết nối trực tiếp các nhà xe chất lượng cao trên toàn quốc với lịch trình chính xác và chăm sóc khách hàng tận tâm.
            </p>
            <div className="pt-1">
              <span className="inline-block px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] text-slate-300 font-mono">
                Giấy phép Vận tải: 01/2026/GPOV-SGTVT
              </span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2.5">
              Về Chúng Tôi
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Giới thiệu thương hiệu
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="hover:text-white transition-colors">
                  Thành tích & Đối tác chiến lược
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  Mạng lưới các tuyến xe phổ biến
                </Link>
              </li>
              <li>
                <Link to="/login/admin" className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>Cổng Quản trị & Nhân viên</span>
                  <ExternalLink size={11} />
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
                <Link to="/faq" className="hover:text-white transition-colors">
                  Hướng dẫn đặt vé trực tuyến
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Chính sách đổi trả & Hoàn tiền vé
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Quy định hành lý & Vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Mạng lưới trạm đón & Bến xe trung chuyển
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Channels */}
          <div>
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2.5">
              Tổng Đài Điều Hành
            </h3>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start space-x-2.5">
                <MapPin size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <span>12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone size={16} className="text-blue-400 shrink-0" />
                <span className="text-white font-bold text-sm">1900 1234 (Hỗ trợ 24/7)</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail size={16} className="text-blue-400 shrink-0" />
                <span>support@vexe.vn</span>
              </li>
            </ul>

            {/* Payment Partners Icons */}
            <div className="pt-4 mt-4 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-2 font-semibold">Đối tác thanh toán</span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-300">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">VNPAY</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">MoMo</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">ZaloPay</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px]">Visa / MasterCard</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
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
