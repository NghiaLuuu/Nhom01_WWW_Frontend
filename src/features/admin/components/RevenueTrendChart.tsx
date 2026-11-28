import { useId } from 'react';
import type { RevenueReport } from '../api/revenue-report.service';

export const RevenueTrendChart = ({ points, groupBy, formatMoney }: {
  points: RevenueReport['trend'];
  groupBy: 'DAY' | 'MONTH';
  formatMoney: (value: number) => string;
}) => {
  const titleId = useId();
  if (!points.length || points.every(point => point.paymentCount === 0)) {
    return <p className="py-16 text-center text-sm text-slate-400">Chưa có giao dịch thành công trong kỳ đã chọn.</p>;
  }
  const max = Math.max(...points.map(point => Number(point.amount)), 1);
  const x = (index: number) => 75 + (points.length === 1 ? 295 : index * 590 / (points.length - 1));
  const y = (amount: number) => 190 - amount / max * 155;
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(Number(point.amount))}`).join(' ');
  const label = (date: string) => groupBy === 'MONTH' ? `${date.slice(5, 7)}/${date.slice(0, 4)}` : `${date.slice(8, 10)}/${date.slice(5, 7)}`;

  return <>
    <svg viewBox="0 0 700 230" className="w-full" role="img" aria-labelledby={titleId}>
      <title id={titleId}>Số tiền thanh toán thành công theo {groupBy === 'DAY' ? 'ngày' : 'tháng'} tạo giao dịch. Số liệu chi tiết ở bảng bên dưới.</title>
      {[0, 0.5, 1].map(ratio => <g key={ratio}>
        <line x1="75" x2="665" y1={y(max * ratio)} y2={y(max * ratio)} stroke="#334155" />
        <text x="68" y={y(max * ratio) + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(max * ratio)}</text>
      </g>)}
      <path d={path} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((point, index) => <g key={point.periodStart}>
        {points.length <= 32 && <circle cx={x(index)} cy={y(Number(point.amount))} r="3.5" fill="#22d3ee"><title>{label(point.periodStart)}: {formatMoney(point.amount)} ({point.paymentCount} giao dịch)</title></circle>}
        {(index === 0 || index === points.length - 1 || index % Math.max(1, Math.ceil(points.length / 6)) === 0) && <text x={x(index)} y="214" textAnchor="middle" fill="#94a3b8" fontSize="10">{label(point.periodStart)}</text>}
      </g>)}
    </svg>
    <details className="text-xs text-slate-300">
      <summary className="cursor-pointer font-medium text-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Xem số liệu theo kỳ</summary>
      <div className="mt-3 max-h-48 overflow-auto"><table className="w-full text-left">
        <thead className="text-slate-100"><tr><th className="py-2">Kỳ</th><th className="py-2 text-right">Số tiền</th><th className="py-2 text-right">Giao dịch</th></tr></thead>
        <tbody>{points.map(point => <tr key={point.periodStart} className="border-t border-slate-700"><td className="py-1.5">{label(point.periodStart)}</td><td className="text-right">{formatMoney(point.amount)}</td><td className="text-right">{point.paymentCount}</td></tr>)}</tbody>
      </table></div>
    </details>
  </>;
};
