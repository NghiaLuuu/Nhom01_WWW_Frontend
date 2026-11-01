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
  useDocumentTitle("Thành tích & Đối tác uy tín | VEXE AI");

  const metrics = [
    { label: "Vé Điện Tử Đã Phục Vụ", value: "1.500.000+", note: "Tăng trưởng 180% năm 2025", color: "from-cyan-400 to-blue-500", icon: Trophy },
    { label: "Hãng Xe Đối Tác Liên Kết", value: "120+", note: "Các nhà xe hàng đầu toàn quốc", color: "from-blue-400 to-indigo-500", icon: ShieldCheck },
    { label: "Tuyến Đường Vận Tải Phủ Khắp", value: "550+", note: "Kết nối trọn vẹn 63 tỉnh thành", color: "from-indigo-400 to-purple-500", icon: RouteIcon },
    { label: "Tỷ Lệ Hành Khách Hài Lòng", value: "99.4%", note: "4.9/5 sao từ hơn 500.000 đánh giá", color: "from-emerald-400 to-teal-500", icon: Users },
  ];

  const awards = [
    {
      year: "2025",
      title: "Giải Thưởng Sao Khuê 2025",
      org: "Hiệp hội Phần mềm và Dịch vụ CNTT Việt Nam (VINASA)",
      desc: "Vinh danh hạng mục 'Nền tảng số & Giải pháp Công nghệ Giao thông Vận tải Xuất sắc Nhất' nhờ ứng dụng AI Recommendation và kiến trúc khóa ghế phân tán thời gian thực.",
      badge: "Xuất Sắc Hạng Nhất",
      glow: "border-amber-500/40 bg-amber-950/20 shadow-amber-500/10 text-amber-300"
    },
    {
      year: "2025",
      title: "Vietnam Digital Awards (VDA 2025)",
      org: "Bộ Thông tin & Truyền thông phối hợp VDCA",
      desc: "Top 10 Sản phẩm - Dịch vụ số tiêu biểu vì cộng đồng: Tiên phong mô hình bán vé minh bạch, cam kết giữ chỗ 100% và chính sách đền bù 150% nếu nhà xe tự ý hủy chuyến.",
      badge: "Top 10 Chuyển Đổi Số",
      glow: "border-cyan-500/40 bg-cyan-950/20 shadow-cyan-500/10 text-cyan-300"
    },
    {
      year: "2024",
      title: "Thương Hiệu Vận Tải Được Yêu Thích",
      org: "Tạp chí Tiêu Dùng & Hội Bảo Vệ Người Tiêu Dùng Việt Nam",
      desc: "Bình chọn top thương hiệu công nghệ vận tải khách liên tỉnh tiện lợi nhất, thanh toán bảo mật chuẩn quốc tế và dịch vụ chăm sóc khách hàng 24/7 tận tâm.",
      badge: "Thương Hiệu Tin Dùng",
      glow: "border-blue-500/40 bg-blue-950/20 shadow-blue-500/10 text-blue-300"
    },
    {
      year: "2024",
      title: "Chứng Nhận Bảo Mật Quốc Tế PCI-DSS Level 1 & ISO 27001",
      org: "Tổ chức Đánh giá Bảo mật Quốc tế",
      desc: "Hệ thống máy chủ lưu trữ và cổng giao dịch đạt chứng nhận an toàn thông tin khắt khe nhất, bảo vệ 100% dữ liệu danh tính và giao dịch của hành khách.",
      badge: "An Ninh Chuẩn Quốc Tế",
      glow: "border-emerald-500/40 bg-emerald-950/20 shadow-emerald-500/10 text-emerald-300"
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
      quote: "VEXE khẳng định vị thế dẫn đầu khi trở thành nền tảng đầu tiên tại Việt Nam dám cam kết bồi thường gấp rưỡi nếu nhà xe tự ý hủy chuyến, thể hiện chữ TÍN tuyệt đối với khách hàng."
    }
  ];

  const customerReviews = [
    {
      name: "Hoàng Kim Oanh",
      role: "Khách hàng VIP • 7 chuyến Sài Gòn ⇌ Đà Lạt",
      rating: 5,
      content: "Mình đi công tác và du lịch Đà Lạt thường xuyên, cực kỳ thích tính năng gợi ý xe Limousine của VEXE. Vé điện tử có mã QR quét lên xe ngay trong 3 giây, cabin sạch đẹp và luôn đúng số ghế đã chọn.",
      badge: "Hội Đam Mê Đà Lạt Limousine"
    },
    {
      name: "Trần Minh Tuấn",
      role: "Kỹ sư dự án • Tuyến TP.HCM ⇌ Phú Yên",
      rating: 5,
      content: "Tính năng gợi ý tuyến quen thuộc khứ hồi giúp mình đặt vé về quê Phú Yên mỗi tuần chỉ mất đúng 30 giây. Bác tài gọi điện xác nhận đón trước nửa tiếng, trung chuyển đưa tận cổng nhà.",
      badge: "Hội Khứ Hồi Thường Lệ"
    },
    {
      name: "Lê Thu Hương",
      role: "Sinh viên Đại học Ngoại Thương • Hà Nội",
      rating: 5,
      content: "Lần đầu đặt xe mình được tặng ngay voucher khách mới BANMOI25 giảm 25%. Hướng dẫn chọn ghế khoang giữa chống say xe cực kỳ chuẩn xác, xe chạy êm ru suốt chuyến đi.",
      badge: "Khách Hàng Mới 5 Sao"
    }
  ];

  return (
    <div className="w-full bg-slate-950 text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. HERO HEADER: DẤU ẤN THƯƠNG HIỆU                                       */}
      {/* ========================================================================= */}
      <section className="relative pt-24 pb-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div aria-hidden="true" className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-r from-amber-500/15 via-cyan-500/15 to-indigo-500/15 blur-3xl opacity-40 pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xl shadow-lg shadow-amber-950/50">
            <Trophy size={14} className="text-amber-400" />
            <span>Dấu Ấn Khẳng Định Chất Lượng & Uy Tín Quốc Gia</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Thành Tựu Xuất Sắc &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-400 to-indigo-400">
              Sự Công Nhận
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light max-w-3xl mx-auto">
            Không chỉ là những con số tăng trưởng vượt bậc, mỗi danh hiệu và giải thưởng danh giá là lời khẳng định cho sự tin tưởng tuyệt đối của hơn 1,5 triệu khách hàng và hơn 120 đối tác nhà xe đồng hành cùng VEXE.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. METRICS COUNTERS RIBBON                                                */}
      {/* ========================================================================= */}
      <section className="py-10 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 hover:border-white/25 transition-all duration-300 shadow-2xl group overflow-hidden flex flex-col justify-between"
              >
                <div aria-hidden="true" className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-colors pointer-events-none" />
                
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-cyan-400" />
                  </div>
                  <div className={`text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${item.color} tracking-tight font-mono`}>
                    {item.value}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5">
                  <div className="text-white font-bold text-sm">{item.label}</div>
                  <div className="text-slate-400 text-xs mt-0.5 font-light">{item.note}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURED TROPHY SPOTLIGHT: SAO KHUÊ 2025 (WITH GENERATED PHOTO)        */}
      {/* ========================================================================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-cyan-950/40 border border-amber-500/40 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          <div aria-hidden="true" className="absolute -top-16 -right-16 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
            
            {/* Real Trophy Image Showcase */}
            <div className="w-full lg:w-5/12 shrink-0">
              <div className="relative rounded-2xl overflow-hidden border border-amber-400/40 shadow-2xl shadow-amber-950/60 aspect-[4/3] group">
                <img 
                  src="/images/achievements-award-trophy.jpg" 
                  alt="Cúp danh dự Giải thưởng Sao Khuê 2025 VEXE" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-amber-400/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Medal size={16} className="text-amber-400" />
                    <span className="text-xs font-bold text-white">Cúp Vàng Sao Khuê 2025</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-400/20">Hạng Nhất</span>
                </div>
              </div>
            </div>

            {/* Award Content */}
            <div className="w-full lg:w-7/12 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase font-mono">
                <Sparkles size={13} className="text-amber-400 animate-spin" />
                <span>VINASA & BỘ THÔNG TIN VÀ TRUYỀN THÔNG VINH DANH</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Giải Thưởng Sao Khuê 2025: Nền Tảng Số Xuất Sắc Hạng Nhất
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed font-light">
                VEXE vinh dự được Hội đồng Giám khảo Quốc gia VINASA trao tặng danh hiệu cao quý nhất ngành công nghệ thông tin Việt Nam, ghi nhận bước đột phá ứng dụng <strong>Real-time Seat Concurrency Locking</strong> và thuật toán <strong>AI Vector Recommendation</strong> giúp hàng triệu hành khách đặt vé thông minh, minh bạch và an toàn tuyệt đối.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>98/100 Điểm thẩm định công nghệ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>100% Khách hàng đánh giá minh bạch</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Thời gian xử lý giao dịch &lt; 2 giây</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Cam kết bồi thường 150% tiên phong</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HONORS & CERTIFICATIONS GRID                                          */}
      {/* ========================================================================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">Bảo Chứng Uy Tín</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Các Giải Thưởng & Chứng Nhận Quốc Gia</h2>
          <p className="text-slate-400 text-xs sm:text-sm font-light">Được kiểm định độc lập và trao tặng bởi các cơ quan chuyên môn uy tín hàng đầu.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {awards.map((award, idx) => (
            <div 
              key={idx}
              className={`p-7 rounded-3xl border backdrop-blur-xl transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4 ${award.glow}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white font-mono font-bold text-xs">
                    {award.year}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-white/10 text-white font-semibold border border-white/10">
                    {award.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1.5">{award.title}</h3>
                <div className="text-xs text-slate-400 font-medium mb-3">{award.org}</div>
                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">{award.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. STRATEGIC BUS OPERATOR PARTNERS                                       */}
      {/* ========================================================================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Mạng Lưới Vận Tải</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Đối Tác Nhà Xe Chiến Lược</h2>
          <p className="text-slate-400 text-xs sm:text-sm font-light">Đồng hành cùng hơn 120 thương hiệu nhà xe tên tuổi phục vụ hàng triệu chuyến đi an toàn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {partners.map((partner, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {partner.tag}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{partner.vehicles}</span>
                </div>
                <h3 className="font-bold text-white text-base">{partner.name}</h3>
                <p className="text-xs text-slate-400 font-light mt-1">{partner.type}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-cyan-400">
                <span>100% Vé điện tử QR</span>
                <CheckCircle2 size={14} className="text-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FINANCIAL & TECH PARTNERS                                              */}
      {/* ========================================================================= */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Hệ Thống Thanh Toán Bảo Mật</span>
          <h3 className="text-2xl font-bold text-white">Đối Tác Tài Chính & Cổng Thanh Toán Chuẩn Quốc Tế</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {paymentPartners.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center space-y-1">
              <CreditCard size={18} className="text-cyan-400 mx-auto mb-1" />
              <div className="font-bold text-white text-xs">{item.name}</div>
              <div className="text-[10px] text-slate-400 font-light">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. VERIFIED CUSTOMER REVIEWS                                              */}
      {/* ========================================================================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">Đánh Giá Xác Thực</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Hành Khách Thân Thiết Nói Về VEXE</h2>
          <p className="text-slate-400 text-xs sm:text-sm font-light">Niềm tin và sự an tâm của khách hàng là thước đo giá trị lớn nhất của chúng tôi.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customerReviews.map((rev, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    {rev.badge}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed italic">
                  "{rev.content}"
                </p>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="font-bold text-white text-sm">{rev.name}</div>
                <div className="text-[11px] text-slate-400">{rev.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. PRESS COVERAGE                                                         */}
      {/* ========================================================================= */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Báo Chí Truyền Thông</span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Báo Chí Nói Về Đổi Mới Của VEXE</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pressArticles.map((art, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Newspaper size={15} />
                <span>{art.source}</span>
              </div>
              <h4 className="font-bold text-white text-sm leading-snug">{art.title}</h4>
              <p className="text-xs text-slate-400 font-light leading-relaxed">"{art.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8.5. AI RECOMMENDATIONS: CHUYẾN XE ĐỐI TÁC TIÊU BIỂU VEXE AI ĐỀ XUẤT     */}
      {/* ========================================================================= */}
      <PublicAiTripShelf
        title="Chuyến Xe Đối Tác Tiêu Biểu VEXE AI Đề Xuất"
        subtitle="Trải nghiệm các tuyến xe Limousine VIP từ các đối tác vận tải hàng đầu (Phương Trang, Sao Việt, Thành Bưởi) đạt giải thưởng Sao Khuê 2025."
        badgeLabel="✨ VEXE AI ĐỀ XUẤT ĐỐI TÁC 5 SAO"
        pageContext="ACHIEVEMENTS"
        className="border-t border-white/10"
      />

      {/* ========================================================================= */}
      {/* 9. CALL TO ACTION                                                         */}
      {/* ========================================================================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="relative rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-blue-950/70 border border-cyan-500/40 p-10 md:p-14 text-center overflow-hidden shadow-2xl">
          <div aria-hidden="true" className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Đồng Hành Cùng Nền Tảng Đặt Vé Số 1 Việt Nam
            </h2>
            <p className="text-slate-300 text-sm font-light">
              Trải nghiệm chuẩn mực phục vụ 5 sao, giữ chỗ 100% và nhận ngay ưu đãi 25% cho chuyến đi đầu tiên.
            </p>
            <div className="pt-2">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/30 active:scale-95"
              >
                <span>Tra Cứu Chuyến Xe Ngay</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
