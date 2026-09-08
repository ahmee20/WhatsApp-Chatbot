import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { generateClientMockBookings } from '../utils/mockData';

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [apiInfo, setApiInfo] = useState(null);

  // Filters
  const [timeframe, setTimeframe] = useState('month'); // 'day' | 'week' | 'month' | 'all'
  const [selectedService, setSelectedService] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusRes = await axios.get('/api/status').catch(() => null);
      if (statusRes?.data) {
        setApiInfo(statusRes.data);
      }

      const res = await axios.get('/api/bookings');
      if (res.data?.data) {
        setBookings(res.data.data);
        setIsMock(Boolean(res.data.isMock));
        if (res.data.error) {
          setError(res.data.error);
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.warn('Backend proxy fetch failed, falling back to client mock generator', err.message);
      const fallback = generateClientMockBookings();
      setBookings(fallback);
      setIsMock(true);
      setError('Could not connect to HubSpot backend proxy. Using sample CRM dataset.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filtered dataset based on timeframe, service, and status
  const filteredBookings = useMemo(() => {
    const now = new Date();
    
    return bookings.filter((b) => {
      const bDate = new Date(b.bookingDate);
      if (isNaN(bDate.getTime())) return true;

      // 1. Timeframe filter
      if (timeframe === 'day') {
        // Last 24 hours / today
        const diffHours = (now - bDate) / (1000 * 60 * 60);
        if (diffHours < -24 || diffHours > 24) return false;
      } else if (timeframe === 'week') {
        // Last 7 days
        const diffDays = (now - bDate) / (1000 * 60 * 60 * 24);
        if (diffDays < -2 || diffDays > 7) return false;
      } else if (timeframe === 'month') {
        // Last 30 days
        const diffDays = (now - bDate) / (1000 * 60 * 60 * 24);
        if (diffDays < -3 || diffDays > 30) return false;
      }

      // 2. Service filter
      if (selectedService !== 'all' && b.service !== selectedService) {
        return false;
      }

      // 3. Status filter
      if (selectedStatus !== 'all' && b.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [bookings, timeframe, selectedService, selectedStatus]);

  // Extract distinct service names for filter dropdown
  const allServices = useMemo(() => {
    const set = new Set();
    bookings.forEach((b) => {
      if (b.service) set.add(b.service);
    });
    return Array.from(set).sort();
  }, [bookings]);

  // Aggregated KPIs
  const kpis = useMemo(() => {
    let actualRevenue = 0;
    let estimatedRevenue = 0;
    let totalBookings = filteredBookings.length;
    let visitedCount = 0;
    let confirmedCount = 0;
    let cancelledCount = 0;
    let cancelledRevenue = 0;

    filteredBookings.forEach((b) => {
      const cost = Number(b.cost) || 0;
      const status = b.status;

      if (status === 'visited') {
        actualRevenue += cost;
        visitedCount++;
      } else if (status === 'Confirmed') {
        confirmedCount++;
      } else if (status === 'cancelled') {
        cancelledCount++;
        cancelledRevenue += cost;
      }

      // Estimated revenue: sum of all records except cancelled
      if (status !== 'cancelled') {
        estimatedRevenue += cost;
      }
    });

    const cancellationRate = totalBookings > 0 ? (cancelledCount / totalBookings) * 100 : 0;
    const visitedRate = totalBookings > 0 ? (visitedCount / totalBookings) * 100 : 0;
    const confirmedRate = totalBookings > 0 ? (confirmedCount / totalBookings) * 100 : 0;

    return {
      actualRevenue,
      estimatedRevenue,
      cancelledRevenue,
      totalBookings,
      visitedCount,
      confirmedCount,
      cancelledCount,
      cancellationRate,
      visitedRate,
      confirmedRate,
    };
  }, [filteredBookings]);

  // Breakdown by Service for Charts
  const revenueByService = useMemo(() => {
    const map = {};

    filteredBookings.forEach((b) => {
      const s = b.service || 'Other';
      if (!map[s]) {
        map[s] = {
          service: s,
          actualRevenue: 0,
          estimatedRevenue: 0,
          totalBookings: 0,
          visitedBookings: 0,
          cancelledBookings: 0,
          confirmedBookings: 0,
        };
      }

      const cost = Number(b.cost) || 0;
      map[s].totalBookings++;

      if (b.status === 'visited') {
        map[s].actualRevenue += cost;
        map[s].visitedBookings++;
      } else if (b.status === 'Confirmed') {
        map[s].confirmedBookings++;
      } else if (b.status === 'cancelled') {
        map[s].cancelledBookings++;
      }

      if (b.status !== 'cancelled') {
        map[s].estimatedRevenue += cost;
      }
    });

    return Object.values(map).sort((a, b) => b.estimatedRevenue - a.estimatedRevenue);
  }, [filteredBookings]);

  // Timeline aggregations for Actual & Estimated Revenue graphs
  const timeSeriesData = useMemo(() => {
    const buckets = {};

    filteredBookings.forEach((b) => {
      const d = new Date(b.bookingDate);
      if (isNaN(d.getTime())) return;

      // Format bucket key according to timeframe
      let key = '';
      let displayLabel = '';

      if (timeframe === 'day') {
        // Group by hour
        const hour = d.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
        key = `${String(hour).padStart(2, '0')}:00`;
        displayLabel = `${formattedHour} ${ampm}`;
      } else {
        // Group by date (MM/DD)
        const month = d.toLocaleString('en-US', { month: 'short' });
        const day = d.getDate();
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        displayLabel = `${month} ${day}`;
      }

      if (!buckets[key]) {
        buckets[key] = {
          key,
          label: displayLabel,
          timestamp: d.getTime(),
          actualRevenue: 0,
          estimatedRevenue: 0,
          visited: 0,
          confirmed: 0,
          cancelled: 0,
          total: 0,
        };
      }

      const cost = Number(b.cost) || 0;
      buckets[key].total++;

      if (b.status === 'visited') {
        buckets[key].actualRevenue += cost;
        buckets[key].visited++;
      } else if (b.status === 'Confirmed') {
        buckets[key].confirmed++;
      } else if (b.status === 'cancelled') {
        buckets[key].cancelled++;
      }

      if (b.status !== 'cancelled') {
        buckets[key].estimatedRevenue += cost;
      }
    });

    return Object.values(buckets).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredBookings, timeframe]);

  // Breakdown for Cancellation vs Booking Rate
  const bookingStatusBreakdown = useMemo(() => {
    return [
      { name: 'Visited (Completed)', value: kpis.visitedCount, color: '#10b981', revenue: kpis.actualRevenue },
      { name: 'Confirmed (Upcoming)', value: kpis.confirmedCount, color: '#3b82f6', revenue: kpis.estimatedRevenue - kpis.actualRevenue },
      { name: 'Cancelled', value: kpis.cancelledCount, color: '#ef4444', revenue: kpis.cancelledRevenue },
    ];
  }, [kpis]);

  return {
    bookings,
    filteredBookings,
    loading,
    error,
    isMock,
    apiInfo,
    refresh: fetchBookings,
    // Filters & Setters
    timeframe,
    setTimeframe,
    selectedService,
    setSelectedService,
    selectedStatus,
    setSelectedStatus,
    allServices,
    // Metrics & Aggregations
    kpis,
    revenueByService,
    timeSeriesData,
    bookingStatusBreakdown,
  };
}
