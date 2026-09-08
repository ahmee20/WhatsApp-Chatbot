import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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
 * Generate sample mock data matching real HubSpot contact formats
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

  for (let i = 0; i < 85; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const srv = services[Math.floor(Math.random() * services.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`;
    const phone = `+1 (${Math.floor(200 + Math.random() * 700)}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const dayOffset = Math.floor(Math.random() * 45) - 40;
    const bookingDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    bookingDate.setHours(9 + Math.floor(Math.random() * 8), [0, 15, 30, 45][Math.floor(Math.random() * 4)], 0, 0);

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
      bookingDate: bookingDate.toISOString(),
      status
    });
  }

  return bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
}

/**
 * Fetch bookings from HubSpot CRM API v3 with dynamic .env reload and detailed logging
 */
export async function fetchHubspotBookings() {
  // Dynamically re-read .env file on each call so changes take effect without server restarts
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envPath));
      for (const k in envConfig) {
        process.env[k] = envConfig[k];
      }
    }
  } catch (e) {
    console.warn('[HubSpot Service] Note: Could not dynamically reload .env file:', e.message);
  }

  const token = (process.env.HUBSPOT_ACCESS_TOKEN || '').trim();
  const propService = process.env.HUBSPOT_PROP_SERVICE || 'services';
  const propCost = process.env.HUBSPOT_PROP_COST || 'service_cost';
  const propDate = process.env.HUBSPOT_PROP_BOOKING_DATE || 'booking_date';
  const propStatus = process.env.HUBSPOT_PROP_BOOKING_STATUS || 'booking_status';

  console.log('\n------------------------------------------------------------');
  console.log(`[HubSpot Service] Fetch requested at: ${new Date().toLocaleTimeString()}`);

  if (!token || token === '' || token.includes('your_hubspot_private_app_token')) {
    console.log('[HubSpot Service] WARNING: HUBSPOT_ACCESS_TOKEN is missing or empty in .env');
    console.log('[HubSpot Service] Returning demo mock records instead.');
    console.log('------------------------------------------------------------\n');
    return {
      success: true,
      isMock: true,
      message: 'No active HubSpot token provided. Displaying demo CRM bookings.',
      data: generateMockBookings()
    };
  }

  const maskedToken = token.length > 10 ? `${token.substring(0, 8)}...${token.slice(-4)}` : '***';
  console.log(`[HubSpot Service] Using Access Token: ${maskedToken}`);

  try {
    // Collect both standard contact fields and custom properties from n8n workflow
    const propertiesList = [
      'email',
      'user_email',
      'firstname',
      'lastname',
      'phone',
      'contact_num',
      propService,
      propCost,
      propDate,
      propStatus
    ];
    // Remove duplicates
    const uniqueProps = Array.from(new Set(propertiesList)).join(',');

    const url = `https://api.hubapi.com/crm/v3/objects/contacts?limit=100&properties=${uniqueProps}`;

    console.log(`[HubSpot Service] Calling HubSpot API: GET ${url}`);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const results = response.data?.results || [];
    console.log(`[HubSpot Service] SUCCESS! Received ${results.length} contacts from HubSpot CRM.`);

    const mappedBookings = results.map((contact) => {
      const props = contact.properties || {};
      const firstName = props.firstname || '';
      const lastName = props.lastname || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Anonymous Client';

      // Parse email (checking standard email first, then custom user_email from n8n)
      const email = props.email || props.user_email || 'N/A';

      // Parse phone (checking standard phone first, then contact_num from n8n)
      const phone = props.phone || props.contact_num || 'N/A';

      // Parse cost
      let cost = 0;
      if (props[propCost]) {
        const cleaned = String(props[propCost]).replace(/[^0-9.-]+/g, '');
        cost = parseFloat(cleaned) || 0;
      }

      return {
        id: contact.id,
        email,
        firstName,
        lastName,
        fullName,
        phone,
        service: props[propService] || 'General Dental Service',
        cost: cost,
        bookingDate: props[propDate] || contact.createdAt || new Date().toISOString(),
        status: normalizeStatus(props[propStatus])
      };
    });

    console.log('------------------------------------------------------------\n');

    return {
      success: true,
      isMock: false,
      message: `Successfully connected to HubSpot CRM. Loaded ${mappedBookings.length} contacts.`,
      data: mappedBookings
    };
  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    console.error('\n[HubSpot Service] ERROR CALLING HUBSPOT API:');
    console.error(JSON.stringify(errorDetails, null, 2));
    console.log('------------------------------------------------------------\n');

    if (process.env.USE_MOCK_FALLBACK !== 'false') {
      return {
        success: true,
        isMock: true,
        error: error.response?.data?.message || error.message,
        message: 'HubSpot API call failed. Returning fallback data for demonstration.',
        data: generateMockBookings()
      };
    }

    throw new Error(error.response?.data?.message || error.message);
  }
}
