import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { type Trip } from '../../admin/api/trip.service';
import { BookingService } from '../api/booking.service';
import { TripList } from '../components/TripList';
import { AnalyticsService } from '../../analytics/api/analytics.service';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const departure = searchParams.get('departure') || '';
  const arrival = searchParams.get('arrival') || '';
  const date = searchParams.get('date') || '';
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filterDeparture, setFilterDeparture] = useState(departure);
  const [filterArrival, setFilterArrival] = useState(arrival);
  const [filterDate, setFilterDate] = useState(date);
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [floorFilter, setFloorFilter] = useState<'all' | 'lower' | 'upper'>('all');

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (filterDeparture) params.set('departure', filterDeparture);
    if (filterArrival) params.set('arrival', filterArrival);
    if (filterDate) params.set('date', filterDate);
    setSearchParams(params);
  };

  const filteredTrips = trips.filter(trip => {
    if (timeFilter === 'all') return true;
    const hour = new Date(trip.departureTime).getHours();
    if (timeFilter === 'morning') return hour >= 5 && hour < 12;
    if (timeFilter === 'afternoon') return hour >= 12 && hour < 18;
    return hour >= 18 || hour < 5;
  });

  useEffect(() => {
    if (departure && arrival) {
      AnalyticsService.track('SEARCH_TRIPS', {
        departure,
        arrival,
        departureDate: date,
        searchKeyword: `${departure} - ${arrival}`,
        source: 'search_page',
      });
    }

    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const res = await BookingService.searchTrips(departure, arrival, date);
        if (res.success) {
          setTrips(res.data);
        }
      } catch (error) {
        console.error('Lỗi tải chuyến xe:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [departure, arrival, date]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <form onSubmit={submitSearch} className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <input value={filterDeparture} onChange={event => setFilterDeparture(event.target.value)} placeholder="Điểm đi" className="rounded-lg border p-2 text-sm" />
        <input value={filterArrival} onChange={event => setFilterArrival(event.target.value)} placeholder="Điểm đến" className="rounded-lg border p-2 text-sm" />
        <input type="date" value={filterDate} onChange={event => setFilterDate(event.target.value)} className="rounded-lg border p-2 text-sm" />
        <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Tra cứu</button>
      </form>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3">
        <span className="mr-2 text-sm font-semibold text-gray-700">Thời gian khởi hành:</span>
        {([
          ['all', 'Tất cả'],
          ['morning', 'Buổi sáng (05:00–12:00)'],
          ['afternoon', 'Buổi chiều (12:00–18:00)'],
          ['evening', 'Buổi tối (18:00–05:00)'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTimeFilter(value)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              timeFilter === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3">
        <span className="mr-2 text-sm font-semibold text-gray-700">Tầng còn chỗ:</span>
        {([
          ['all', 'Tất cả'],
          ['lower', 'Tầng dưới (A)'],
          ['upper', 'Tầng trên (B)'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFloorFilter(value)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              floorFilter === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {departure && arrival ? `Vé xe từ ${departure} đi ${arrival}` : 'Tất cả chuyến xe'}
        </h1>
        {date && <p className="text-gray-500 mt-1">Ngày đi: {new Date(date).toLocaleDateString('vi-VN')}</p>}
      </div>

      <TripList trips={filteredTrips} isLoading={isLoading} floorFilter={floorFilter} />
    </div>
  );
};
