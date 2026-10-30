import React, { useState, useMemo } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { HelpCircle, ChevronDown, Search, ShieldCheck, CreditCard, Luggage, RefreshCw, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  badge?: string;
}

export const FaqPage: React.FC = () => {
  useDocumentTitle("Câu hỏi thường gặp (FAQ) | VEXE");

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'refund-150': true, // Open policy question by default
  });

  const categories = [
    { key: 'ALL', label: 'Tất cả chủ đề', icon: HelpCircle },
    { key: 'BOOKING', label: 'Đặt vé & Giữ chỗ', icon: RefreshCw },
    { key: 'POLICY_150', label: 'Chính sách hoàn 150%', icon: ShieldCheck },
    { key: 'PAYMENT', label: 'Thanh toán & Hóa đơn', icon: CreditCard },
    { key: 'LUGGAGE', label: 'Lên xe & Hành lý', icon: Luggage },
  ];

  const faqData: FaqItem[] = [
    {
      id: 'refund-150',
      category: 'POLICY_150',
      question: 'Chính sách "Cam kết hoàn 150%" hoạt động như thế nào?',
      badge: 'Cam Kết Vàng',
      answer: 'Nếu bạn đã đặt vé thành công và thanh toán qua VEXE nhưng nhà xe không có chỗ, hủy chuyến mà không báo trước hoặc tự ý đổi sang xe chất lượng thấp hơn, VEXE cam kết: Hoàn lại 100% số tiền vé đã thanh toán, đồng thời bồi thường thêm 50% giá trị vé vào tài khoản/ví của bạn trong vòng 24 giờ làm việc. Bạn chỉ cần liên hệ hotline 1900 6868 để xác nhận.'
    },
    {
      id: 'how-to-book',
      category: 'BOOKING',
      question: 'Làm thế nào để đặt vé xe và chọn chỗ ngồi chính xác trên VEXE?',
      answer: 'Bước 1: Nhập điểm đi, điểm đến và ngày khởi hành trên thanh tìm kiếm. Bước 2: Hệ thống hiển thị danh sách các chuyến xe với thông tin chi tiết (giá vé, hãng xe, tiện ích wifi/sạc, loại xe giường nằm hay limousine). Bước 3: Nhấp "Chọn chuyến", bạn sẽ thấy sơ đồ xe thời gian thực với các ghế trống. Chọn ghế ưng ý, nhập thông tin hành khách và tiến hành thanh toán.'
    },
    {
      id: 'e-ticket-usage',
      category: 'BOOKING',
      question: 'Sau khi thanh toán thành công, tôi nhận vé bằng cách nào và sử dụng ra sao?',
      answer: 'Ngay sau khi giao dịch thành công, hệ thống sẽ gửi Vé điện tử kèm mã QR qua Email và hiển thị trong mục "Hồ sơ / Vé của tôi". Khi lên xe, bạn chỉ cần xuất trình mã QR trên màn hình điện thoại cho tài xế hoặc tiếp viên quét xác thực. Hoàn toàn không cần in vé giấy!'
    },
    {
      id: 'cancel-change-ticket',
      category: 'BOOKING',
      question: 'Tôi có thể đổi ngày đi hoặc hủy vé đã đặt không? Mức phí thế nào?',
      answer: 'Có. Tùy thuộc vào chính sách của từng nhà xe: Thông thường nếu hủy trước 24 giờ so với giờ khởi hành, bạn sẽ được hoàn từ 90% - 100% tiền vé; nếu hủy từ 12 - 24 giờ trước giờ xe chạy, phí hủy từ 10% - 30%. Bạn có thể thao tác trực tiếp trong trang quản lý vé hoặc liên hệ bộ phận CSKH để được trợ giúp.'
    },
    {
      id: 'payment-methods',
      category: 'PAYMENT',
      question: 'VEXE chấp nhận các hình thức thanh toán nào? Có an toàn không?',
      answer: 'VEXE hỗ trợ đa dạng phương thức thanh toán bảo mật chuẩn PCI-DSS: Thẻ ATM nội địa qua cổng VNPAY, Thẻ quốc tế Visa/Mastercard, Ví điện tử MoMo và ZaloPay. Mọi giao dịch đều được mã hóa bằng giao thức SSL 256-bit an toàn tuyệt đối.'
    },
    {
      id: 'vat-invoice',
      category: 'PAYMENT',
      question: 'Tôi là doanh nghiệp hoặc đi công tác, VEXE có xuất hóa đơn GTGT (VAT) không?',
      answer: 'Có. Khi đặt vé tại bước Điền thông tin hành khách, bạn chỉ cần tích chọn "Yêu cầu xuất hóa đơn điện tử", nhập Tên công ty, Mã số thuế và Địa chỉ. Hóa đơn điện tử hợp lệ theo quy định của Tổng cục Thuế sẽ được gửi qua email cho bạn trong vòng 48 giờ sau khi chuyến xe hoàn thành.'
    },
    {
      id: 'luggage-rules',
      category: 'LUGGAGE',
      question: 'Quy định về trọng lượng và kích thước hành lý xách tay/ký gửi?',
      answer: 'Mỗi hành khách được miễn cước trung bình từ 15kg đến 20kg hành lý (tùy nhà xe). Không mang theo chất dễ cháy nổ, vũ khí hoặc hàng cấm. Nếu bạn mang theo xe máy, xe đạp hoặc hàng hóa cồng kềnh, vui lòng liên hệ nhà xe hoặc tổng đài VEXE trước để xác nhận khoang hành lý còn chỗ trống.'
    },
    {
      id: 'pet-policy',
      category: 'LUGGAGE',
      question: 'Tôi có được mang thú cưng (chó, mèo) lên xe không?',
      answer: 'Theo quy định an toàn giao thông đường bộ, thú cưng không được phép ở khoang hành khách. Một số nhà xe chấp nhận vận chuyển thú cưng trong lồng chuyên dụng đặt tại khoang hành lý có thông gió. Vui lòng liên hệ tổng đài 1900 6868 trước khi đặt vé để được kiểm tra chính xác chính sách của hãng xe đó.'
    },
  ];

  const filteredFaqs = useMemo(() => {
    return faqData.filter(item => {
      const matchCat = activeCategory === 'ALL' || item.category === activeCategory;
      const matchQuery = !searchQuery.trim() || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [activeCategory, searchQuery]);

  const toggleAccordion = (id: string) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full bg-slate-950 text-white font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* Hero Header */}
      <section className="relative pt-24 pb-16 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-64 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-indigo-500/10 blur-[150px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <HelpCircle size={14} className="text-cyan-400" />
            <span>Trung Tâm Trợ Giúp Khách Hàng</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Câu Hỏi Thường Gặp &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Quy Trình Dịch Vụ
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-light">
            Tìm câu trả lời nhanh chóng cho tất cả thắc mắc về cách đặt vé, chính sách hoàn tiền 150%, mang hành lý và thủ tục lên xe.
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhanh câu hỏi (Ví dụ: hoàn tiền 150%, đổi vé, hóa đơn VAT...)"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-900/80 border border-white/15 focus:border-cyan-500 text-white placeholder-slate-400 text-sm focus:outline-none shadow-2xl backdrop-blur-xl transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-6 px-6 sm:px-12 lg:px-8 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQ Accordion List */}
      <section className="py-12 px-6 sm:px-12 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-white/10">
              <p className="text-slate-400 text-sm">Không tìm thấy câu hỏi phù hợp với từ khóa của bạn.</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); }}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isOpen = !!openIds[item.id];
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl transition-all duration-200 border overflow-hidden ${
                    isOpen
                      ? 'bg-slate-900/80 border-cyan-500/40 shadow-xl shadow-cyan-500/5'
                      : 'bg-slate-900/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {item.badge && (
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold tracking-wide shrink-0">
                          {item.badge}
                        </span>
                      )}
                      <span className={`text-base font-bold transition-colors ${isOpen ? 'text-cyan-300' : 'text-white'}`}>
                        {item.question}
                      </span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-slate-300 text-sm leading-relaxed font-light border-t border-white/5">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Still need help CTA */}
      <section className="py-16 px-6 sm:px-12 lg:px-8 max-w-4xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900/70 to-cyan-950/40 border border-cyan-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center sm:text-left">
            <h4 className="text-xl font-bold text-white">Chưa tìm thấy giải đáp cho vấn đề của bạn?</h4>
            <p className="text-slate-400 text-xs sm:text-sm font-light">
              Liên hệ ngay đường dây nóng 24/7 hoặc trò chuyện trực tiếp cùng Trợ lý AI thông minh.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20"
            >
              Liên hệ CSKH
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
