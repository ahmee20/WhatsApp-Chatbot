import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';

const CustomLightTooltip = ({ active, payload, label, mode }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    const isActual = mode === 'actual';

    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-md text-xs">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: isActual ? '#059669' : '#d97706' }}
          />
          <span className="text-slate-600">
            {isActual ? 'Actual Revenue:' : 'Estimated Revenue:'}
          </span>
          <span className="font-bold text-slate-900">
            {formatCurrency(value)}
          </span>
        </div>
        <div className="mt-1 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
          {isActual ? (
            <span>Visited: {data.visited}</span>
          ) : (
            <span>Pipeline: {data.visited + data.confirmed}</span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function RevenueCharts({ timeSeriesData, timeframe }) {
  const timeframeHint = {
    day: 'Hourly (24h)',
    week: 'Daily (7d)',
    month: 'Daily (30d)',
    all: 'All-time',
  }[timeframe] || '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 1. ACTUAL REVENUE GRAPH */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Actual Revenue Trend</h3>
            <p className="text-xs text-slate-500">Visited records only</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">{timeframeHint}</span>
        </div>

        <div className="h-64 w-full pt-2">
          {timeSeriesData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No visited records in this timeframe
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="lightActualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompactCurrency}
                />
                <Tooltip content={<CustomLightTooltip mode="actual" />} />
                <Area
                  type="monotone"
                  dataKey="actualRevenue"
                  name="Actual Revenue"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#lightActualGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. ESTIMATED REVENUE GRAPH */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Estimated Revenue Trend</h3>
            <p className="text-xs text-slate-500">All records except cancelled</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">{timeframeHint}</span>
        </div>

        <div className="h-64 w-full pt-2">
          {timeSeriesData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              No booking records in this timeframe
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="lightEstimatedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompactCurrency}
                />
                <Tooltip content={<CustomLightTooltip mode="estimated" />} />
                <Area
                  type="monotone"
                  dataKey="estimatedRevenue"
                  name="Estimated Revenue"
                  stroke="#d97706"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#lightEstimatedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
