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
    <aside aria-label="Yêu cầu vị trí" className="fixed top-20 left-4 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-[340px] max-w-[360px] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="relative rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 p-4 shadow-2xl shadow-cyan-950/60 text-slate-100 overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Đóng"
        >
          <X size={15} />
        </button>

        {successLocation ? (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 size={18} className="animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white">Đã nhận diện vị trí</h4>
              <p className="text-xs text-cyan-300 font-semibold truncate">
                📍 {successLocation.displayName}
              </p>
              <p className="text-[11px] text-slate-400">Đã ưu tiên các chuyến xe gần bạn nhất</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Header Badge & Title */}
            <div className="flex items-start gap-2.5 pr-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-600/25 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Navigation size={16} className="animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-semibold text-cyan-300 mb-0.5">
                  <Sparkles size={10} className="text-cyan-400" />
                  <span>Cá nhân hóa vị trí</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Bật vị trí nhận đề xuất chuẩn?
                </h4>
              </div>
            </div>

            {/* Description */}
            <p className="text-[11px] sm:text-xs text-slate-300 leading-snug font-light">
              Tự động ưu tiên chuyến xe khởi hành từ tỉnh/thành của bạn đến điểm đến phổ biến.
            </p>

            {/* Actions */}
            {showManualPick ? (
              <div className="space-y-1.5 pt-1.5 border-t border-white/10">
                <p className="text-[11px] text-slate-400 font-medium">Hoặc chọn nhanh vị trí của bạn:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { city: 'TP.HCM', label: 'TP.HCM' },
                    { city: 'Hà Nội', label: 'Hà Nội' },
                    { city: 'Đà Nẵng', label: 'Đà Nẵng' },
                    { city: 'Phú Yên', label: 'Phú Yên' }
                  ].map((c) => (
                    <button
                      key={c.city}
                      onClick={() => handleManualSelect(c.city, c.label)}
                      className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-950/40 text-[11px] font-semibold text-slate-200 transition-all text-left flex items-center justify-between"
                    >
                      <span className="truncate">{c.label}</span>
                      <ChevronRight size={12} className="text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleAllowLocation}
                  disabled={loading}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-950/40 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <MapPin size={13} />
                  <span>{loading ? 'Đang định vị...' : 'Bật vị trí'}</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all"
                >
                  Để sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
