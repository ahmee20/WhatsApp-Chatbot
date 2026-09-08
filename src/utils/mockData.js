/**
 * Frontend client-side fallback mock generator in case API server is unreachable
 */
export function generateClientMockBookings() {
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
      id: `client-mock-${1000 + i}`,
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
