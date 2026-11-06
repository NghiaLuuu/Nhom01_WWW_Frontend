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
import { PublicAiTripShelf } from '../../booking/components/PublicAiTripShelf';

export const AboutPage: React.FC = () => {
  useDocumentTitle("Giới thiệu & Sứ mệnh | VEXE - Nền tảng xe khách 5 sao");

  const corePillars = [
    {
      icon: HeartHandshake,
      title: "Tận Tâm Phụng Sự",
      desc: "Mỗi hành khách là một người thân trong gia đình. VEXE luôn đặt sự an toàn, trải nghiệm thoải mái và quyền lợi chính đáng của hành khách lên trên hết trong từng quyết định.",
      glow: "border-slate-700 bg-slate-800 text-blue-400"
    },
    {
      icon: Cpu,
      title: "Đột Phá Công Nghệ",
      desc: "Tiên phong ứng dụng mô hình số hóa hiện đại và thuật toán khóa ghế vi mô thời gian thực, chấm dứt hoàn toàn tình trạng trùng vé hay nghẽn mạng.",
      glow: "border-slate-700 bg-slate-800 text-cyan-400"
    },
    {
      icon: ShieldCheck,
      title: "Minh Bạch Tuyệt Đối",
      desc: "Cam kết chuẩn '3 Không': Không tăng giá bất thường dịp lễ Tết, Không bán trùng ghế, Không bỏ rơi khách. Đền bù 150% giá trị vé nếu nhà xe không cung cấp đúng chuyến xe.",
      glow: "border-slate-700 bg-slate-800 text-emerald-400"
    },
    {
      icon: Zap,
      title: "Tốc Độ & Tiện Lợi",
      desc: "Đặt vé và chọn ghế chính xác chỉ trong 60 giây. Nhận vé điện tử mã QR tức thì qua SMS/Email, lên xe quét mã trong 3 giây không cần xếp hàng đổi vé giấy tại bến.",
      glow: "border-slate-700 bg-slate-800 text-amber-400"
    }
  ];

  const fleetTypes = [
    {
      name: "Limousine Cung Điện VIP 24 Phòng",
      badge: "Hạng Nhất Sang Trọng",
      desc: "Được mệnh danh là 'Khách sạn di động 5 sao'. Mỗi cabin là một không gian riêng tư hoàn toàn biệt lập với rèm che tự động.",
      features: [
        "Ghế massage công thái học bọc da Nappa chỉnh điện 160 độ",
        "Màn hình Smart TV 15.6 inch tích hợp kho giải trí HD",
        "Tai nghe chống ồn cao cấp, cổng sạc nhanh Type-C PD 65W",
        "Wifi vệ tinh tốc độ cao, đèn đọc sách LED dịu mắt"
      ],
      price: "Từ 350.000đ"
    },
    {
      name: "Limousine Thương Gia 34 Phòng VIP",
      badge: "Bán Chạy Nhất",
      desc: "Sự kết hợp hoàn hảo giữa không gian tiện nghi, riêng tư và mức giá tối ưu, lý tưởng cho các chuyến công tác và du lịch.",
      features: [
        "Khoang phòng 2 tầng rộng rãi, nệm mút nhớ hình êm ái",
        "Rèm che bảo đảm sự riêng tư cho từng vị trí nằm",
        "Cổng sạc điện thoại USB tại từng vị trí",
        "Điều hòa độc lập hai chiều lọc không khí ion âm"
      ],
      price: "Từ 280.000đ"
    },
    {
      name: "Xe Giường Nằm Tiêu Chuẩn Đời Mới",
      badge: "Tiết Kiệm & Tiện Nghi",
      desc: "Dòng xe thế hệ mới với khoang hành lý rộng rãi, hệ thống giảm xóc khí nén êm ái chống say xe vượt trội.",
      features: [
        "Chăn gối cao cấp tiệt trùng trước mỗi chuyến đi",
        "Khăn lạnh và nước khoáng đóng chai miễn phí",
        "Hệ thống định vị GPS và camera giám sát hành trình",
        "Bảo hiểm hành khách đầy đủ theo quy định"
      ],
      price: "Từ 220.000đ"
    }
  ];

  return (
    <div className="w-full bg-[#0b1120] text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} className="text-blue-400" />
            <span>Hệ Thống Đặt Vé Xe Khách Công Nghệ 5 Sao Hàng Đầu Việt Nam</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Hành Trình Kiến Tạo Chuẩn Mực{' '}
            <span className="text-blue-400">
              Vận Tải Thông Minh
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto font-normal">
            VEXE không chỉ là một trang web bán vé xe thông thường. Chúng tôi là hệ sinh thái công nghệ số toàn diện, kết nối trực tiếp hàng triệu hành khách với hơn 100+ nhà xe uy tín trên 550+ tuyến đường toàn quốc, mang đến sự an tâm, minh bạch và tiện nghi trên từng chuyến đi.
          </p>

          {/* Quick Metrics Ribbon */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { val: "1.500.000+", label: "Vé Điện Tử Đã Phục Vụ", sub: "Tăng trưởng 180%/năm" },
              { val: "120+", label: "Hãng Xe Đối Tác Uy Tín", sub: "Phương Trang, Thành Bưởi..." },
              { val: "550+", label: "Tuyến Đường Phủ Khắp", sub: "Kết nối 63 tỉnh thành" },
              { val: "99.8%", label: "Tỷ Lệ Đúng Giờ & Giữ Chỗ", sub: "Bảo chứng 100% chuyến xe" }
            ].map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-center shadow-sm">
                <div className="text-2xl sm:text-3xl font-bold text-cyan-400 font-mono tracking-tight">{m.val}</div>
                <div className="text-xs font-semibold text-white mt-1">{m.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. FLEET SHOWCASE */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Image Showcase */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-md aspect-[16/10]">
              <img 
                src="/images/about-fleet-limousine.jpg" 
                alt="Đội xe Limousine VIP 5 sao VEXE" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">Khoang Limousine Cung Điện VIP</span>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono font-semibold">Chuẩn 5 Sao</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Trải nghiệm máy bay mặt đất với cabin riêng tư biệt lập, nệm massage chỉnh điện và màn hình giải trí.
                </p>
              </div>
            </div>
          </div>

          {/* Fleet Details */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div>
              <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Đội Ngũ Phương Tiện Hiện Đại</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 tracking-tight">
                Tiện Nghi Vượt Trội • Êm Ái Từng Cây Số
              </h2>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                Tất cả các dòng xe hoạt động trong hệ thống VEXE đều phải vượt qua quy trình kiểm định chất lượng 24 bước nghiêm ngặt trước khi xuất bến: từ hệ thống phanh ABS, giảm xóc bóng hơi cho đến quy chuẩn vệ sinh toàn diện.
              </p>
            </div>

            <div className="space-y-4">
              {fleetTypes.map((fleet, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-white text-base flex items-center gap-2">
                      <Bus size={17} className="text-blue-400" />
                      <span>{fleet.name}</span>
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/25">
                      {fleet.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-2">{fleet.desc}</p>
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

      {/* 3. TECHNOLOGY ECOSYSTEM */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
          
          {/* Image Showcase */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-md aspect-[16/10]">
              <img 
                src="/images/about-command-center.jpg" 
                alt="Trung tâm điều hành giám sát SOC VEXE" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio size={14} className="text-blue-400" />
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">VEXE Command & Control SOC 24/7</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">Uptime 99.99%</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Giám sát hành trình toàn bộ đội xe bằng GPS thời gian thực, điều phối thông minh và hỗ trợ khẩn cấp 24/7.
                </p>
              </div>
            </div>
          </div>

          {/* Tech Breakdown */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div>
              <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Công Nghệ Cốt Lõi</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 tracking-tight">
                Hệ Sinh Thái Công Nghệ Tiên Phong
              </h2>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                Được xây dựng trên nền tảng kiến trúc phân tán hiện đại, VEXE xử lý hàng triệu truy vấn mỗi ngày với tốc độ phản hồi tính bằng miligiây, đảm bảo hệ thống vận hành trơn tru ngay cả trong các dịp cao điểm.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Khóa Ghế Vi Mô (Microsecond Lock)",
                  desc: "Thuật toán xử lý đồng thời ngăn chặn 100% tình trạng trùng vé giữa hàng trăm người dùng cùng lúc.",
                  icon: Lock
                },
                {
                  title: "Đề Xuất Hành Trình Thông Minh",
                  desc: "Mô hình tìm kiếm ngữ nghĩa tự nhiên và phân tích cụm thói quen khách hàng để gợi ý chuyến xe tối ưu.",
                  icon: Cpu
                },
                {
                  title: "Bản Đồ GPS Định Vị Trực Tiếp",
                  desc: "Theo dõi định vị từng xe trên bản đồ số, dự báo thời gian đến trạm chính xác theo tình trạng giao thông.",
                  icon: MapPin
                },
                {
                  title: "Thanh Toán Đa Kênh Bảo Mật PCI-DSS",
                  desc: "Tích hợp VietQR 24/7, VNPAY, MoMo, thẻ quốc tế với xác thực an toàn và mã hóa đầu cuối.",
                  icon: ShieldCheck
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                    <div className="font-semibold text-white text-sm">{item.title}</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* 4. CUSTOMER CARE 24/7 */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Image Showcase */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-md aspect-[16/10]">
              <img 
                src="/images/about-customer-service.jpg" 
                alt="Đội ngũ hỗ trợ khách hàng 24/7 VEXE" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-slate-900/90 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhoneCall size={14} className="text-emerald-400" />
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">Đội Ngũ CSKH 24/7 Tận Tâm</span>
                  </div>
                  <span className="text-xs text-cyan-400 font-mono font-semibold">Hotline 1900 1234</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Phản hồi và hỗ trợ kịp thời, đồng hành cùng hành khách trên mọi dặm đường.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Service Guarantees */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div>
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">Chuẩn Mực Phục Vụ 5 Sao</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 tracking-tight">
                Cam Kết Vàng Bảo Vệ Hành Khách
              </h2>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                Chúng tôi hiểu rằng phía sau mỗi tấm vé xe là một cuộc hội ngộ gia đình, một chuyến công tác quan trọng hay một kỳ nghỉ đáng nhớ. Vì vậy, VEXE thiết lập những cam kết dịch vụ chu đáo để bảo vệ quyền lợi của bạn.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: "Hoàn Tiền 150% Nếu Nhà Xe Hủy Chuyến",
                  desc: "Nếu nhà xe tự ý hủy chuyến hoặc không bố trí đúng chuyến xe đã đặt, VEXE hoàn 100% tiền vé và bồi thường thêm 50% chi phí chuyển đổi phương tiện ngay lập tức."
                },
                {
                  title: "Xe Trung Chuyển Tận Nơi",
                  desc: "Hỗ trợ xe trung chuyển đón trả tận nơi trong nội thành tại hầu hết các bến xe lớn (TP.HCM, Đà Lạt, Nha Trang, Phú Yên, Cần Thơ, Đà Nẵng...)."
                },
                {
                  title: "Đổi Trả & Hủy Vé Trực Tuyến Thuận Tiện",
                  desc: "Chủ động đổi giờ khởi hành hoặc hủy vé nhận hoàn tiền trực tiếp theo chính sách nhà xe chỉ với vài thao tác trên hệ thống."
                },
                {
                  title: "Đồng Hành 24/7 Suốt Dịp Lễ Tết",
                  desc: "Đội ngũ chuyên viên tổng đài và nhân sự thường trực túc trực xuyên suốt để hỗ trợ hành khách lên xe an toàn."
                }
              ].map((c, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{c.title}</h3>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* 5. CORE VALUES */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Triết Lý Hoạt Động</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">4 Giá Trị Cốt Lõi Vững Chắc</h2>
          <p className="text-slate-400 text-xs sm:text-sm">Kim chỉ nam định hình từng chính sách phục vụ và văn hóa phụng sự của VEXE.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {corePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                className="p-5 rounded-2xl bg-slate-800 border border-slate-700 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center mb-3">
                    <Icon size={20} className={pillar.glow.includes('text-blue-400') ? 'text-blue-400' : pillar.glow.includes('text-cyan-400') ? 'text-cyan-400' : pillar.glow.includes('text-emerald-400') ? 'text-emerald-400' : 'text-amber-400'} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{pillar.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5.5. AI RECOMMENDATIONS */}
      <PublicAiTripShelf
        title="Chuyến Xe 5 Sao Đề Xuất Dành Cho Bạn"
        subtitle="Dựa trên tiêu chuẩn đội xe Limousine VIP và cam kết phụng sự 5 sao, hệ thống gợi ý các hành trình vàng tối ưu nhất từ vị trí của bạn."
        badgeLabel="ĐỀ XUẤT 5 SAO"
        pageContext="ABOUT"
        className="border-t border-slate-800"
      />

      {/* 6. CALL TO ACTION */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-8 md:p-12 text-center shadow-sm">
          <div className="max-w-2xl mx-auto space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs font-semibold uppercase font-mono">
              <Sparkles size={12} />
              <span>Sẵn Sàng Cho Hành Trình Mới</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Trải Nghiệm Đặt Vé Xe Khách 5 Sao Cùng VEXE Ngay Hôm Nay
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">
              Hàng trăm chuyến xe Limousine VIP đời mới đang sẵn sàng khởi hành từ vị trí của bạn với mã giảm giá chào mừng 25% dành riêng cho khách hàng mới.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-sm"
              >
                <span>Tra Cứu & Đặt Vé Ngay</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/achievements"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 font-semibold text-xs sm:text-sm transition-colors"
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
