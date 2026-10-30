import { api } from '../../../services/api';
import { useAuthStore } from '../../../store/useAuthStore';

export type AnalyticsAction =
  | 'PAGE_VIEW'
  | 'TAB_SWITCH'
  | 'DWELL_TIME'
  | 'CLICK_EVENT'
  | 'SEARCH_TRIP'
  | 'SEARCH_TRIPS'
  | 'VIEW_SEATS'
  | 'SELECT_SEAT'
  | 'FILL_INFO'
  | 'BOOK_SUCCESS'
  | 'ABANDON_BOOKING'
  | 'FUNNEL_STEP'
  | 'CHATBOT_OPEN'
  | 'CHATBOT_CLOSE'
  | 'CHATBOT_QUESTION'
  | 'CHATBOT_RESPONSE';

export interface AnalyticsEvent {
  sessionId: string;
  visitorId: string;
  userId?: string;
  userEmail?: string;
  actionType: AnalyticsAction;
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  dwellTimeSeconds?: number;
  eventData?: Record<string, unknown>;
}

const VISITOR_ID_KEY = 'analytics-visitor-id';
const SESSION_ID_KEY = 'analytics-session-id';
const MAX_BATCH_SIZE = 100;
const FLUSH_INTERVAL_MS = 5000;
let queue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushInProgress: Promise<void> | null = null;

const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getOrCreate = (storage: Storage, key: string): string => {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const id = createId();
  storage.setItem(key, id);
  return id;
};

const getIds = () => ({
  visitorId: getOrCreate(localStorage, VISITOR_ID_KEY),
  sessionId: getOrCreate(sessionStorage, SESSION_ID_KEY),
});

export const AnalyticsService = {
  track: (
    actionType: AnalyticsAction,
    eventData?: Record<string, unknown>,
    dwellTimeSeconds?: number,
    referrerOverride?: string,
  ) => {
    if (typeof window === 'undefined') return;

    // Do not track admin management views to avoid polluting customer behavior analytics
    const pathname = window.location.pathname;
    if (pathname.startsWith('/admin')) {
      return;
    }

    // Do not track actions performed by Admin or Staff members
    const currentUser = useAuthStore.getState().user;
    const isStaffOrAdmin = currentUser?.roles?.some(
      (r) => r === 'ROLE_ADMIN' || r === 'ROLE_STAFF' || r === 'ADMIN' || r === 'STAFF',
    );
    if (isStaffOrAdmin) {
      return;
    }

    const ids = getIds();
    const event: AnalyticsEvent = {
      ...ids,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      actionType,
      pageUrl: `${window.location.pathname}${window.location.search}`,
      pageTitle: document.title.slice(0, 255),
      referrer: referrerOverride || (document.referrer.slice(0, 2048) || undefined),
      dwellTimeSeconds,
      eventData,
    };
    queue.push(event);
    scheduleFlush();
  },

  trackBatch: async (events: AnalyticsEvent[]) => {
    if (events.length === 0) return;
    for (let index = 0; index < events.length; index += MAX_BATCH_SIZE) {
      try {
        await api.post('/analytics/events/batch', {
          events: events.slice(index, index + MAX_BATCH_SIZE),
        });
      } catch (error) {
        console.warn('Không thể gửi dữ liệu phân tích hành vi:', error);
      }
    }
  },

  flush: async () => {
    if (flushInProgress || queue.length === 0) return flushInProgress;
    const events = queue.splice(0, queue.length);
    flushInProgress = AnalyticsService.trackBatch(events)
      .catch(() => {
        queue = [...events, ...queue];
      })
      .finally(() => {
        flushInProgress = null;
      });
    return flushInProgress;
  },

  flushWithBeacon: () => {
    if (queue.length === 0) return;
    if (typeof navigator.sendBeacon !== 'function') {
      void AnalyticsService.flush();
      return;
    }
    const events = queue.splice(0, queue.length);
    const body = JSON.stringify({ events });
    const accepted = navigator.sendBeacon(
      `${api.defaults.baseURL || ''}/analytics/events/batch`,
      new Blob([body], { type: 'application/json' }),
    );
    if (!accepted) queue = [...events, ...queue];
  },
};

const scheduleFlush = () => {
  if (flushTimer !== null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void AnalyticsService.flush();
  }, FLUSH_INTERVAL_MS);
  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      if (queue.length >= MAX_BATCH_SIZE) void AnalyticsService.flush();
    }, 0);
  }
};

if (typeof window !== 'undefined') {
  window.setInterval(() => void AnalyticsService.flush(), FLUSH_INTERVAL_MS);
  window.addEventListener('beforeunload', () => AnalyticsService.flushWithBeacon());
}
