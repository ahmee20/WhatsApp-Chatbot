import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Configuration from environment
const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const PROP_SERVICE = process.env.HUBSPOT_PROP_SERVICE || 'services';
const PROP_COST = process.env.HUBSPOT_PROP_COST || 'service_cost';
const PROP_DATE = process.env.HUBSPOT_PROP_BOOKING_DATE || 'booking_date';
const PROP_STATUS = process.env.HUBSPOT_PROP_BOOKING_STATUS || 'booking_status';

/**
 * Standardize status strings into canonical values: 'Confirmed' | 'visited' | 'cancelled'
 */
export function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'Confirmed';
  const s = String(rawStatus).trim().toLowerCase();
  if (s === 'visited' || s === 'completed' || s === 'attended') {
    return 'visited';
  }
  if (s === 'cancelled' || s === 'canceled') {
    return 'cancelled';
  }
  return 'Confirmed';
}

/**
 * Generate comprehensive sample mock data matching real HubSpot contact formats
 */
export function generateMockBookings() {
  const services = [
    { name: 'Strategy Consultation', cost: 250 },
    { name: 'Comprehensive Audit', cost: 600 },
    { name: 'VIP Advisory Session', cost: 450 },
    { name: 'Standard Follow-up', cost: 120 },
    { name: 'Implementation Workshop', cost: 850 },
    { name: 'Diagnostic Assessment', cost: 300 }
  ];

  const firstNames = ['Sarah', 'James', 'Elena', 'Michael', 'Priya', 'David', 'Emma', 'Carlos', 'Amina', 'Robert', 'Lisa', 'Daniel', 'Fatima', 'Lucas', 'Chloe', 'Alexander', 'Maya', 'Liam'];
  const lastNames = ['Chen', 'Smith', 'Rostova', 'Miller', 'Patel', 'Johnson', 'Watson', 'Garcia', 'Al-Mansoor', 'Taylor', 'Davis', 'Brown', 'Khan', 'Dubois', 'Vanderbilt', 'Wilson', 'Kim', 'O\'Connor'];
  const domains = ['gmail.com', 'outlook.com', 'acme-corp.com', 'innovate.io', 'techstart.org', 'globalventures.com'];

  const now = new Date();
  const bookings = [];

  // Generate 85 realistic bookings across the last 45 days
  for (let i = 0; i < 85; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const srv = services[Math.floor(Math.random() * services.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`;
    const phone = `+1 (${Math.floor(200 + Math.random() * 700)}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate date between 40 days ago and 5 days into future
    const dayOffset = Math.floor(Math.random() * 45) - 40;
    const bookingDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    // Random hour between 9:00 AM and 5:00 PM
    bookingDate.setHours(9 + Math.floor(Math.random() * 8), [0, 15, 30, 45][Math.floor(Math.random() * 4)], 0, 0);

    // Realistic status distribution:
    // Past dates: high visited rate (65%), some cancelled (20%), some confirmed/no-show (15%)
    // Future dates: mostly confirmed (85%), some cancelled (15%)
    let status;
    const isPast = bookingDate < now;
    const rand = Math.random();

    if (isPast) {
      if (rand < 0.65) status = 'visited';
      else if (rand < 0.85) status = 'cancelled';
      else status = 'Confirmed';
    } else {
      if (rand < 0.85) status = 'Confirmed';
      else status = 'cancelled';
    }

    // Add slight variance to cost
    const costVariance = Math.round((Math.random() * 40 - 20) / 10) * 10;
    const finalCost = Math.max(80, srv.cost + costVariance);

    bookings.push({
      id: `mock-${1000 + i}`,
      email,
      firstName: fn,
      lastName: ln,
      fullName: `${fn} ${ln}`,
      phone,
      service: srv.name,
      cost: finalCost,
      // Google Calendar ISO format e.g. 2026-09-08T14:30:00.000Z
      bookingDate: bookingDate.toISOString(),
      status
    });
  }

  // Sort descending by date
  return bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
}

/**
 * Fetch bookings from HubSpot CRM API v3
 */
export async function fetchHubspotBookings() {
  if (!HUBSPOT_TOKEN || HUBSPOT_TOKEN.trim() === '' || HUBSPOT_TOKEN.includes('your_hubspot_private_app_token')) {
    return {
      success: true,
      isMock: true,
      message: 'No active HubSpot token provided. Displaying demo CRM bookings.',
      data: generateMockBookings()
    };
  }

  try {
    const properties = [
      'email',
      'firstname',
      'lastname',
      'phone',
      PROP_SERVICE,
      PROP_COST,
      PROP_DATE,
      PROP_STATUS
    ].join(',');

    const url = `https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=${properties}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN.trim()}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const results = response.data?.results || [];

    const mappedBookings = results.map((contact) => {
      const props = contact.properties || {};
      const firstName = props.firstname || '';
      const lastName = props.lastname || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Anonymous User';

      // Parse cost
      let cost = 0;
      if (props[PROP_COST]) {
        const cleaned = String(props[PROP_COST]).replace(/[^0-9.-]+/g, '');
        cost = parseFloat(cleaned) || 0;
      }

      return {
        id: contact.id,
        email: props.email || 'N/A',
        firstName,
        lastName,
        fullName,
        phone: props.phone || 'N/A',
        service: props[PROP_SERVICE] || 'Standard Service',
        cost: cost,
        bookingDate: props[PROP_DATE] || contact.createdAt || new Date().toISOString(),
        status: normalizeStatus(props[PROP_STATUS])
      };
    });

    return {
      success: true,
      isMock: false,
      message: `Successfully connected to HubSpot CRM. Loaded ${mappedBookings.length} bookings.`,
      data: mappedBookings
    };
  } catch (error) {
    console.error('HubSpot API Error:', error.response?.data || error.message);
    
    // If fallback is enabled, return mock data along with the error explanation
    if (process.env.USE_MOCK_FALLBACK !== 'false') {
      return {
        success: true,
        isMock: true,
        error: error.response?.data?.message || error.message,
        message: 'HubSpot API authentication failed or rate limited. Displaying fallback demo data.',
        data: generateMockBookings()
      };
    }

    throw new Error(error.response?.data?.message || error.message);
  }
}
