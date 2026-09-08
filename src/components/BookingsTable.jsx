import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { formatCurrency, formatCalendarDate } from '../utils/formatters';

export default function BookingsTable({ 
  bookings, 
  selectedService, 
  setSelectedService, 
  selectedStatus, 
  setSelectedStatus, 
  allServices 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search filter
  const searchedBookings = useMemo(() => {
    if (!searchTerm.trim()) return bookings;
    const term = searchTerm.toLowerCase();

    return bookings.filter((b) => {
      const name = (b.fullName || '').toLowerCase();
      const email = (b.email || '').toLowerCase();
      const phone = (b.phone || '').toLowerCase();
      const service = (b.service || '').toLowerCase();
      const status = (b.status || '').toLowerCase();

      return (
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        service.includes(term) ||
        status.includes(term)
      );
    });
  }, [bookings, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(searchedBookings.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return searchedBookings.slice(start, start + itemsPerPage);
  }, [searchedBookings, currentPage]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!searchedBookings.length) return;

    const headers = ['ID', 'First Name', 'Last Name', 'Full Name', 'Email', 'Phone', 'Service', 'Cost', 'Booking Date', 'Status'];
    const rows = searchedBookings.map((b) => [
      `"${b.id}"`,
      `"${b.firstName || ''}"`,
      `"${b.lastName || ''}"`,
      `"${b.fullName || ''}"`,
      `"${b.email || ''}"`,
      `"${b.phone || ''}"`,
      `"${b.service || ''}"`,
      b.cost,
      `"${b.bookingDate || ''}"`,
      `"${b.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hubspot_bookings_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clean status display without pills
  const renderStatus = (status) => {
    switch (status) {
      case 'visited':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            Visited
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            Confirmed
          </span>
        );
    }
  };

  return (
    <div>
      {/* Table Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Customer Bookings
          </h3>
          <p className="text-xs text-slate-500">
            {searchedBookings.length} records matching current criteria
          </p>
        </div>

        {/* Filter controls without bounding pill boxes */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search bookings..."
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Service filter */}
          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-500"
          >
            <option value="all">All Services</option>
            {allServices.map((srv) => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-slate-500"
          >
            <option value="all">All Statuses</option>
            <option value="visited">Visited</option>
            <option value="Confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Export button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Data: Clean table without bounding boxes */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Email</th>
              <th className="py-3 px-3">Phone</th>
              <th className="py-3 px-3">Service Booked</th>
              <th className="py-3 px-3">Cost</th>
              <th className="py-3 px-3">Booking Date</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400 text-sm">
                  No booking records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name */}
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {b.fullName}
                  </td>

                  {/* Email */}
                  <td className="py-3 px-3 text-slate-600">
                    {b.email}
                  </td>

                  {/* Phone */}
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    {b.phone}
                  </td>

                  {/* Service */}
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {b.service}
                  </td>

                  {/* Cost */}
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {formatCurrency(b.cost)}
                  </td>

                  {/* Date in Google Calendar format */}
                  <td className="py-3 px-3 text-slate-600">
                    {formatCalendarDate(b.bookingDate)}
                  </td>

                  {/* Status (plain text with indicator dot, no pill) */}
                  <td className="py-3 px-3">
                    {renderStatus(b.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalPages}</span> ({searchedBookings.length} total records)
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
