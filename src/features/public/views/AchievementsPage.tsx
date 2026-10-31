import React from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Trophy, Award, Star, Users, Route as RouteIcon, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AchievementsPage: React.FC = () => {
  useDocumentTitle("Thành tựu & Dấu ấn thương hiệu | VEXE");

  const metrics = [
    { label: "Vé điện tử xuất xưởng", value: "1.500.000+", note: "Tăng trưởng 180% năm 2025", color: "from-cyan-400 to-blue-500", icon: Trophy },
    { label: "Đối tác nhà xe liên kết", value: "120+", note: "Nhà xe thương hiệu hàng đầu", color: "from-blue-400 to-indigo-500", icon: ShieldCheck },
    { label: "Tuyến đường phủ khắp", value: "550+", note: "Kết nối 63 tỉnh thành", color: "from-indigo-400 to-purple-500", icon: RouteIcon },
    { label: "Khách hàng hài lòng", value: "99.2%", note: "4.9/5 sao từ 450.000 đánh giá", color: "from-emerald-400 to-teal-500", icon: Users },
  ];

  const awards = [
    {
      year: "2025",
      title: "Giải thưởng Sao Khuê 2025",
      org: "Hiệp hội Phần mềm và Dịch vụ CNTT Việt Nam (VINASA)",
      desc: "Vinh danh hạng mục 'Nền tảng số & Giải pháp Công nghệ Giao thông Vận tải Xuất sắc' ứng dụng AI định tuyến và pgvector thông minh.",
      badge: "Xuất Sắc Hạng Nhất",
      glow: "border-cyan-500/30 bg-cyan-950/20 shadow-cyan-500/10"
    },
    {
      year: "2025",
      title: "Vietnam Digital Awards (VDA 2025)",
      org: "Hội Truyền thông số Việt Nam (VDCA)",
      desc: "Top 10 Sản phẩm - Dịch vụ số tiêu biểu vì cộng đồng: Tiên phong mô hình bán vé thông minh minh bạch và cam kết hoàn 150%.",
      badge: "Top 10 Chuyển Đổi Số",
      glow: "border-blue-500/30 bg-blue-950/20 shadow-blue-500/10"
    },
    {
      year: "2024",
      title: "Thương Hiệu Vận Tải Được Yêu Thích",
      org: "Tạp chí Tiêu Dùng & Hội Tiêu Chuẩn Bảo Vệ Người Tiêu Dùng",
      desc: "Bình chọn top nền tảng dịch vụ vận tải khách liên tỉnh tiện lợi, bảo mật thanh toán cao và dịch vụ chăm sóc khách hàng 24/7.",
      badge: "Thương Hiệu Tin Dùng",
      glow: "border-indigo-500/30 bg-indigo-950/20 shadow-indigo-500/10"
    }
  ];

  const partners = [
    { name: "Phương Trang FUTA Bus Lines", type: "Tuyến Bắc - Nam, Miền Tây, Tây Nguyên", vehicles: "1.200+ Xe", logo: "FUTA" },
    { name: "Thành Bưởi Limousine", type: "Chuyên tuyến Sài Gòn - Đà Lạt - Cần Thơ", vehicles: "350+ Xe", logo: "TB" },
    { name: "Hoa Mai Vũng Tàu", type: "Chuyên tuyến VIP Sài Gòn - Vũng Tàu", vehicles: "200+ Xe", logo: "HM" },
    { name: "Sao Việt Express", type: "Chuyên tuyến Hà Nội - Lào Cai - Sa Pa", vehicles: "180+ Xe", logo: "SV" },
    { name: "Kumho Samco Buslines", type: "Tuyến Đông Nam Bộ & Quốc tế Campuchia", vehicles: "250+ Xe", logo: "KS" },
    { name: "Camel Travel VIP", type: "Hà Nội - Huế - Đà Nẵng - Hội An", vehicles: "120+ Xe", logo: "CT" },
  ];

  const customerReviews = [
    {
      name: "Nguyễn Hoàng Nam",
      role: "Kỹ sư phần mềm - TP. Hồ Chí Minh",
      rating: 5,
      content: "Đặt vé trên VEXE cực kỳ mượt mà. Vé điện tử có mã QR quét thẳng lúc lên xe, không cần ra phòng vé đổi phiếu. Giao diện trực quan xem được sơ đồ ghế chính xác từng vị trí.",
      route: "Sài Gòn → Đà Lạt (Limousine 34 phòng)"
    },
    {
      name: "Trần Minh Trang",
      role: "Chuyên viên truyền thông - Hà Nội",
      rating: 5,
      content: "Đợt Tết vừa rồi mình lo không có xe về quê, may nhờ tính năng AI gợi ý chuyến xe và thông báo khi có vé trống nên săn được vé giờ đẹp. Dịch vụ hỗ trợ trực tuyến 24/7 nhiệt tình.",
      route: "Hà Nội → Sa Pa (Cabin đôi VIP)"
    },
    {
      name: "Lê Đức Trọng",
      role: "Kinh doanh tự do - Đà Nẵng",
      rating: 5,
      content: "Chính sách cam kết 150% nếu nhà xe hủy chuyến làm mình rất an tâm. Xe đi đúng giờ, giá vé niêm yết rõ ràng không lo bị chém giá như đặt bên ngoài.",
      route: "Đà Nẵng → Nha Trang (Giường nằm 40 chỗ)"
    }
  ];

  return (
    <div className="w-full bg-slate-950 text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* Hero Header */}
      <section className="relative pt-24 pb-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-72 bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-indigo-500/10 blur-[150px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Trophy size={14} className="text-amber-400" />
            <span>Dấu Ấn Khẳng Định Đẳng Cấp & Uy Tín</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Thành Tựu &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-400 to-indigo-400">
              Sự Công Nhận
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light">
            Không chỉ là những con số tăng trưởng, mỗi giải thưởng và cột mốc là minh chứng cho nỗ lực không ngừng nghỉ nhằm mang đến dịch vụ đặt vé xe khách số 1 Việt Nam.
          </p>
        </div>
      </section>

      {/* Metrics Counters */}
      <section className="py-12 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl group overflow-hidden flex flex-col justify-between h-full min-h-[200px]"
              >
                <div aria-hidden="true" className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />
                <div className="flex-1">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-cyan-400" />
                  </div>
                  <div className={`text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${item.color} tracking-tight`}>
                    {item.value}
                  </div>
                </div>
                <div className="mt-auto pt-3 border-t border-white/5 shrink-0">
                  <div className="text-white font-semibold text-sm leading-tight h-10 flex items-center">{item.label}</div>
                  <div className="text-slate-400 text-xs mt-1 font-light">{item.note}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Industry Awards */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-amber-400 tracking-wider uppercase">Giải Thưởng Ngành</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Được Tôn Vinh Bởi Các Tổ Chức Uy Tín</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {awards.map((award, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-3xl border backdrop-blur-xl transition-all duration-300 shadow-2xl flex flex-col justify-between h-full ${award.glow}`}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                    {award.year}
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-white font-medium border border-white/10">
                    {award.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 leading-snug">{award.title}</h3>
                <div className="text-xs text-cyan-400 font-medium mb-4">{award.org}</div>
                <p className="text-slate-300 text-sm leading-relaxed font-light">{award.desc}</p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400 shrink-0 h-10">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="truncate">Đã kiểm định & chứng nhận chính thức</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Network Partners */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">Mạng Lưới Đối Tác</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Hơn 120+ Nhà Xe Đầu Ngành Đồng Hành</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-3">Cam kết dịch vụ chất lượng đồng nhất, hệ thống kiểm soát vé điện tử chuẩn quốc tế.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((p, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 transition-all duration-300 group flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center font-black text-cyan-300 text-sm tracking-wider shrink-0 group-hover:scale-105 transition-transform">
                {p.logo}
              </div>
              <div>
                <h4 className="text-white font-bold text-base group-hover:text-cyan-300 transition-colors">{p.name}</h4>
                <p className="text-slate-400 text-xs mt-1">{p.type}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300 font-mono">
                  <span>Quy mô:</span>
                  <span className="text-cyan-400 font-bold">{p.vehicles}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Trust Reviews */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Khách Hàng Nói Về VEXE</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Trải Nghiệm Thực Tế Từ Triệu Hành Trình</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {customerReviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/10 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 h-full"
            >
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic font-light">"{rev.content}"</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 shrink-0 min-h-[76px] flex flex-col justify-center">
                <div className="text-white font-bold text-sm">{rev.name}</div>
                <div className="text-slate-400 text-xs">{rev.role}</div>
                <div className="mt-1 text-[11px] text-cyan-400 font-medium leading-tight">Chuyến: {rev.route}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-cyan-900/30 via-slate-900/60 to-blue-900/30 border border-cyan-500/30 backdrop-blur-xl space-y-6 shadow-2xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Sẵn Sàng Cho Chuyến Đi An Toàn & Đẳng Cấp?</h3>
          <p className="text-slate-300 text-sm max-w-xl mx-auto font-light">
            Tìm chuyến xe ưng ý, chọn vị trí ngồi ưa thích và nhận vé điện tử mã QR trong vòng 60 giây.
          </p>
          <div className="pt-2">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all duration-200"
            >
              <span>Tìm chuyến xe ngay</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
