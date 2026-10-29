import React, { useEffect, useState } from 'react';
import { BookingService, type RouteLocations } from '../api/booking.service';
import { RouteService, type Route } from '../../admin/api/route.service';
import { Search } from 'lucide-react';

export const SchedulePage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [locations, setLocations] = useState<RouteLocations>({ departures: [], arrivals: [] });
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    Promise.all([RouteService.getAll(), BookingService.getRouteLocations()]).then(([routeResponse, locationResponse]) => {
      setRoutes(routeResponse.data || []);
      setLocations(locationResponse.data);
    }).catch(error => console.error('Không thể tải lịch trình:', error));
  }, []);

  const visibleRoutes = searched
    ? routes.filter(route =>
      (!departure || route.departureLocation.toLowerCase() === departure.toLowerCase())
      && (!arrival || route.arrivalLocation.toLowerCase() === arrival.toLowerCase()))
    : routes;

  const formatDuration = (minutes?: number) => {
    if (minutes === undefined || minutes === null) return 'Chưa cập nhật';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours} giờ${remainingMinutes ? ` ${remainingMinutes} phút` : ''}`
      : `${remainingMinutes} phút`;
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Lịch trình tuyến xe</h1>
        <p className="mb-6 text-gray-500">Tra cứu các tuyến xe đang có trong hệ thống.</p>
        <form onSubmit={event => { event.preventDefault(); setSearched(true); }} className="mb-8 grid gap-3 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-3">
          <label className="text-sm font-semibold text-gray-700">Điểm đi
            <input list="schedule-departures" value={departure} onChange={event => setDeparture(event.target.value)} className="mt-1 w-full rounded-lg border p-3 font-normal" placeholder="Chọn điểm đi" />
          </label>
          <label className="text-sm font-semibold text-gray-700">Điểm đến
            <input list="schedule-arrivals" value={arrival} onChange={event => setArrival(event.target.value)} className="mt-1 w-full rounded-lg border p-3 font-normal" placeholder="Chọn điểm đến" />
          </label>
          <button className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"><Search size={18} /> Tìm tuyến</button>
          <datalist id="schedule-departures">{locations.departures.map(item => <option key={item} value={item} />)}</datalist>
          <datalist id="schedule-arrivals">{locations.arrivals.map(item => <option key={item} value={item} />)}</datalist>
        </form>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-4 font-semibold">#</th>
                <th className="px-5 py-4 font-semibold">Điểm đi</th>
                <th className="px-5 py-4 font-semibold">Điểm đến</th>
                <th className="px-5 py-4 font-semibold">Thời gian dự kiến</th>
                <th className="px-5 py-4 font-semibold">Quãng đường</th>
                <th className="px-5 py-4 text-right font-semibold">Giá từ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleRoutes.map((route, index) => (
                <tr key={route.id} className="hover:bg-blue-50/50">
                  <td className="px-5 py-4 text-gray-500">{index + 1}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">{route.departureLocation}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">{route.arrivalLocation}</td>
                  <td className="px-5 py-4 text-gray-600">{formatDuration(route.durationMinutes)}</td>
                  <td className="px-5 py-4 text-gray-600">
                    {route.distanceKm !== undefined && route.distanceKm !== null ? `${route.distanceKm} km` : 'Chưa cập nhật'}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-blue-600">
                    {new Intl.NumberFormat('vi-VN').format(route.basePrice)}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleRoutes.length === 0 && <p className="p-8 text-center text-gray-500">Không tìm thấy tuyến phù hợp.</p>}
        </div>
      </div>
    </div>
  );
};
