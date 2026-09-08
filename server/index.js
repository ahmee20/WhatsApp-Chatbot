import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fetchHubspotBookings } from './hubspotService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API health and configuration check
app.get('/api/status', (req, res) => {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  const isConfigured = Boolean(token && token.trim() !== '' && !token.includes('your_hubspot_private_app_token'));
  
  res.json({
    status: 'online',
    isConfigured,
    tokenPrefix: isConfigured ? `${token.substring(0, 7)}...` : null,
    port: PORT,
    mappings: {
      service: process.env.HUBSPOT_PROP_SERVICE || 'services',
      cost: process.env.HUBSPOT_PROP_COST || 'service_cost',
      date: process.env.HUBSPOT_PROP_BOOKING_DATE || 'booking_date',
      status: process.env.HUBSPOT_PROP_BOOKING_STATUS || 'booking_status'
    }
  });
});

// Bookings endpoint
app.get('/api/bookings', async (req, res) => {
  try {
    const result = await fetchHubspotBookings();
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch bookings from HubSpot CRM'
    });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` HubSpot CRM Proxy Backend running on port ${PORT}`);
  console.log(` API available at http://localhost:${PORT}/api/bookings`);
  console.log(`====================================================`);
});
