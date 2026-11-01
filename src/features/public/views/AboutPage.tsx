import React from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { 
  Bus, 
  Cpu, 
  ShieldCheck, 
  HeartHandshake, 
  Zap, 
  Compass, 
  Users, 
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  PhoneCall,
  MapPin,
  Lock,
  Radio,
  Tv,
  Wifi,
  Wind
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  useDocumentTitle("Giới thiệu & Sứ mệnh | VEXE AI - Nền tảng xe khách 5 sao");

  const corePillars = [
    {
      icon: HeartHandshake,
      title: "Tận Tâm Phụng Sự (Customer First)",
      desc: "Mỗi hành khách là một người thân trong gia đình. VEXE luôn đặt sự an toàn, trải nghiệm thoải mái và quyền lợi chính đáng của hành khách lên trên hết trong từng quyết định.",
      glow: "border-cyan-500/40 bg-cyan-950/20 shadow-cyan-500/10 text-cyan-400"
    },
    {
      icon: Cpu,
      title: "Đột Phá Công Nghệ (AI & Realtime)",
      desc: "Tiên phong ứng dụng mô hình Trí tuệ nhân tạo (AI Engine, pgvector) và thuật toán khóa ghế vi mô thời gian thực (Microsecond Lock), chấm dứt hoàn toàn tình trạng trùng vé hay nghẽn mạng.",
      glow: "border-blue-500/40 bg-blue-950/20 shadow-blue-500/10 text-blue-400"
    },
    {
      icon: ShieldCheck,
      title: "Minh Bạch Tuyệt Đối (Zero Compromise)",
      desc: "Cam kết chuẩn '3 Không': Không tăng giá bất thường dịp lễ Tết, Không bán trùng ghế, Không bỏ rơi khách. Đền bù 150% giá trị vé nếu nhà xe không cung cấp đúng chuyến xe.",
      glow: "border-emerald-500/40 bg-emerald-950/20 shadow-emerald-500/10 text-emerald-400"
    },
    {
      icon: Zap,
      title: "Tốc Độ & Tiện Lợi (Instant Booking)",
      desc: "Đặt vé và chọn ghế chính xác chỉ trong 60 giây. Nhận vé điện tử mã QR tức thì qua SMS/Email, lên xe quét mã trong 3 giây không cần xếp hàng đổi vé giấy tại bến.",
      glow: "border-amber-500/40 bg-amber-950/20 shadow-amber-500/10 text-amber-400"
    }
  ];

  const fleetTypes = [
    {
      name: "Limousine Cung Điện VIP 24 Phòng",
      badge: "Hạng Nhất Sang Trọng",
      desc: "Được mệnh danh là 'Khách sạn di động 5 sao'. Mỗi cabin là một không gian riêng tư hoàn toàn biệt lập với rèm che tự động.",
      features: [
        "Ghế massage công thái học bọc da Nappa chỉnh điện 160 độ",
        "Màn hình Smart TV 15.6 inch tích hợp Netflix, YouTube, kho phim 4K",
        "Tai nghe chống ồn cao cấp, cổng sạc nhanh Type-C PD 65W",
        "Wifi 5G vệ tinh tốc độ cao, đèn đọc sách LED dịu mắt"
      ],
      price: "Từ 350.000đ"
    },
    {
      name: "Limousine Thương Gia 34 Phòng VIP",
      badge: "Bán Chạy Nhất",
      desc: "Sự kết hợp hoàn hảo giữa không gian tiện nghi, riêng tư và mức giá tối ưu, lý tưởng cho các chuyến công tác và du lịch.",
      features: [
        "Khoang phòng 2 tầng rộng rãi, nệm mút nhớ hình êm ái",
        "Rèm che chống nhìn trộm bảo đảm sự riêng tư",
        "Cổng sạc điện thoại USB tại từng vị trí nằm",
        "Điều hòa độc lập hai chiều khử mùi ion âm Plasmacluster"
      ],
      price: "Từ 280.000đ"
    },
    {
      name: "Xe Giường Nằm Tiêu Chuẩn Đời Mới",
      badge: "Tiết Kiệm & Tiện Nghi",
      desc: "Dòng xe thế hệ mới 2024-2026 với khoang hành lý siêu rộng, hệ thống giảm xóc khí nén êm ái chống say xe vượt trội.",
      features: [
        "Chăn gối cao cấp tiệt trùng tia UV trước mỗi chuyến đi",
        "Khăn lạnh và nước khoáng Lavie cao cấp miễn phí",
        "Hệ thống camera hành trình & định vị GPS giám sát 24/7",
        "Bảo hiểm hành khách mức trách nhiệm cao nhất theo quy định"
      ],
      price: "Từ 220.000đ"
    }
  ];

  return (
    <div className="w-full bg-slate-950 text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: BRAND INTRODUCTION                                      */}
      {/* ========================================================================= */}
      <section className="relative pt-24 pb-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div aria-hidden="true" className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-80 bg-gradient-to-r from-cyan-500/15 via-blue-600/15 to-indigo-500/15 blur-[150px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider backdrop-blur-xl shadow-lg shadow-cyan-950/50">
            <Sparkles size={14} className="text-cyan-400 animate-pulse" />
            <span>Hệ Thống Đặt Vé Xe Khách Công Nghệ 5 Sao Hàng Đầu Việt Nam</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Hành Trình Kiến Tạo Chuẩn Mực{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Vận Tải Thông Minh
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light max-w-3xl mx-auto">
            VEXE không chỉ là một trang web bán vé xe thông thường. Chúng tôi là hệ sinh thái công nghệ số toàn diện, kết nối trực tiếp hàng triệu hành khách với hơn 100+ nhà xe uy tín trên 550+ tuyến đường toàn quốc, mang đến sự an tâm, minh bạch và đẳng cấp trên từng chuyến đi.
          </p>

          {/* Quick Metrics Ribbon */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { val: "1.500.000+", label: "Vé Điện Tử Xuất Xưởng", sub: "Tăng trưởng 180%/năm" },
              { val: "120+", label: "Hãng Xe Đối Tác Uy Tín", sub: "Phương Trang, Thành Bưởi..." },
              { val: "550+", label: "Tuyến Đường Phủ Khắp", sub: "Kết nối 63 tỉnh thành" },
              { val: "99.8%", label: "Tỷ Lệ Đúng Giờ & Giữ Chỗ", sub: "Bảo chứng 100% chuyến xe" }
            ].map((m, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md text-center">
                <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight">{m.val}</div>
                <div className="text-xs font-bold text-white mt-1">{m.label}</div>
                <div className="text-[10px] text-slate-400 font-light mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FLEET SHOWCASE: ĐỘI XE TIÊU CHUẨN 5 SAO (WITH REAL PHOTO)              */}
      {/* ========================================================================= */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Image Showcase */}
          <div className="w-full lg:w-1/2 relative group">
            <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl shadow-cyan-950/60 aspect-[16/10]">
              <img 
                src="/images/about-fleet-limousine.jpg" 
                alt="Đội xe Limousine VIP 5 sao VEXE" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Khoang Limousine Cung Điện VIP 2026</span>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono font-bold">100% Chuẩn 5 Sao</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 font-light">
                  Trải nghiệm máy bay mặt đất với cabin riêng tư biệt lập, nệm massage chỉnh điện và màn hình giải trí 4K.
                </p>
              </div>
            </div>
            
            {/* Ambient Backlight */}
            <div aria-hidden="true" className="absolute -top-6 -left-6 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none -z-10" />
          </div>

          {/* Fleet Details */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div>
              <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">Đội Ngũ Phương Tiện Đỉnh Cao</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                Tiện Nghi Vượt Trội • Khác Biệt Trên Từng Cây Số
              </h2>
              <p className="text-slate-300 text-sm font-light mt-3 leading-relaxed">
                Tất cả các dòng xe hoạt động trong hệ thống VEXE đều phải vượt qua quy trình kiểm định chất lượng 24 bước nghiêm ngặt trước khi xuất bến: từ hệ thống phanh ABS, giảm xóc bóng hơi cho đến quy chuẩn vệ sinh diệt khuẩn UV toàn diện.
              </p>
            </div>

            <div className="space-y-4">
              {fleetTypes.map((fleet, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 transition-all">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Bus size={17} className="text-cyan-400" />
                      <span>{fleet.name}</span>
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {fleet.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-light mb-3">{fleet.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                    {fleet.features.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TECHNOLOGY ECOSYSTEM: TRUNG TÂM ĐIỀU HÀNH SOC (WITH REAL PHOTO)        */}
      {/* ========================================================================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
          
          {/* Image Showcase */}
          <div className="w-full lg:w-1/2 relative group">
            <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-950/60 aspect-[16/10]">
              <img 
                src="/images/about-command-center.jpg" 
                alt="Trung tâm điều hành giám sát SOC VEXE" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio size={14} className="text-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">VEXE Command & Control SOC 24/7</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold">Uptime 99.99%</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 font-light">
                  Giám sát hành trình toàn bộ đội xe bằng GPS thời gian thực, điều phối thông minh và hỗ trợ khẩn cấp 24/7.
                </p>
              </div>
            </div>

            <div aria-hidden="true" className="absolute -bottom-6 -right-6 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -z-10" />
          </div>

          {/* Tech Breakdown */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">Công Nghệ Cốt Lõi</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                Hệ Sinh Thái Công Nghệ Tiên Phong
              </h2>
              <p className="text-slate-300 text-sm font-light mt-3 leading-relaxed">
                Được xây dựng trên nền tảng kiến trúc phân tán hiện đại, VEXE xử lý hàng triệu truy vấn mỗi ngày với tốc độ phản hồi tính bằng miligiây, đảm bảo hệ thống vận hành trơn tru ngay cả trong các dịp cao điểm Tết Nguyên Đán.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Khóa Ghế Vi Mô (Microsecond Lock)",
                  desc: "Thuật toán xử lý đồng thời ngăn chặn 100% tình trạng trùng vé giữa hàng trăm đại lý cùng lúc.",
                  icon: Lock
                },
                {
                  title: "VEXE AI Engine & pgvector",
                  desc: "Mô hình tìm kiếm ngữ nghĩa tự nhiên và phân tích cụm thói quen khách hàng để gợi ý chuyến xe tối ưu.",
                  icon: Cpu
                },
                {
                  title: "Bản Đồ GPS Vệ Tinh Trực Tiếp",
                  desc: "Theo dõi định vị từng xe trên bản đồ số, dự báo thời gian đến trạm chính xác theo tình trạng kẹt xe.",
                  icon: MapPin
                },
                {
                  title: "Thanh Toán Đa Kênh Bảo Mật PCI-DSS",
                  desc: "Tích hợp VietQR 24/7, VNPAY, MoMo, thẻ quốc tế với xác thực sinh trắc học và mã hóa đầu cuối.",
                  icon: ShieldCheck
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                    <div className="font-bold text-white text-sm">{item.title}</div>
                    <p className="text-[11px] text-slate-400 font-light leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CUSTOMER CARE 24/7: ĐỘI NGŨ TẬN TÂM (WITH REAL PHOTO)                  */}
      {/* ========================================================================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Image Showcase */}
          <div className="w-full lg:w-1/2 relative group">
            <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl shadow-emerald-950/60 aspect-[16/10]">
              <img 
                src="/images/about-customer-service.jpg" 
                alt="Đội ngũ hỗ trợ khách hàng 24/7 VEXE" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhoneCall size={14} className="text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Đội Ngũ CSKH 24/7 Tận Tâm</span>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono font-bold">Hotline 1900 1234</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 font-light">
                  Phản hồi và giải quyết khiếu nại trong vòng 15 phút, đồng hành cùng hành khách trên mọi dặm đường.
                </p>
              </div>
            </div>

            <div aria-hidden="true" className="absolute -top-6 -right-6 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none -z-10" />
          </div>

          {/* Customer Service Guarantees */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">Chuẩn Mực Phục Vụ 5 Sao</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                Cam Kết Vàng Bảo Vệ Hành Khách
              </h2>
              <p className="text-slate-300 text-sm font-light mt-3 leading-relaxed">
                Chúng tôi hiểu rằng phía sau mỗi tấm vé xe là một cuộc hội ngộ gia đình, một chuyến công tác quan trọng hay một kỳ nghỉ đáng nhớ. Vì vậy, VEXE thiết lập những cam kết dịch vụ khắt khe nhất để bảo vệ quyền lợi của bạn.
              </p>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  title: "Hoàn Tiền 150% Nếu Nhà Xe Hủy Chuyến",
                  desc: "Nếu nhà xe tự ý hủy chuyến hoặc không bố trí đúng chuyến xe đã đặt, VEXE hoàn 100% tiền vé và bồi thường thêm 50% chi phí chuyển đổi phương tiện ngay lập tức."
                },
                {
                  title: "Xe Trung Chuyển Tận Nhà Miễn Phí",
                  desc: "Hỗ trợ xe trung chuyển đón trả tận nơi trong nội thành tại hầu hết các bến xe lớn (TP.HCM, Đà Lạt, Nha Trang, Phú Yên, Cần Thơ, Đà Nẵng...)."
                },
                {
                  title: "Đổi Trả & Hủy Vé Trực Tuyến Tức Thì",
                  desc: "Chủ động đổi giờ khởi hành hoặc hủy vé nhận hoàn tiền trực tiếp về tài khoản ngân hàng chỉ với 3 cú nhấp chuột, không cần gọi điện thoại phiền hà."
                },
                {
                  title: "Đồng Hành 24/7 Suốt Lễ Tết",
                  desc: "Đội ngũ chuyên viên tổng đài và nhân sự thường trực tại các bến xe lớn túc trực xuyên suốt 365 ngày để hỗ trợ hành khách lên xe an toàn."
                }
              ].map((c, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{c.title}</h3>
                    <p className="text-xs text-slate-300 font-light mt-1 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CORE VALUES: 4 TRỤ CỘT TÂM - TÍN - TRÍ - TỐC                          */}
      {/* ========================================================================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">Triết Lý Kinh Doanh</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">4 Giá Trị Cốt Lõi Vững Chắc</h2>
          <p className="text-slate-400 text-xs sm:text-sm font-light">Kim chỉ nam định hình từng dòng code, từng chính sách phục vụ và văn hóa phụng sự của VEXE.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {corePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                className={`p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4 hover:scale-[1.02] ${pillar.glow}`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION: TRẢI NGHIỆM ĐẶT VÉ NGAY                                */}
      {/* ========================================================================= */}
      <section className="py-20 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-slate-900/80 border border-cyan-500/30 p-10 md:p-14 text-center overflow-hidden shadow-2xl shadow-cyan-950/40">
          <div aria-hidden="true" className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase font-mono">
              <Sparkles size={12} />
              <span>Sẵn Sàng Cho Hành Trình Mới</span>
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Trải Nghiệm Đặt Vé Xe Khách 5 Sao Cùng VEXE Ngay Hôm Nay
            </h2>

            <p className="text-slate-300 text-sm font-light leading-relaxed">
              Hàng trăm chuyến xe Limousine VIP đời mới đang sẵn sàng khởi hành từ vị trí của bạn với mã giảm giá chào mừng 25% dành riêng cho khách hàng mới.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/25 active:scale-95"
              >
                <span>Tra Cứu & Đặt Vé Ngay</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/achievements"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all"
              >
                <span>Xem Thành Tích & Đối Tác</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
