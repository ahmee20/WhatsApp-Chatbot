import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatCurrency } from '../utils/formatters';

const COLORS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#d97706', // Amber
  '#0284c7', // Sky
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#ea580c', // Orange
  '#64748b', // Slate
];

const CustomPieTooltip = ({ active, payload, revenueType }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-md text-xs min-w-[180px]">
        <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: data.color }} />
          {data.service}
        </p>
        <div className="space-y-1 text-slate-600">
          <div className="flex justify-between">
            <span>Actual (Visited):</span>
            <strong className="text-slate-900">{formatCurrency(data.actualRevenue)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Estimated Total:</span>
            <strong className="text-slate-900">{formatCurrency(data.estimatedRevenue)}</strong>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
            <span>Total Bookings:</span>
            <span>{data.totalBookings}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function ServiceChart({ revenueByService }) {
  const [revenueType, setRevenueType] = useState('estimatedRevenue'); // 'estimatedRevenue' | 'actualRevenue'

  const chartData = revenueByService.map((item, index) => ({
    ...item,
    value: item[revenueType] || 0,
    color: COLORS[index % COLORS.length]
  }));

  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Revenue by Service</h3>
          <p className="text-xs text-slate-500">Breakdown of revenue across booked services</p>
        </div>
        {/* Toggle between Estimated & Actual revenue for the pie chart */}
        <div className="flex items-center space-x-1 text-xs">
          <button
            onClick={() => setRevenueType('estimatedRevenue')}
            className={`px-2.5 py-1 transition-colors ${
              revenueType === 'estimatedRevenue'
                ? 'font-bold text-slate-900 border-b border-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Estimated Revenue
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => setRevenueType('actualRevenue')}
            className={`px-2.5 py-1 transition-colors ${
              revenueType === 'actualRevenue'
                ? 'font-bold text-slate-900 border-b border-slate-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Actual Revenue
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        {chartData.length === 0 || totalRevenue === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            No service revenue data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip revenueType={revenueType} />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="service"
                cx="50%"
                cy="50%"
                outerRadius={85}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`service-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
        {chartData.slice(0, 6).map((item) => (
          <div key={item.service} className="flex items-center gap-1.5 truncate">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="truncate text-slate-600" title={item.service}>
              {item.service}
            </span>
            <span className="text-slate-400 text-[11px] ml-auto">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
