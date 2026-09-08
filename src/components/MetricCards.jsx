import React from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export default function MetricCards({ kpis, timeframe }) {
  const timeframeLabel = {
    day: 'past 24h',
    week: 'past 7 days',
    month: 'past 30 days',
    all: 'all-time'
  }[timeframe] || 'period';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-2">
      {/* 1. ACTUAL REVENUE */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          Actual Revenue
        </div>
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {formatCurrency(kpis.actualRevenue)}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          <span className="font-semibold text-emerald-600">{kpis.visitedCount} attended</span> bookings
        </div>
      </div>

      {/* 2. ESTIMATED REVENUE */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          Estimated Revenue
        </div>
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {formatCurrency(kpis.estimatedRevenue)}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          <span className="font-semibold text-blue-600">{kpis.visitedCount + kpis.confirmedCount} active</span> bookings
        </div>
      </div>

      {/* 3. TOTAL BOOKINGS */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          Total Bookings
        </div>
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {kpis.totalBookings}
        </div>
        <div className="text-xs text-slate-500 mt-1 flex gap-2">
          <span>{kpis.visitedCount} visited</span> &bull; 
          <span>{kpis.confirmedCount} confirmed</span> &bull; 
          <span>{kpis.cancelledCount} cancelled</span>
        </div>
      </div>

      {/* 4. CANCELLATION RATE */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          Cancellation Rate
        </div>
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {formatPercentage(kpis.cancellationRate)}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          <span className="text-rose-600 font-semibold">{kpis.cancelledCount} bookings cancelled</span> ({formatCurrency(kpis.cancelledRevenue)} loss)
        </div>
      </div>
    </div>
  );
}
