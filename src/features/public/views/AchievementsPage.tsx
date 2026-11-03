import React from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { 
  Trophy, 
  Award, 
  Star, 
  Users, 
  Route as RouteIcon, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Medal,
  Building2,
  Newspaper,
  CreditCard,
  FileCheck2,
  TrendingUp,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicAiTripShelf } from '../../booking/components/PublicAiTripShelf';

export const AchievementsPage: React.FC = () => {
  useDocumentTitle("Thành tích & Đối tác uy tín | VEXE");

  const metrics = [
    { label: "Vé Điện Tử Đã Phục Vụ", value: "1.500.000+", note: "Tăng trưởng 180% năm 2025", icon: Trophy },
    { label: "Hãng Xe Đối Tác Liên Kết", value: "120+", note: "Các nhà xe hàng đầu toàn quốc", icon: ShieldCheck },
    { label: "Tuyến Đường Vận Tải Phủ Khắp", value: "550+", note: "Kết nối trọn vẹn 63 tỉnh thành", icon: RouteIcon },
    { label: "Tỷ Lệ Hành Khách Hài Lòng", value: "99.4%", note: "4.9/5 sao từ hơn 500.000 đánh giá", icon: Users },
  ];

  const awards = [
    {
      year: "2025",
      title: "Giải Thưởng Sao Khuê 2025",
      org: "Hiệp hội Phần mềm và Dịch vụ CNTT Việt Nam (VINASA)",
      desc: "Vinh danh hạng mục 'Nền tảng số & Giải pháp Công nghệ Giao thông Vận tải Xuất sắc Nhất' nhờ ứng dụng AI Recommendation và kiến trúc khóa ghế phân tán thời gian thực.",
      badge: "Xuất Sắc Hạng Nhất"
    },
    {
      year: "2025",
      title: "Vietnam Digital Awards (VDA 2025)",
      org: "Bộ Thông tin & Truyền thông phối hợp VDCA",
      desc: "Top 10 Sản phẩm - Dịch vụ số tiêu biểu vì cộng đồng: Tiên phong mô hình bán vé minh bạch, cam kết giữ chỗ 100% và chính sách đền bù 150% nếu nhà xe tự ý hủy chuyến.",
      badge: "Top 10 Chuyển Đổi Số"
    },
    {
      year: "2024",
      title: "Thương Hiệu Vận Tải Được Yêu Thích",
      org: "Tạp chí Tiêu Dùng & Hội Bảo Vệ Người Tiêu Dùng Việt Nam",
      desc: "Bình chọn top thương hiệu công nghệ vận tải khách liên tỉnh tiện lợi nhất, thanh toán bảo mật chuẩn quốc tế và dịch vụ chăm sóc khách hàng 24/7 tận tâm.",
      badge: "Thương Hiệu Tin Dùng"
    },
    {
      year: "2024",
      title: "Chứng Nhận Bảo Mật Quốc Tế PCI-DSS & ISO 27001",
      org: "Tổ chức Đánh giá Bảo mật Quốc tế",
      desc: "Hệ thống máy chủ lưu trữ và cổng giao dịch đạt chứng nhận an toàn thông tin khắt khe nhất, bảo vệ 100% dữ liệu danh tính và giao dịch của hành khách.",
      badge: "An Ninh Chuẩn Quốc Tế"
    }
  ];

  const partners = [
    { name: "Phương Trang FUTA Bus Lines", type: "Tuyến Bắc - Nam, Miền Tây, Tây Nguyên", vehicles: "1.200+ Xe", tag: "Đối Tác Chiến Lược" },
    { name: "Thành Bưởi Limousine", type: "Chuyên tuyến Sài Gòn - Đà Lạt - Cần Thơ", vehicles: "350+ Xe", tag: "Limousine VIP" },
    { name: "Hoa Mai VIP Vũng Tàu", type: "Chuyên tuyến VIP Sài Gòn - Vũng Tàu - Bà Rịa", vehicles: "200+ Xe", tag: "Tuyến Hot Miền Nam" },
    { name: "Sao Việt Express", type: "Chuyên tuyến Hà Nội - Lào Cai - Sa Pa", vehicles: "180+ Xe", tag: "Cao Tốc Phía Bắc" },
    { name: "Kumho Samco Buslines", type: "Tuyến Đông Nam Bộ & Quốc tế Campuchia", vehicles: "250+ Xe", tag: "Quốc Tế & Liên Tỉnh" },
    { name: "Camel Travel VIP", type: "Hà Nội - Huế - Đà Nẵng - Hội An", vehicles: "150+ Xe", tag: "Du Lịch Miền Trung" },
  ];

  const paymentPartners = [
    { name: "VietQR 24/7", desc: "Xác nhận tự động trong 2 giây" },
    { name: "Cổng VNPAY", desc: "Thanh toán qua 40+ app ngân hàng" },
    { name: "Ví MoMo", desc: "Xác nhận 1 chạm tiện lợi" },
    { name: "ZaloPay", desc: "Tích hợp ví thanh toán nhanh" },
    { name: "Visa / Mastercard", desc: "Bảo mật 3D-Secure 2.0 toàn cầu" },
    { name: "Vietcombank & BIDV", desc: "Liên kết tài khoản trực tiếp" }
  ];

  const pressArticles = [
    {
      source: "Báo Tuổi Trẻ",
      title: "VEXE: Đột phá số hóa vé xe khách giải quyết dứt điểm nỗi lo ngày Tết",
      quote: "Hệ thống khóa ghế vi mô thời gian thực của VEXE đã giúp hàng trăm nghìn người lao động và sinh viên mua được vé xe đúng giá, đúng chỗ ngồi mà không cần phải chen lấn từ mờ sáng tại các bến xe."
    },
    {
      source: "VnExpress",
      title: "Ứng dụng AI phân tích hành vi giúp cá nhân hóa hành trình xe khách liên tỉnh",
      quote: "Không chỉ dừng lại ở việc tra cứu thông thường, VEXE tiên phong ứng dụng công nghệ đề xuất thông minh theo cụm thói quen và vị trí địa lý, nâng tầm trải nghiệm của hành khách tương tự các hãng bay lớn."
    },
    {
      source: "Báo Dân Trí",
      title: "Chính sách cam kết bồi thường 150% - Chuẩn mực bảo vệ người tiêu dùng mới",
      quote: "Chính sách đền bù 150% của VEXE đã tạo nên cuộc cách mạng về độ uy tín trong ngành vận tải hành khách liên tỉnh, thúc đẩy các nhà xe nâng cao tính kỷ luật và văn hóa phục vụ người dân."
    }
  ];

  return (
    <div className="w-full bg-[#0b1120] text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* 1. HERO HEADER */}
      <section className="relative pt-20 pb-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Trophy size={14} className="text-amber-400" />
            <span>Thành Tựu Đột Phá • Khẳng Định Vị Thế Dẫn Đầu</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Minh Chứng Chất Lượng &{' '}
            <span className="text-blue-400">
              Đối Tác Chiến Lược
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto font-normal">
            Những giải thưởng công nghệ danh giá, mạng lưới hơn 120+ hãng xe đối tác chất lượng cao và sự tin chọn của hơn 1,5 triệu hành khách là bảo chứng rõ nét nhất cho sứ mệnh phụng sự tận tâm của VEXE.
          </p>

          {/* Key Metrics */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-cyan-400">
                    <Icon size={20} />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">{m.value}</div>
                  <div className="text-xs font-semibold text-slate-200 mt-1">{m.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{m.note}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. PRESTIGIOUS AWARDS */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Vinh Danh & Giải Thưởng</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Giải Thưởng Quốc Gia & Quốc Tế</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Ghi nhận cho nỗ lực đổi mới sáng tạo và chuyển đổi số giao thông vận tải.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {awards.map((award, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 border border-slate-700 text-cyan-400">
                      NĂM {award.year}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                      {award.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{award.title}</h3>
                  <p className="text-xs text-slate-400">{award.org}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                  <Medal size={20} />
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-700">
                {award.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. BUS FLEET PARTNERS */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Mạng Lưới Vận Tải</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Đối Tác Hãng Xe Tiêu Biểu</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Hợp tác chặt chẽ cùng các đơn vị vận tải hành khách hàng đầu cả nước.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {partners.map((p, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/25">
                  {p.tag}
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-400">{p.vehicles}</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{p.type}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PAYMENT PARTNERS */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Thanh Toán An Toàn</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Đối Tác Cổng Thanh Toán Chuẩn PCI-DSS</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Giao dịch tức thì, bảo mật tuyệt đối với chứng nhận an ninh quốc tế.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {paymentPartners.map((pay, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-center space-y-1.5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center mx-auto">
                <CreditCard size={16} />
              </div>
              <div className="text-xs font-bold text-white">{pay.name}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{pay.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PRESS ARTICLES */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Báo Chí Nói Về VEXE</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Tiếng Nói Từ Truyền Thông Uy Tín</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Các cơ quan báo chí chính thống đánh giá cao giải pháp chuyển đổi số của VEXE.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pressArticles.map((article, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                  <Newspaper size={14} />
                  <span>{article.source}</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{article.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{article.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. AI RECOMMENDATIONS SHELF */}
      <PublicAiTripShelf
        title="Chuyến Xe 5 Sao Từ Các Hãng Xe Đạt Giải Thưởng"
        subtitle="Hệ thống đề xuất các tuyến xe Limousine VIP xuất sắc nhất từ các đơn vị đối tác uy tín đạt chuẩn phục vụ."
        badgeLabel="ĐỐI TÁC 5 SAO"
        pageContext="ACHIEVEMENTS"
        className="border-t border-slate-800"
      />

    </div>
  );
};
