import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { formatCurrency, formatPercentage } from '../utils/formatters';

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-md text-xs min-w-[170px]">
        <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: data.fill }} />
          {data.category}
        </p>
        <div className="space-y-1 text-slate-600">
          <div className="flex justify-between">
            <span>Bookings:</span>
            <strong className="text-slate-900">{data.count}</strong>
          </div>
          <div className="flex justify-between">
            <span>Rate:</span>
            <strong className="text-slate-900">{formatPercentage(data.rate)}</strong>
          </div>
          <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
            <span>Revenue Impact:</span>
            <span className="font-semibold text-slate-800">{formatCurrency(data.revenue)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function CancellationChart({ breakdown, kpis }) {
  const total = kpis.totalBookings || 1;

  const barData = [
    {
      category: 'Visited (Attended)',
      count: kpis.visitedCount,
      rate: (kpis.visitedCount / total) * 100,
      revenue: kpis.actualRevenue,
      fill: '#059669', // Emerald
    },
    {
      category: 'Confirmed (Upcoming)',
      count: kpis.confirmedCount,
      rate: (kpis.confirmedCount / total) * 100,
      revenue: Math.max(0, kpis.estimatedRevenue - kpis.actualRevenue),
      fill: '#2563eb', // Blue
    },
    {
      category: 'Cancelled',
      count: kpis.cancelledCount,
      rate: kpis.cancellationRate,
      revenue: kpis.cancelledRevenue,
      fill: '#e11d48', // Red / Rose
    },
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Cancellation vs Booking Rate</h3>
          <p className="text-xs text-slate-500">Comparison of booking completion, confirmation, and dropouts</p>
        </div>
        <span className="text-xs text-slate-500">
          Total: <strong className="text-slate-900">{kpis.totalBookings}</strong>
        </span>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis 
              type="number" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              type="category"
              dataKey="category"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={130}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={22}>
              {barData.map((entry, index) => (
                <Cell key={`bar-cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Numerical summary row */}
      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
        <div>
          <div className="text-slate-500">Visited Rate</div>
          <div className="font-bold text-slate-900 mt-0.5">{formatPercentage((kpis.visitedCount / total) * 100)}</div>
          <div className="text-[11px] text-emerald-600 font-medium">{kpis.visitedCount} attended</div>
        </div>
        <div>
          <div className="text-slate-500">Confirmed Rate</div>
          <div className="font-bold text-slate-900 mt-0.5">{formatPercentage((kpis.confirmedCount / total) * 100)}</div>
          <div className="text-[11px] text-blue-600 font-medium">{kpis.confirmedCount} scheduled</div>
        </div>
        <div>
          <div className="text-slate-500">Cancellation Rate</div>
          <div className="font-bold text-slate-900 mt-0.5">{formatPercentage(kpis.cancellationRate)}</div>
          <div className="text-[11px] text-rose-600 font-medium">{kpis.cancelledCount} dropped</div>
        </div>
      </div>
    </div>
  );
}
