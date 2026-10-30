import { api } from './api';

export interface TrackSessionPayload {
  anonymousId: string;
  customerId?: string;
  trafficSource?: string;
  utmCampaign?: string;
  userAgent?: string;
}

export interface TrackPageViewPayload {
  sessionId: string;
  pageUrl: string;
  pageTitle: string;
  previousPageUrl?: string;
}

export interface TrackHeartbeatPayload {
  sessionId?: string;
  pageViewId?: string;
  additionalActiveSeconds: number;
  additionalIdleSeconds: number;
}

export interface TrackActionPayload {
  sessionId: string;
  pageViewId?: string;
  actionType: string;
  payload?: string;
}

export interface PageStatDto {
  pageUrl: string;
  viewCount: number;
  avgActiveSeconds: number;
  avgIdleSeconds: number;
}

export interface RecentSessionDto {
  sessionId: string;
  anonymousId: string;
  customerId?: string;
  ipAddress: string;
  trafficSource: string;
  totalDurationSeconds: number;
  createdAt: string;
  pageViewCount: number;
  actionCount: number;
}

export interface TrackingAnalyticsResponse {
  totalSessions: number;
  uniqueVisitors: number;
  avgSessionDurationSeconds: number;
  trafficSources: Record<string, number>;
  actionBreakdown: Record<string, number>;
  topPages: PageStatDto[];
  recentSessions: RecentSessionDto[];
}

export interface JourneyEventDto {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  activeSeconds?: number;
  idleSeconds?: number;
  metadata?: string;
}

export interface JourneyClusterDto {
  journeyId: string;
  title: string;
  status: 'CONVERTED' | 'ABANDONED' | 'IN_PROGRESS' | string;
  targetRoute: string;
  trafficSource: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  activeSeconds: number;
  idleSeconds: number;
  customerIdentified: boolean;
  events: JourneyEventDto[];
}

export interface CustomerJourneyTimelineDto {
  identifier: string;
  customerName: string;
  customerEmail: string;
  isRegisteredCustomer?: boolean;
  linkedAnonymousIds?: string[];
  totalSessions: number;
  totalPageViews: number;
  totalActions: number;
  matchedPersona: string;
  events: JourneyEventDto[];
  journeys?: JourneyClusterDto[];
}

export interface LiveRecommendedTripDto {
  tripId: number;
  route: string;
  departureTime: string;
  price: string;
  vehicleType: string;
}

export interface LiveVisitorDto {
  sessionId: string;
  anonymousId: string;
  customerId?: string;
  isRegisteredCustomer: boolean;
  customerName?: string;
  customerEmail?: string;
  ipAddress: string;
  userAgent?: string;
  deviceType?: string;
  trafficSource?: string;
  utmCampaign?: string;
  currentPageUrl?: string;
  currentPageTitle?: string;
  activeSecondsOnPage: number;
  idleSecondsOnPage: number;
  lastActivityTime?: string;
  lastActionType?: string;
  lastActionPayload?: string;
  matchedPersona?: string;
  recommendedTrips?: LiveRecommendedTripDto[];
}

export interface SessionPageViewDto {
  id: string;
  pageUrl: string;
  pageTitle: string;
  enteredAt: string;
  activeSeconds: number;
  idleSeconds: number;
}

export interface SessionActionDto {
  id: string;
  actionType: string;
  payload: string;
  createdAt: string;
}

export interface LiveVisitorDetailDto {
  visitor: LiveVisitorDto;
  isOnline: boolean;
  pageViews: SessionPageViewDto[];
  actions: SessionActionDto[];
}

export interface LiveVisitorsSummaryResponse {
  totalOnline: number;
  registeredOnline: number;
  guestOnline: number;
  checkedAt: string;
  visitors: LiveVisitorDto[];
}

export const trackingService = {
  trackSession: async (payload: TrackSessionPayload) => {
    const res = await api.post('/tracking/session', payload);
    return res.data?.data;
  },

  trackPageView: async (payload: TrackPageViewPayload) => {
    const res = await api.post('/tracking/pageview', payload);
    return res.data?.data;
  },

  sendHeartbeat: async (payload: TrackHeartbeatPayload) => {
    const res = await api.post('/tracking/heartbeat', payload);
    return res.data?.data;
  },

  trackAction: async (payload: TrackActionPayload) => {
    const res = await api.post('/tracking/action', payload);
    return res.data?.data;
  },

  mergeCustomer: async (sessionId: string, customerId: string) => {
    const res = await api.post('/tracking/merge-customer', { sessionId, customerId });
    return res.data?.data;
  },

  getAnalyticsOverview: async (): Promise<TrackingAnalyticsResponse> => {
    const res = await api.get('/admin/tracking/analytics');
    return res.data?.data;
  },

  getCustomerJourney: async (identifier: string): Promise<CustomerJourneyTimelineDto> => {
    const res = await api.get(`/admin/tracking/journey/${identifier}`);
    return res.data?.data;
  },

  getLiveVisitors: async (minutes = 5): Promise<LiveVisitorsSummaryResponse> => {
    const res = await api.get(`/admin/tracking/live-visitors?minutes=${minutes}`);
    return res.data?.data;
  },

  getLiveVisitorDetail: async (sessionId: string): Promise<LiveVisitorDetailDto> => {
    const res = await api.get(`/admin/tracking/live-visitors/${sessionId}`);
    return res.data?.data;
  },

  getRecentSessions: async (limit = 30) => {
    const res = await api.get(`/admin/tracking/sessions?limit=${limit}`);
    return res.data?.data;
  }
};

