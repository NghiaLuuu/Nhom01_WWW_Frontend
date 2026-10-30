import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Sparkles, X, CheckCircle2, ChevronRight, Compass } from 'lucide-react';
import { geolocationService, type UserLocationResult } from '../../../services/geolocation.service';

interface LocationPermissionModalProps {
  onLocationGranted?: (location: UserLocationResult) => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ onLocationGranted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successLocation, setSuccessLocation] = useState<UserLocationResult | null>(null);
  const [showManualPick, setShowManualPick] = useState(false);

  useEffect(() => {
    const status = geolocationService.getPermissionStatus();
    const stored = geolocationService.getStoredLocation();

    // If user has not decided yet, prompt politely after 1.5s
    if (status === 'prompt' && !stored) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllowLocation = async () => {
    setLoading(true);
    try {
      const res = await geolocationService.requestLocation();
      setSuccessLocation(res);
      if (onLocationGranted) onLocationGranted(res);
      setTimeout(() => {
        setIsOpen(false);
      }, 1600);
    } catch (err) {
      // If browser permission denied or error, fallback to manual selection
      setShowManualPick(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSelect = (city: string, displayName: string) => {
    geolocationService.setManualCity(city, displayName);
    const result: UserLocationResult = {
      city,
      displayName,
      latitude: 10.7769,
      longitude: 106.7009
    };
    setSuccessLocation(result);
    if (onLocationGranted) onLocationGranted(result);
    setTimeout(() => {
      setIsOpen(false);
    }, 1200);
  };

  const handleDismiss = () => {
    geolocationService.dismissPermission();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-4 sm:left-6 z-40 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-[420px] animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="relative rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/40 p-6 shadow-2xl shadow-cyan-950/50 text-slate-100 overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Đóng"
        >
          <X size={18} />
        </button>

        {successLocation ? (
          <div className="flex flex-col items-center text-center py-3 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-1">
              <CheckCircle2 size={26} className="animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-white">Đã Nhận Diện Vị Trí Thành Công!</h4>
            <p className="text-sm text-cyan-300 font-medium">
              📍 {successLocation.displayName}
            </p>
            <p className="text-xs text-slate-400">
              Các chuyến xe khởi hành gần bạn đã được ưu tiên hiển thị.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-950/40">
                <Navigation size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300 mb-1">
                  <Sparkles size={12} className="text-cyan-400" />
                  <span>Cá nhân hóa theo vị trí</span>
                </div>
                <h4 className="text-base font-bold text-white leading-tight">
                  Bật vị trí để nhận đề xuất chuẩn xác?
                </h4>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              VEXE sử dụng vị trí của bạn để tự động ưu tiên các chuyến xe khởi hành từ tỉnh/thành phố hiện tại đến các điểm đến yêu thích, giúp bạn không cần tìm kiếm thủ công.
            </p>

            {/* Actions */}
            {showManualPick ? (
              <div className="space-y-2 pt-1 border-t border-white/10">
                <p className="text-xs text-slate-400 font-medium">Hoặc chọn nhanh thành phố của bạn:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { city: 'TP.HCM', label: 'TP. Hồ Chí Minh' },
                    { city: 'Hà Nội', label: 'Hà Nội' },
                    { city: 'Đà Nẵng', label: 'Đà Nẵng' },
                    { city: 'Cần Thơ', label: 'Cần Thơ' }
                  ].map((c) => (
                    <button
                      key={c.city}
                      onClick={() => handleManualSelect(c.city, c.label)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-950/30 text-xs font-semibold text-slate-200 transition-all text-left flex items-center justify-between"
                    >
                      <span>{c.label}</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleAllowLocation}
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-950/40 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <MapPin size={16} />
                  <span>{loading ? 'Đang định vị...' : 'Bật vị trí & Nhận đề xuất'}</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all"
                >
                  Để sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
