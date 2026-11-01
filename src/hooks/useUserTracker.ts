import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { trackingService } from '../services/tracking.service';

const ANON_KEY = 'vexe_anon_id';
const SESSION_KEY = 'vexe_session_id';
const IDLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes idle threshold
const HEARTBEAT_INTERVAL_MS = 8 * 1000; // Heartbeat every 8s for live real-time sync

function getPageTitleForUrl(pathname: string): string {
  if (pathname === '/') return 'Trang Chủ - Đặt Vé Xe Khách VEXE';
  if (pathname.startsWith('/search')) return 'Tìm Kiếm & Tra Cứu Chuyến Xe';
  if (pathname.startsWith('/checkout')) return 'Thanh Toán & Đặt Chỗ';
  if (pathname.startsWith('/booking-success')) return 'Đặt Vé Thành Công';
  if (pathname.startsWith('/profile')) return 'Hồ Sơ Thành Viên & Vé Của Tôi';
  if (pathname.startsWith('/login')) return 'Đăng Nhập Khách Hàng';
  if (pathname.startsWith('/register')) return 'Đăng Ký Tài Khoản';
  if (pathname.startsWith('/about')) return 'Giới Thiệu VEXE 5 Sao';
  if (pathname.startsWith('/contact')) return 'Liên Hệ & Hỗ Trợ 24/7';
  if (pathname.startsWith('/faq')) return 'Câu Hỏi Thường Gặp & Chính Sách';
  return document.title || 'VEXE - Chuẩn Mực Vận Tải 5 Sao';
}

function getOrCreateAnonymousId(): string {
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = 'anon-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

function detectTrafficSource(): { source: string; campaign?: string } {
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmCampaign = params.get('utm_campaign') || params.get('campaign');

    if (utmSource) {
      return { source: utmSource.toLowerCase(), campaign: utmCampaign || undefined };
    }

    const ref = document.referrer;
    if (ref) {
      if (ref.includes('facebook.com') || ref.includes('fb.com')) return { source: 'facebook' };
      if (ref.includes('google.com')) return { source: 'google' };
      if (ref.includes('zalo.me')) return { source: 'zalo' };
      if (ref.includes('tiktok.com')) return { source: 'tiktok' };
      return { source: 'referral' };
    }
  } catch (e) {
    // ignore
  }
  return { source: 'direct' };
}

const isValidUuid = (val?: string) => !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

// Global hook & action dispatcher
export function useUserTracker() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  const sessionIdRef = useRef<string | null>(sessionStorage.getItem(SESSION_KEY));
  const pageViewIdRef = useRef<string | null>(null);
  const previousUrlRef = useRef<string | null>(null);

  const lastActivityRef = useRef<number>(Date.now());
  const isTabVisibleRef = useRef<boolean>(!document.hidden);
  const deltaActiveSecondsRef = useRef<number>(0);
  const deltaIdleSecondsRef = useRef<number>(0);

  // Initialize session
  const initSession = useCallback(async () => {
    try {
      const anonId = getOrCreateAnonymousId();
      const { source, campaign } = detectTrafficSource();
      const customerId = isValidUuid(user?.id) ? user?.id : undefined;

      const data = await trackingService.trackSession({
        anonymousId: anonId,
        customerId: customerId || undefined,
        trafficSource: source,
        utmCampaign: campaign,
        userAgent: navigator.userAgent
      });

      if (data?.sessionId) {
        sessionIdRef.current = data.sessionId;
        sessionStorage.setItem(SESSION_KEY, data.sessionId);
      }
    } catch (err) {
      console.warn('[useUserTracker] Session init warning:', err);
    }
  }, [user?.id]);

  // Merge customer when login state changes
  useEffect(() => {
    if (isAuthenticated && user?.id && isValidUuid(user.id) && sessionIdRef.current) {
      trackingService.mergeCustomer(sessionIdRef.current, user.id).catch(() => {});
    }
  }, [isAuthenticated, user?.id]);

  // Page View listener on route change
  useEffect(() => {
    const handleRouteChange = async () => {
      if (!sessionIdRef.current) {
        await initSession();
      }

      if (!sessionIdRef.current) return;

      // Flush accumulated dwell time for prior pageview before switching
      if (pageViewIdRef.current && (deltaActiveSecondsRef.current > 0 || deltaIdleSecondsRef.current > 0)) {
        const act = deltaActiveSecondsRef.current;
        const idle = deltaIdleSecondsRef.current;
        deltaActiveSecondsRef.current = 0;
        deltaIdleSecondsRef.current = 0;
        trackingService.sendHeartbeat({
          sessionId: sessionIdRef.current,
          pageViewId: pageViewIdRef.current,
          additionalActiveSeconds: act,
          additionalIdleSeconds: idle
        }).catch(() => {});
      }

      try {
        const currentTitle = getPageTitleForUrl(location.pathname);
        const pv = await trackingService.trackPageView({
          sessionId: sessionIdRef.current,
          pageUrl: location.pathname + location.search,
          pageTitle: currentTitle,
          previousPageUrl: previousUrlRef.current || undefined
        });

        if (pv?.pageViewId) {
          pageViewIdRef.current = pv.pageViewId;
        }
        previousUrlRef.current = location.pathname + location.search;
      } catch (err) {
        console.warn('[useUserTracker] PageView warning:', err);
      }
    };

    handleRouteChange();
  }, [location.pathname, location.search, initSession]);

  // Section Dwell Time Observation (IntersectionObserver)
  useEffect(() => {
    const sectionDwellMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        const now = Date.now();
        entries.forEach((entry) => {
          const sectionId = entry.target.id || entry.target.getAttribute('data-track-section');
          if (!sectionId) return;

          if (entry.isIntersecting) {
            sectionDwellMap.set(sectionId, now);
          } else {
            const enterTime = sectionDwellMap.get(sectionId);
            if (enterTime) {
              const dwellMs = now - enterTime;
              const dwellSeconds = Math.round(dwellMs / 1000);
              sectionDwellMap.delete(sectionId);

              // If user paused to read for 2 seconds or more
              if (dwellSeconds >= 2 && sessionIdRef.current) {
                trackingService.trackAction({
                  sessionId: sessionIdRef.current,
                  pageViewId: pageViewIdRef.current || undefined,
                  actionType: 'SECTION_DWELL',
                  payload: JSON.stringify({
                    sectionId,
                    dwellSeconds,
                    pageUrl: location.pathname
                  })
                }).catch(() => {});
              }
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    // Observe all sections and data-track-section elements
    const elements = document.querySelectorAll('section[id], [data-track-section]');
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [location.pathname]);

  // Transition & Click Attribution Listener
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !sessionIdRef.current) return;

      const buttonOrLink = target.closest('button, a, [role="button"]');
      if (buttonOrLink) {
        const el = buttonOrLink as HTMLElement;
        const sourceElement = el.id || el.getAttribute('data-track') || el.innerText?.trim().slice(0, 40) || 'unknown_element';
        const sourceType = el.tagName.toLowerCase();
        const href = (el as HTMLAnchorElement).href;

        // Track click element
        trackingService.trackAction({
          sessionId: sessionIdRef.current,
          pageViewId: pageViewIdRef.current || undefined,
          actionType: 'CLICK_ELEMENT',
          payload: JSON.stringify({
            sourceElement,
            sourceType,
            fromUrl: location.pathname,
            toUrl: href || undefined
          })
        }).catch(() => {});
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [location.pathname]);

  // User Activity & Idle Detection (5-minute rule)
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });
    window.addEventListener('click', updateActivity, { passive: true });
    window.addEventListener('touchstart', updateActivity, { passive: true });

    const handleVisibilityChange = () => {
      isTabVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        lastActivityRef.current = Date.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 1-second ticker to count active vs idle time
    const ticker = setInterval(() => {
      const now = Date.now();
      const isVisible = isTabVisibleRef.current;
      const isUserIdle = (now - lastActivityRef.current) > IDLE_THRESHOLD_MS;

      if (isVisible && !isUserIdle) {
        deltaActiveSecondsRef.current += 1;
      } else {
        deltaIdleSecondsRef.current += 1;
      }
    }, 1000);

    // Heartbeat transmitter
    const heartbeatTimer = setInterval(() => {
      if (!sessionIdRef.current) return;
      const active = deltaActiveSecondsRef.current;
      const idle = deltaIdleSecondsRef.current;

      if (active > 0 || idle > 0) {
        deltaActiveSecondsRef.current = 0;
        deltaIdleSecondsRef.current = 0;

        trackingService.sendHeartbeat({
          sessionId: sessionIdRef.current,
          pageViewId: pageViewIdRef.current || undefined,
          additionalActiveSeconds: active,
          additionalIdleSeconds: idle
        }).catch(() => {});
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(ticker);
      clearInterval(heartbeatTimer);
    };
  }, []);

  // Action tracking helper
  const trackAction = useCallback(async (actionType: string, payload?: any) => {
    if (!sessionIdRef.current) {
      await initSession();
    }
    if (!sessionIdRef.current) return;

    try {
      const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
      await trackingService.trackAction({
        sessionId: sessionIdRef.current,
        pageViewId: pageViewIdRef.current || undefined,
        actionType,
        payload: payloadStr
      });
      window.dispatchEvent(new CustomEvent('vexe_tracking_action', { detail: { actionType, payload } }));
    } catch (e) {
      console.warn('[useUserTracker] trackAction warning:', e);
    }
  }, [initSession]);

  return { trackAction };
}

// Global action helper for use outside React hooks
export async function dispatchTrackAction(actionType: string, payload?: any) {
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) return;
  try {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
    await trackingService.trackAction({
      sessionId,
      actionType,
      payload: payloadStr
    });
    window.dispatchEvent(new CustomEvent('vexe_tracking_action', { detail: { actionType, payload } }));
  } catch (e) {
    // silent
  }
}
