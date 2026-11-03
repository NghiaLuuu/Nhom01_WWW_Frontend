import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Sparkles, X, CheckCircle2, ChevronDown, Gift } from 'lucide-react';
import { geolocationService, type UserLocationResult } from '../../../services/geolocation.service';

export const DEMO_CITIES = [
  { city: 'TP.HCM', label: 'TP. Hồ Chí Minh', note: 'Trung tâm / Đi làm' },
  { city: 'Phú Yên', label: 'Phú Yên (Tuy Hòa)', note: 'Quê hương / Thăm nhà' },
  { city: 'Đà Nẵng', label: 'Đà Nẵng', note: 'Điểm đến trung gian' },
  { city: 'Nha Trang', label: 'Nha Trang (Khánh Hòa)', note: 'Du lịch biển' },
  { city: 'Đà Lạt', label: 'Đà Lạt (Lâm Đồng)', note: 'Du lịch nghỉ dưỡng' },
  { city: 'Hà Nội', label: 'Hà Nội', note: 'Thủ đô / Miền Bắc' },
  { city: 'Cần Thơ', label: 'Cần Thơ', note: 'Miền Tây sông nước' },
  { city: 'Vũng Tàu', label: 'Bà Rịa - Vũng Tàu', note: 'Du lịch ngắn ngày' },
  { city: 'Quy Nhơn', label: 'Quy Nhơn (Bình Định)', note: 'Duyên hải Nam Trung Bộ' },
  { city: 'Huế', label: 'Thừa Thiên Huế', note: 'Cố đô di sản' }
];

interface LocationPermissionModalProps {
  onLocationGranted?: (location: UserLocationResult) => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ onLocationGranted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successLocation, setSuccessLocation] = useState<UserLocationResult | null>(null);
  const [isNewGuest, setIsNewGuest] = useState<boolean>(() => geolocationService.isNewGuest());

  useEffect(() => {
    const status = geolocationService.getPermissionStatus();
    const stored = geolocationService.getStoredLocation();

    if (status === 'prompt' && !stored) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleGuestTypeUpdate = (e: any) => {
      if (typeof e.detail?.isNewGuest === 'boolean') {
        setIsNewGuest(e.detail.isNewGuest);
      }
    };
    const handleOpenModal = () => setIsOpen(true);

    window.addEventListener('vexe_guest_type_updated', handleGuestTypeUpdate);
    window.addEventListener('vexe_open_location_modal', handleOpenModal);
    return () => {
      window.removeEventListener('vexe_guest_type_updated', handleGuestTypeUpdate);
      window.removeEventListener('vexe_open_location_modal', handleOpenModal);
    };
  }, []);

  const handleAllowLocation = async () => {
    setLoading(true);
    try {
      const res = await geolocationService.requestLocation();
      setSuccessLocation(res);
      if (onLocationGranted) onLocationGranted(res);
      setTimeout(() => {
        setIsOpen(false);
      }, 1400);
    } catch {
      setLoading(false);
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
    }, 800);
  };

  const handleToggleNewGuest = (checked: boolean) => {
    geolocationService.setNewGuest(checked);
    setIsNewGuest(checked);
  };

  const handleDismiss = () => {
    geolocationService.dismissPermission();
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <aside 
      aria-label="Cá nhân hóa vị trí và gợi ý tuyến xe"
      className="fixed bottom-6 left-6 z-40 max-w-sm w-[calc(100vw-3rem)] font-sans"
    >
      <div className="relative rounded-2xl bg-slate-800 border border-slate-700 shadow-xl p-4 sm:p-5 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          title="Đóng thông báo"
        >
          <X size={16} />
        </button>

        {successLocation ? (
          <div className="flex items-center gap-3 py-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white">Đã nhận diện vị trí</h4>
              <p className="text-xs text-cyan-400 font-semibold truncate">
                📍 {successLocation.displayName}
              </p>
              <p className="text-[11px] text-slate-300">Đã cập nhật lịch xe gần bạn nhất</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header Badge & Title */}
            <div className="flex items-start gap-2.5 pr-5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Navigation size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[10px] font-semibold text-cyan-300 mb-0.5">
                  <Sparkles size={10} className="text-cyan-400" />
                  <span>Tìm xe gần bạn</span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                  Bật vị trí nhận đề xuất lịch xe?
                </h4>
              </div>
            </div>

            {/* Description */}
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
              Tự động gợi ý chuyến xe từ tỉnh/thành của bạn đến các điểm du lịch & công tác phổ biến.
            </p>

            {/* Action Buttons: GPS & Dismiss */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={handleAllowLocation}
                disabled={loading}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <MapPin size={13} />
                <span>{loading ? 'Đang định vị...' : 'Bật vị trí (GPS)'}</span>
              </button>
              <button
                onClick={handleDismiss}
                className="py-2 px-3 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Để sau
              </button>
            </div>

            {/* Demo Simulator Combobox */}
            <div className="pt-2 border-t border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <span>Hoặc chọn vị trí nhanh:</span>
                </span>
                <span className="text-[10px] text-slate-400">Chọn tỉnh/thành</span>
              </div>
              <div className="relative">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const cityVal = e.target.value;
                    if (!cityVal) return;
                    const found = DEMO_CITIES.find(c => c.city === cityVal);
                    if (found) handleManualSelect(found.city, found.label);
                  }}
                  className="w-full py-1.5 pl-8 pr-7 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-medium appearance-none focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                >
                  <option value="" disabled className="text-slate-500">
                    -- Chọn điểm xuất phát --
                  </option>
                  {DEMO_CITIES.map((c) => (
                    <option key={c.city} value={c.city} className="bg-slate-900 text-slate-100">
                      📍 {c.label} ({c.note})
                    </option>
                  ))}
                </select>
                <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* New Guest Simulator Checkbox */}
            <div className="pt-2 border-t border-slate-700">
              <label 
                className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors cursor-pointer border select-none ${
                  isNewGuest
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' 
                    : 'bg-slate-900/60 border-slate-700/80 hover:bg-slate-900'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isNewGuest}
                  onChange={(e) => handleToggleNewGuest(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-600 text-blue-500 focus:ring-blue-500 cursor-pointer shrink-0 accent-blue-600"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold flex items-center gap-1 text-white">
                      <Gift size={13} className="text-amber-400" />
                      <span>Tôi là khách đặt vé lần đầu</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                      -25% Vé
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                    Nhận mã giảm giá 25% cho chuyến đi đầu tiên và cẩm nang đặt vé an toàn.
                  </p>
                </div>
              </label>
            </div>

          </div>
        )}
      </div>
    </aside>
  );
};
