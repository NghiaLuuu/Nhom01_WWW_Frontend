import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsService } from '../api/analytics.service';

const getTabName = (pathname: string): string => {
  if (pathname === '/') return 'Trang chủ';
  if (pathname.startsWith('/search')) return 'Tra cứu / Tìm vé';
  if (pathname.startsWith('/schedule')) return 'Lịch trình';
  if (pathname.startsWith('/checkout')) return 'Thanh toán';
  if (pathname.startsWith('/booking-success')) return 'Đặt vé thành công';
  if (pathname.startsWith('/login')) return 'Đăng nhập';
  if (pathname.startsWith('/register')) return 'Đăng ký';
  if (pathname.startsWith('/forgot-password')) return 'Quên mật khẩu';
  if (pathname === '/profile') return 'Hồ sơ cá nhân';
  return pathname;
};

export const AnalyticsTracker = () => {
  const location = useLocation();
  const prevLocationRef = useRef<string | null>(null);

  useEffect(() => {
    // Only track customer-facing routes, skip admin management pages
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    const startedAt = Date.now();
    let dwellReported = false;
    const currentFullPath = `${location.pathname}${location.search}`;
    const prevFullPath = prevLocationRef.current;

    // Track tab switch if user transitioned from an internal page
    if (prevFullPath && prevFullPath !== currentFullPath) {
      const fromTab = getTabName(prevFullPath.split('?')[0]);
      const toTab = getTabName(location.pathname);

      AnalyticsService.track('TAB_SWITCH', {
        fromPath: prevFullPath,
        toPath: currentFullPath,
        fromTab,
        toTab,
        transition: `${fromTab} ➔ ${toTab}`,
      });
    }

    // Track page view with custom referrer pointing to previous internal route if available
    AnalyticsService.track('PAGE_VIEW', undefined, undefined, prevFullPath || undefined);
    prevLocationRef.current = currentFullPath;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const dwellTimeSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
        AnalyticsService.track('DWELL_TIME', { dwellTimeSeconds, reason: 'visibility_hidden' }, dwellTimeSeconds);
        dwellReported = true;
        AnalyticsService.flushWithBeacon();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      const dwellTimeSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      if (!dwellReported) {
        AnalyticsService.track('DWELL_TIME', { dwellTimeSeconds }, dwellTimeSeconds);
      }
    };
  }, [location.pathname, location.search]);

  return null;
};
