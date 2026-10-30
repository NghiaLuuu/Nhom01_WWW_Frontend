import { dispatchTrackAction } from '../hooks/useUserTracker';

export interface UserLocationResult {
  city: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

interface TransportHub {
  city: string;
  displayName: string;
  lat: number;
  lng: number;
  maxRadiusKm: number;
}

const TRANSPORT_HUBS: TransportHub[] = [
  { city: 'TP.HCM', displayName: 'TP. Hồ Chí Minh', lat: 10.7769, lng: 106.7009, maxRadiusKm: 90 },
  { city: 'Phú Yên', displayName: 'Phú Yên (Tuy Hòa)', lat: 13.0882, lng: 109.3148, maxRadiusKm: 60 },
  { city: 'Hà Nội', displayName: 'Hà Nội', lat: 21.0285, lng: 105.8542, maxRadiusKm: 90 },
  { city: 'Đà Nẵng', displayName: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, maxRadiusKm: 60 },
  { city: 'Cần Thơ', displayName: 'Cần Thơ', lat: 10.0452, lng: 105.7469, maxRadiusKm: 70 },
  { city: 'Nha Trang', displayName: 'Nha Trang (Khánh Hòa)', lat: 12.2388, lng: 109.1967, maxRadiusKm: 50 },
  { city: 'Đà Lạt', displayName: 'Đà Lạt (Lâm Đồng)', lat: 11.9404, lng: 108.4583, maxRadiusKm: 50 },
  { city: 'Hải Phòng', displayName: 'Hải Phòng', lat: 20.8449, lng: 106.6881, maxRadiusKm: 50 },
  { city: 'Vũng Tàu', displayName: 'Bà Rịa - Vũng Tàu', lat: 10.3460, lng: 107.0843, maxRadiusKm: 50 },
  { city: 'Huế', displayName: 'Thừa Thiên Huế', lat: 16.4637, lng: 107.5909, maxRadiusKm: 50 },
  { city: 'Buôn Ma Thuột', displayName: 'Đắk Lắk', lat: 12.6675, lng: 108.0383, maxRadiusKm: 60 },
  { city: 'Quy Nhơn', displayName: 'Bình Định', lat: 13.7820, lng: 109.2194, maxRadiusKm: 50 },
  { city: 'Phan Thiết', displayName: 'Bình Thuận', lat: 10.9289, lng: 108.1021, maxRadiusKm: 50 }
];

// Haversine distance in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function resolveNearestTransportHub(lat: number, lng: number): { city: string; displayName: string } {
  let nearestHub = TRANSPORT_HUBS[0];
  let minDistance = calculateDistanceKm(lat, lng, TRANSPORT_HUBS[0].lat, TRANSPORT_HUBS[0].lng);

  for (const hub of TRANSPORT_HUBS) {
    const d = calculateDistanceKm(lat, lng, hub.lat, hub.lng);
    if (d < minDistance) {
      minDistance = d;
      nearestHub = hub;
    }
  }

  // If outside transport hubs coverage, still match nearest hub
  return {
    city: nearestHub.city,
    displayName: nearestHub.displayName
  };
}

export const geolocationService = {
  getStoredLocation: (): UserLocationResult | null => {
    try {
      const city = localStorage.getItem('vexe_user_city');
      const displayName = localStorage.getItem('vexe_user_city_display') || city;
      const lat = localStorage.getItem('vexe_user_lat');
      const lng = localStorage.getItem('vexe_user_lng');

      if (city) {
        return {
          city,
          displayName: displayName || city,
          latitude: lat ? parseFloat(lat) : 10.7769,
          longitude: lng ? parseFloat(lng) : 106.7009
        };
      }
    } catch {
      // ignore
    }
    return null;
  },

  getPermissionStatus: (): 'granted' | 'denied' | 'prompt' | 'dismissed' => {
    try {
      const status = localStorage.getItem('vexe_geo_status');
      if (status === 'granted' || status === 'denied' || status === 'dismissed') {
        return status;
      }
    } catch {
      // ignore
    }
    return 'prompt';
  },

  dismissPermission: () => {
    try {
      localStorage.setItem('vexe_geo_status', 'dismissed');
      window.dispatchEvent(new CustomEvent('vexe_geo_status_changed', { detail: { status: 'dismissed' } }));
    } catch {
      // ignore
    }
  },

  clearLocation: () => {
    try {
      localStorage.removeItem('vexe_user_city');
      localStorage.removeItem('vexe_user_city_display');
      localStorage.removeItem('vexe_user_lat');
      localStorage.removeItem('vexe_user_lng');
      localStorage.removeItem('vexe_geo_status');
      window.dispatchEvent(new CustomEvent('vexe_location_updated', { detail: null }));
    } catch {
      // ignore
    }
  },

  setManualCity: (city: string, displayName?: string) => {
    try {
      localStorage.setItem('vexe_user_city', city);
      localStorage.setItem('vexe_user_city_display', displayName || city);
      localStorage.setItem('vexe_geo_status', 'granted');
      dispatchTrackAction('MANUAL_LOCATION_SET', { city, displayName: displayName || city });
      window.dispatchEvent(new CustomEvent('vexe_location_updated', { detail: { city, displayName: displayName || city } }));
    } catch {
      // ignore
    }
  },

  requestLocation: async (): Promise<UserLocationResult> => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Trình duyệt không hỗ trợ Geolocation'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // 1. Resolve nearest transport hub in Vietnam
          const resolved = resolveNearestTransportHub(lat, lng);

          // 2. Persist to localStorage
          localStorage.setItem('vexe_user_city', resolved.city);
          localStorage.setItem('vexe_user_city_display', resolved.displayName);
          localStorage.setItem('vexe_user_lat', lat.toString());
          localStorage.setItem('vexe_user_lng', lng.toString());
          localStorage.setItem('vexe_geo_status', 'granted');

          const result: UserLocationResult = {
            city: resolved.city,
            displayName: resolved.displayName,
            latitude: lat,
            longitude: lng
          };

          // 3. Dispatch global tracking & UI event
          dispatchTrackAction('LOCATION_GRANTED', {
            city: resolved.city,
            displayName: resolved.displayName,
            latitude: lat,
            longitude: lng
          });

          window.dispatchEvent(new CustomEvent('vexe_location_updated', { detail: result }));
          resolve(result);
        },
        (error) => {
          localStorage.setItem('vexe_geo_status', 'denied');
          dispatchTrackAction('LOCATION_DENIED', { code: error.code, message: error.message });
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    });
  }
};

