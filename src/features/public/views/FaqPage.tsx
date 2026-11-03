import React, { useState, useMemo } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { HelpCircle, ChevronDown, Search, ShieldCheck, CreditCard, Luggage, RefreshCw, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicAiTripShelf } from '../../booking/components/PublicAiTripShelf';

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
      answer: 'VEXE hỗ trợ đa dạng phương thức thanh toán bảo mật chuẩn PCI-DSS: Thẻ ATM nội địa qua cổng VNPAY, Thẻ quốc tế Visa/Mastercard, Ví điện tử MoMo và ZaloPay. Mọi giao dịch đều được mã hóa bằng giao thức SSL an toàn tuyệt đối.'
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
    <div className="w-full bg-[#0b1120] text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Hero Header */}
      <section className="relative pt-20 pb-12 px-6 sm:px-12 lg:px-8 max-w-7xl mx-auto">
        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle size={14} className="text-blue-400" />
            <span>Trung Tâm Giải Đáp Thắc Mắc</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Câu Hỏi{' '}
            <span className="text-blue-400">
              Thường Gặp (FAQ)
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
            Tìm câu trả lời nhanh chóng cho các thắc mắc phổ biến về quy trình đặt vé, thanh toán, chính sách hoàn tiền 150% và quy định hành lý khi lên xe.
          </p>

          {/* Quick Search Input */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập từ khóa cần tìm: hoàn tiền, đổi vé, hành lý, thanh toán..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main FAQ Content Section */}
      <section className="py-10 px-6 sm:px-12 lg:px-8 max-w-5xl mx-auto">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Accordion Questions List */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-800 border border-slate-700 text-slate-400">
              <HelpCircle size={32} className="mx-auto mb-3 text-slate-500" />
              <h3 className="text-base font-bold text-white mb-1">Không tìm thấy câu trả lời phù hợp</h3>
              <p className="text-xs">Thử tìm kiếm với từ khóa khác hoặc liên hệ trực tiếp tổng đài hỗ trợ 24/7 của chúng tôi.</p>
              <Link
                to="/contact"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <MessageSquare size={14} />
                <span>Gửi câu hỏi hỗ trợ</span>
              </Link>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = !!openIds[faq.id];
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shadow-sm transition-colors"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-750 transition-colors"
                  >
                    <div className="space-y-1 pr-2">
                      {faq.badge && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25 uppercase mb-1">
                          {faq.badge}
                        </span>
                      )}
                      <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div className={`w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-400' : ''}`}>
                      <ChevronDown size={16} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-700/80">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Still Need Help Box */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-slate-800 border border-slate-700 text-center space-y-4">
          <h3 className="text-lg font-bold text-white">Bạn vẫn cần thêm thông tin giải đáp?</h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            Tổng đài chăm sóc khách hàng 1900 6868 luôn sẵn sàng hỗ trợ giải đáp mọi thắc mắc và giải quyết khiếu nại của bạn 24/7.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm"
            >
              Liên hệ CSKH 24/7
            </Link>
            <a
              href="tel:19006868"
              className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-200 font-semibold text-xs sm:text-sm transition-colors"
            >
              Gọi hotline: 1900 6868
            </a>
          </div>
        </div>

      </section>

      {/* Recommended Trips Shelf */}
      <PublicAiTripShelf
        title="Các Chuyến Xe Cam Kết Giữ Chỗ & Hoàn Tiền 150%"
        subtitle="Hệ thống tổng hợp các tuyến xe được bảo chứng dịch vụ và áp dụng chính sách bồi thường 150% minh bạch."
        badgeLabel="AN TÂM 100%"
        pageContext="FAQ"
        className="border-t border-slate-800"
      />

    </div>
  );
};
