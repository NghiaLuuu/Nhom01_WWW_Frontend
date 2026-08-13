import React from 'react';
import { Bus, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bus className="text-blue-500" size={28} />
              <span className="text-2xl font-bold text-white tracking-tight">VEXE</span>
            </div>
            <p className="text-sm leading-relaxed">
              Hệ thống đặt vé xe trực tuyến hàng đầu, mang lại trải nghiệm tiện lợi, an toàn và nhanh chóng.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Về chúng tôi</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tin tức</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Hướng dẫn đặt vé</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Chính sách hủy vé</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <MapPin size={16} className="text-blue-500" />
                <span>12 Nguyễn Văn Bảo, Gò Vấp, HCM</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-blue-500" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-blue-500" />
                <span>support@vexe.vn</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          © 2026 VEXE. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
