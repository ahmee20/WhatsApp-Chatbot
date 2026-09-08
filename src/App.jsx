import React, { useState } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import RevenueCharts from './components/RevenueCharts';
import ServiceChart from './components/ServiceChart';
import CancellationChart from './components/CancellationChart';
import BookingsTable from './components/BookingsTable';
import HubSpotGuideModal from './components/HubSpotGuideModal';
import { useBookings } from './hooks/useBookings';

export default function App() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const {
    filteredBookings,
    loading,
    refresh,
    timeframe,
    setTimeframe,
    selectedService,
    setSelectedService,
    selectedStatus,
    setSelectedStatus,
    allServices,
    kpis,
    revenueByService,
    timeSeriesData,
    bookingStatusBreakdown,
  } = useBookings();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        loading={loading}
        refresh={refresh}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 py-6">
        {/* KPI Metrics */}
        <MetricCards kpis={kpis} timeframe={timeframe} />

        {/* Dedicated Revenue Graphs (Actual vs Estimated Revenue) */}
        <div className="my-8">
          <RevenueCharts timeSeriesData={timeSeriesData} timeframe={timeframe} />
        </div>

        {/* Charts: Pie for Revenue by Service & Bar for Cancellation vs Booking Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
          <ServiceChart revenueByService={revenueByService} />
          <CancellationChart breakdown={bookingStatusBreakdown} kpis={kpis} />
        </div>

        {/* Bookings Data Table */}
        <div className="my-8">
          <BookingsTable
            bookings={filteredBookings}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            allServices={allServices}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-100 text-center text-xs text-slate-400">
        HubSpot CRM Booking & Revenue Dashboard
      </footer>

      {/* HubSpot Credentials Modal */}
      <HubSpotGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
