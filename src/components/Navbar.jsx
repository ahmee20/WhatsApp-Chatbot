import React from 'react';
import { RotateCw, KeyRound } from 'lucide-react';

export default function Navbar({ 
  timeframe, 
  setTimeframe, 
  loading, 
  refresh, 
  onOpenGuide 
}) {
  const timeframes = [
    { id: 'day', label: 'Day (24h)' },
    { id: 'week', label: 'Week (7d)' },
    { id: 'month', label: 'Month (30d)' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            HubSpot CRM Revenue Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Booking performance, actual revenue, and pipeline estimates
          </p>
        </div>

        {/* Controls: Timeframe & Actions */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Timeframe selector: clean minimal tabs, no pills */}
          <div className="flex items-center space-x-1 border-b border-slate-200">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-2 text-xs font-medium transition-colors relative ${
                  timeframe === tf.id
                    ? 'text-slate-900 font-semibold border-b-2 border-slate-900 -mb-px'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Sync button */}
            <button
              onClick={refresh}
              disabled={loading}
              title="Sync Latest Data"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-900' : ''}`} />
              <span>Sync</span>
            </button>

            {/* Credentials button */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Credentials</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
