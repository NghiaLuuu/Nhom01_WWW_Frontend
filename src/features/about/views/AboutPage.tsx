import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Users, 
  Award, 
  Zap, 
  HeartHandshake, 
  QrCode, 
  MapPin, 
  ArrowRight,
  Headphones,
  CheckCircle2,
  Code2
} from 'lucide-react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

export const AboutPage: React.FC = () => {
  useDocumentTitle('Giới thiệu');
  const navigate = useNavigate();

  const stats = [
    { value: '500.000+', label: 'Hành khách tin dùng', icon: Users, color: 'text-blue-400' },
    { value: '550+', label: 'Tuyến đường liên tỉnh', icon: MapPin, color: 'text-cyan-400' },
    { value: '99.8%', label: 'Chuyến xe an toàn', icon: ShieldCheck, color: 'text-emerald-400' },
    { value: '24/7', label: 'Tư vấn & Trợ lý AI', icon: Headphones, color: 'text-purple-400' },
  ];

  const coreValues = [
    {
      icon: ShieldCheck,
      title: 'Minh bạch & An toàn',
      desc: 'Cam kết 100% đúng giá niêm yết, không phát sinh phụ phí ẩn. Tuyến đường, nhà xe và thông tin tài xế đều được thẩm định nghiêm ngặt.',
      badge: 'Chất lượng hàng đầu'
    },
    {
      icon: Zap,
      title: 'Công nghệ tiên phong',
      desc: 'Ứng dụng sơ đồ ghế thời gian thực, cơ chế khóa giữ ghế 5 phút chống trùng chỗ và trợ lý AI thông minh hỗ trợ 24/7.',
      badge: 'Công nghệ số'
    },
    {
      icon: HeartHandshake,
      title: 'Khách hàng là trọng tâm',
      desc: 'Mọi tính năng từ chọn ghế, đổi chuyến đến hoàn vé đều được tối ưu đơn giản nhất để bất kỳ ai cũng có thể sử dụng dễ dàng.',
      badge: 'Tận tâm phục vụ'
    },
    {
      icon: Award,
      title: 'Đúng giờ & Tiện nghi',
      desc: 'Hệ thống đối tác xe chất lượng cao, xe limousine giường nằm đời mới trang bị wifi, sạc điện thoại và nội thất hiện đại.',
      badge: 'Đẳng cấp dịch vụ'
    }
  ];

  const techHighlights = [
    {
      icon: Bus,
      title: 'Sơ đồ ghế động 2 tầng trực quan',
      desc: 'Cho phép khách hàng tự do quan sát và lựa chọn chính xác vị trí ghế tầng dưới, tầng trên theo nhu cầu cá nhân.'
    },
    {
      icon: Clock,
      title: 'Cơ chế giữ chỗ 5 phút độc quyền',
      desc: 'Ghế bạn chọn sẽ được bảo lưu an toàn trong 5 phút khi tiến hành thanh toán, không lo bị người khác đặt đè.'
    },
    {
      icon: QrCode,
      title: 'Vé điện tử & Mã QR không cần in vé',
      desc: 'Vé được gửi tức thì qua Email và tài khoản. Khách hàng chỉ cần quét mã QR khi lên xe, tiện lợi và bảo vệ môi trường.'
    },
    {
      icon: Sparkles,
      title: 'Trợ lý AI tư vấn lộ trình thông minh',
      desc: 'Tích hợp mô hình AI ngôn ngữ tự nhiên giải đáp mọi thắc mắc về tuyến đi, giờ khởi hành và giá vé nhanh chóng.'
    }
  ];

  const milestones = [
    {
      year: '2024',
      title: 'Khởi đầu sứ mệnh',
      desc: 'Dự án ra đời với khát vọng số hóa trải nghiệm đặt vé xe khách liên tỉnh, loại bỏ cảnh xếp hàng chen chúc tại bến xe.'
    },
    {
      year: '2025',
      title: 'Chuẩn hóa quy trình đặt vé',
      desc: 'Mở rộng mạng lưới kết nối các tuyến huyết mạch Bắc - Trung - Nam, tích hợp thanh toán trực tuyến an toàn.'
    },
    {
      year: '2026',
      title: 'Nâng tầm công nghệ cao',
      desc: 'Áp dụng kiến trúc bảo mật RBAC, cơ chế khóa giữ ghế Redis thông minh và trợ lý ảo AI hỗ trợ tìm vé bằng ngôn ngữ tự nhiên.'
    }
  ];

  return (
    <div className="w-full bg-slate-950 font-sans selection:bg-blue-500/30 text-slate-100 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-cyan-400/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-cyan-300 text-sm font-semibold backdrop-blur-md">
            <Sparkles size={16} />
            <span>Về Hệ Thống Đặt Vé Xe Trực Tuyến VEXE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight text-balance">
            Tiên phong nâng tầm trải nghiệm{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
              hành trình vạn dặm
            </span>
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl font-light leading-relaxed max-w-3xl mx-auto">
            VEXE ra đời với sứ mệnh mang lại sự an tâm, minh bạch và văn minh cho từng chuyến đi của người Việt. 
            Chúng tôi ứng dụng công nghệ hiện đại nhất để việc đặt vé xe khách trở nên dễ dàng chỉ sau vài thao tác.
          </p>
        </div>

        {/* STATS COUNTER */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16 max-w-5xl mx-auto">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-blue-500/40 transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className={stat.color} size={24} />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. SỨ MỆNH & TẦM NHÌN */}
      <section className="py-20 bg-slate-900/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Mission statement */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                Sứ mệnh & Tầm nhìn
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-snug">
                Xóa bỏ rào cản đặt vé truyền thống, hướng tới giao thông số văn minh
              </h2>
              <p className="text-slate-300 leading-relaxed font-light text-base sm:text-lg">
                Trong suốt nhiều năm, người đi xe khách thường xuyên đối mặt với sự bất tiện: xếp hàng dài tại bến, 
                giá vé bị đẩy cao vào dịp lễ tết, không được chọn trước vị trí ngồi và nỗi lo nhồi nhét khách.
              </p>
              <p className="text-slate-300 leading-relaxed font-light text-base sm:text-lg">
                <strong className="text-white font-semibold">VEXE</strong> được xây dựng như một giải pháp số toàn diện: 
                hành khách biết trước thông tin chuyến, xem sơ đồ ghế thực tế, tự chọn chỗ ưng ý và thanh toán tức thì với 
                mức giá minh bạch 100%.
              </p>

              <div className="pt-2 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-blue-400 shrink-0 mt-1" size={20} />
                  <span className="text-slate-300">Minh bạch 100% sơ đồ ghế và vị trí ngồi thực tế trước khi đặt</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-blue-400 shrink-0 mt-1" size={20} />
                  <span className="text-slate-300">Không lo hét giá hay phụ thu bất hợp lý vào mùa cao điểm</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-blue-400 shrink-0 mt-1" size={20} />
                  <span className="text-slate-300">Hỗ trợ tra cứu thông minh trên đa nền tảng thiết bị di động & máy tính</span>
                </div>
              </div>
            </div>

            {/* Visual Feature Card Showcase */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Bus size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Hệ Thống Quản Lý Tuyến Xe</h3>
                      <p className="text-xs text-slate-400">Tiêu chuẩn vận hành thông minh</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Online 24/7
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                    <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Tầm nhìn 2030</div>
                    <p className="text-sm text-slate-200">
                      Trở thành nền tảng số hóa vận tải đường bộ thông minh hàng đầu tại Việt Nam, kết nối hơn 1.000 đối tác nhà xe uy tín trên cả nước.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                    <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Cam kết với hành khách</div>
                    <p className="text-sm text-slate-200">
                      Đảm bảo 100% giữ đúng số ghế đã chọn, hỗ trợ đổi chuyến linh hoạt và hoàn tiền tự động theo chính sách minh bạch.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/10">
                  <span>Ứng dụng công nghệ FSD & Fixed Skeleton</span>
                  <span className="text-blue-400 font-medium">Bảo mật đa tầng RBAC</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. GIÁ TRỊ CỐT LÕI */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            Giá trị cốt lõi
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Nền tảng vững chắc cho từng trải nghiệm
          </h2>
          <p className="text-slate-400 text-base sm:text-lg font-light">
            Những nguyên tắc kim chỉ nam định hình mọi quyết định và cải tiến công nghệ tại VEXE.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-7 hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Icon size={24} />
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-slate-300 border border-white/10 font-medium">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ĐIỂM KHÁC BIỆT CÔNG NGHỆ */}
      <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              Trải nghiệm vượt trội
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Công nghệ phục vụ hành trình tiện lợi
            </h2>
            <p className="text-slate-400 text-base sm:text-lg font-light">
              Những tính năng đột phá được xây dựng giúp hành khách đặt vé an tâm và chủ động nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {techHighlights.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx}
                  className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 hover:border-cyan-500/40 transition-all duration-300 flex items-start gap-5 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Icon size={28} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-light">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. CÁC MỐC PHÁT TRIỂN (TIMELINE) */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            Lịch sử & Cột mốc
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Hành trình không ngừng hoàn thiện
          </h2>
        </div>

        <div className="relative border-l-2 border-blue-500/30 ml-4 md:ml-32 space-y-12">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative pl-8 md:pl-10 group">
              {/* Dot */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-950 group-hover:scale-125 transition-transform" />
              
              <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
                <span className="text-2xl font-black text-cyan-400 font-mono">{m.year}</span>
                <h3 className="text-xl font-bold text-white">{m.title}</h3>
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed mt-2 max-w-2xl font-light">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. ĐỘI NGŨ PHÁT TRIỂN DỰ ÁN */}
      <section className="py-20 bg-slate-900/60 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900/20 via-slate-900 to-cyan-900/20 rounded-3xl p-8 sm:p-12 border border-white/10 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <Code2 size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Dự Án Đề Tài Môn Học WWW - Nhóm 01
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto font-light">
                Khoa Công Nghệ Thông Tin - Trường Đại học Công Nghiệp TP. Hồ Chí Minh (IUH).
                Ứng dụng kiến trúc Full-stack hiện đại: Spring Boot 3, React 18, PostgreSQL, Redis và Tailwind CSS.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <span>Hệ thống đạt chuẩn kiến trúc bảo mật RBAC & RESTful API</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION (CTA) */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Sẵn sàng cho chuyến hành trình tiếp theo?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-light">
            Tra cứu chuyến xe, xem sơ đồ ghế trống theo thời gian thực và đặt vé chỉ trong 60 giây.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/search')}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.7)] transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Tìm chuyến xe ngay</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition-all active:scale-95"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

