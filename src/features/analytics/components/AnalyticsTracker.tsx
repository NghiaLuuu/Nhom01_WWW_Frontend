import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsService } from '../api/analytics.service';

export const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const startedAt = Date.now();
    let dwellReported = false;
    AnalyticsService.track('PAGE_VIEW');
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
