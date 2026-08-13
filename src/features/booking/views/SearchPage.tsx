import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { type Trip } from '../../admin/api/trip.service';
import { BookingService } from '../api/booking.service';
import { TripList } from '../components/TripList';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const departure = searchParams.get('departure') || '';
  const arrival = searchParams.get('arrival') || '';
  const date = searchParams.get('date') || '';

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {departure && arrival ? `Vé xe từ ${departure} đi ${arrival}` : 'Tất cả chuyến xe'}
        </h1>
        {date && <p className="text-gray-500 mt-1">Ngày đi: {new Date(date).toLocaleDateString('vi-VN')}</p>}
      </div>

      <TripList trips={trips} isLoading={isLoading} />
    </div>
  );
};
