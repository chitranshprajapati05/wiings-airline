import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { GoogleGenAI } from '@google/genai';
import { INITIAL_FLIGHTS, INITIAL_BOOKINGS, AIRPORTS, AIRCRAFT_FLEET, INITIAL_NOTIFICATIONS } from './src/data/mockData';
import { Flight, Booking, AirlineNotification, BaggageItem } from './src/types/airline';
import { generatePNR, generateBaggageTag, calculateCancellationRefund } from './src/utils/airlineLogic';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory synchronized store for real-time state across Passenger, Admin, and Airport Staff portals
let flights: Flight[] = JSON.parse(JSON.stringify(INITIAL_FLIGHTS));
let bookings: Booking[] = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
let notifications: AirlineNotification[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));

// Server-side Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// ---------------- API ROUTES ----------------

// 1. Flights Endpoints
app.get('/api/flights', (req, res) => {
  const { origin, destination } = req.query;
  let results = [...flights];

  if (origin && typeof origin === 'string') {
    results = results.filter(f => f.origin.code.toUpperCase() === origin.toUpperCase() || f.origin.city.toLowerCase().includes(origin.toLowerCase()));
  }
  if (destination && typeof destination === 'string') {
    results = results.filter(f => f.destination.code.toUpperCase() === destination.toUpperCase() || f.destination.city.toLowerCase().includes(destination.toLowerCase()));
  }

  res.json({ success: true, count: results.length, data: results });
});

app.post('/api/flights', (req, res) => {
  try {
    const flightData: Partial<Flight> = req.body;
    if (!flightData.flightNumber || !flightData.origin || !flightData.destination) {
      return res.status(400).json({ success: false, error: 'Flight number, origin, and destination are required.' });
    }

    const newFlight: Flight = {
      id: `fl-${Date.now()}`,
      flightNumber: flightData.flightNumber.toUpperCase(),
      origin: flightData.origin,
      destination: flightData.destination,
      departureTime: flightData.departureTime || '09:00 AM',
      arrivalTime: flightData.arrivalTime || '01:00 PM',
      duration: flightData.duration || '4h 00m',
      aircraft: flightData.aircraft || AIRCRAFT_FLEET[0],
      status: flightData.status || 'Scheduled',
      gate: flightData.gate || 'TBD',
      terminal: flightData.terminal || 'T3',
      fares: flightData.fares || {
        Economy: [
          { type: 'Standard', price: 12000, cabinBaggage: '7 kg', checkInBaggage: '20 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 3000 }
        ],
        Business: [
          { type: 'Standard', price: 38000, cabinBaggage: '14 kg', checkInBaggage: '40 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 5000 }
        ]
      },
      totalSeats: flightData.totalSeats || 296,
      availableSeats: flightData.availableSeats || 296,
    };

    flights.unshift(newFlight);
    res.status(201).json({ success: true, data: newFlight });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/flights/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const index = flights.findIndex(f => f.id === id || f.flightNumber === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Flight not found' });
  }

  flights[index] = { ...flights[index], ...updates };

  // If status changed to Delayed or Gate changed, dispatch notification
  if (updates.status || updates.gate) {
    const notif: AirlineNotification = {
      id: `notif-${Date.now()}`,
      type: 'SMS',
      recipient: 'All Passengers',
      title: `Flight ${flights[index].flightNumber} Update`,
      message: `Flight ${flights[index].flightNumber} status is now "${flights[index].status}" (Gate ${flights[index].gate}).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    notifications.unshift(notif);
  }

  res.json({ success: true, data: flights[index] });
});

// 2. Bookings Endpoints
app.get('/api/bookings', (req, res) => {
  const { pnr, lastName } = req.query;
  let results = [...bookings];

  if (pnr && typeof pnr === 'string') {
    const searchPnr = pnr.trim().toUpperCase();
    results = results.filter(b => b.pnr.toUpperCase() === searchPnr || b.pnr.toUpperCase() === `WG-${searchPnr}`);
  }

  if (lastName && typeof lastName === 'string') {
    const searchName = lastName.trim().toLowerCase();
    results = results.filter(b => b.passengers.some(p => p.lastName.toLowerCase() === searchName));
  }

  res.json({ success: true, count: results.length, data: results });
});

app.post('/api/bookings', (req, res) => {
  try {
    // If complete booking object is posted
    if (req.body.pnr && req.body.flight) {
      const incomingBooking: Booking = req.body;
      const targetFlight = flights.find(
        (f) => f.id === incomingBooking.flight.id || f.flightNumber === incomingBooking.flight.flightNumber
      );
      if (targetFlight) {
        targetFlight.availableSeats = Math.max(0, targetFlight.availableSeats - (incomingBooking.passengers?.length || 1));
      }
      bookings.unshift(incomingBooking);

      const notif: AirlineNotification = {
        id: `notif-${Date.now()}`,
        type: 'SMS',
        recipient: incomingBooking.passengers[0]?.phone || 'Customer',
        title: `Wiings Ticket Issued: PNR ${incomingBooking.pnr}`,
        message: `Booking confirmed for ${incomingBooking.flight.flightNumber} (${incomingBooking.flight.origin.code} → ${incomingBooking.flight.destination.code}). Seat: ${incomingBooking.selectedSeats.join(', ')}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        pnr: incomingBooking.pnr,
      };
      notifications.unshift(notif);

      return res.status(201).json({ success: true, data: incomingBooking });
    }

    const { flightId, cabinClass, fareTier, passengers, selectedSeats, addOns, paymentMethod, totalAmount, baseFare, taxesAndFees } = req.body;
    
    const flight = flights.find(f => f.id === flightId || f.flightNumber === flightId || (req.body.flight && (f.id === req.body.flight.id || f.flightNumber === req.body.flight.flightNumber)));
    if (!flight) {
      return res.status(404).json({ success: false, error: 'Target flight not found' });
    }

    const newPnr = generatePNR();
    const newBooking: Booking = {
      pnr: newPnr,
      bookingDate: new Date().toISOString().split('T')[0],
      flight,
      cabinClass: cabinClass || 'Economy',
      fareTier: fareTier || 'Standard',
      passengers: passengers || [],
      selectedSeats: selectedSeats || [],
      baggage: [],
      addOns: addOns || [],
      baseFare: baseFare || 15000,
      taxesAndFees: taxesAndFees || 2500,
      totalAmount: totalAmount || 17500,
      paymentMethod: paymentMethod || 'Credit/Debit Card',
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      checkInCompleted: false,
      boardingCompleted: false,
      boardingPassIssued: false,
    };

    bookings.unshift(newBooking);

    // Decrement available seats
    flight.availableSeats = Math.max(0, flight.availableSeats - (passengers?.length || 1));

    // Send confirmation notification
    const primaryPax = passengers?.[0];
    const notif: AirlineNotification = {
      id: `notif-${Date.now()}`,
      type: 'Email',
      recipient: primaryPax?.email || 'customer@wiings.com',
      title: `Booking Confirmed: PNR ${newPnr}`,
      message: `Your booking on flight ${flight.flightNumber} from ${flight.origin.city} to ${flight.destination.city} is confirmed! Seat: ${selectedSeats?.join(', ') || 'Auto-assigned'}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      pnr: newPnr,
    };
    notifications.unshift(notif);

    res.status(201).json({ success: true, data: newBooking });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update booking (Check-in, Boarding, Seat modification, Cancellation)
app.patch('/api/bookings/:pnr', (req, res) => {
  const { pnr } = req.params;
  const updates = req.body;
  const index = bookings.findIndex(b => b.pnr.toUpperCase() === pnr.toUpperCase() || b.pnr.toUpperCase() === `WG-${pnr.toUpperCase()}`);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  const current = bookings[index];

  // If cancellation requested
  if (updates.action === 'cancel') {
    const refundInfo = calculateCancellationRefund(current.totalAmount, current.fareTier, 36);
    current.bookingStatus = 'Cancelled';
    current.paymentStatus = 'Refunded';
    current.cancellationDetails = {
      cancelledAt: new Date().toISOString(),
      cancellationFee: refundInfo.cancellationFee,
      refundAmount: refundInfo.refundAmount,
      refundTxnId: `RFD-${Date.now()}`,
    };

    // Increment seat back
    const flIndex = flights.findIndex(f => f.id === current.flight.id);
    if (flIndex !== -1) {
      flights[flIndex].availableSeats += current.passengers.length;
    }

    // Add notification
    notifications.unshift({
      id: `notif-${Date.now()}`,
      type: 'SMS',
      recipient: current.passengers[0]?.phone || 'Customer',
      title: `Booking Cancelled: PNR ${current.pnr}`,
      message: `Your booking ${current.pnr} has been cancelled. Refund of ₹${refundInfo.refundAmount.toLocaleString()} has been processed to your original payment method.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      pnr: current.pnr,
    });
  } else {
    // Normal update
    bookings[index] = { ...current, ...updates };
  }

  res.json({ success: true, data: bookings[index] });
});

// 3. Airport Staff Baggage operations
app.post('/api/baggage/tag', (req, res) => {
  const { pnr, weightKg, flightNumber } = req.body;
  const booking = bookings.find(b => b.pnr.toUpperCase() === pnr.toUpperCase() || b.pnr.toUpperCase() === `WG-${pnr.toUpperCase()}`);

  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  const newTag: BaggageItem = {
    tagNumber: generateBaggageTag(flightNumber || booking.flight.flightNumber),
    weightKg: parseFloat(weightKg) || 15.0,
    status: 'Checked',
    carousel: `${booking.flight.destination.code}-Car-${Math.floor(1 + Math.random() * 5)}`,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  booking.baggage.push(newTag);
  res.status(201).json({ success: true, data: newTag, booking });
});

app.patch('/api/baggage/status', (req, res) => {
  const { tagNumber, status } = req.body;
  let updatedTag: BaggageItem | null = null;

  for (const b of bookings) {
    const item = b.baggage.find(bg => bg.tagNumber === tagNumber);
    if (item) {
      item.status = status;
      item.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updatedTag = item;
      break;
    }
  }

  if (!updatedTag) {
    return res.status(404).json({ success: false, error: 'Baggage tag not found' });
  }

  res.json({ success: true, data: updatedTag });
});

// 4. Notifications Endpoints
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: notifications });
});

app.post('/api/notifications/mark-read', (req, res) => {
  notifications = notifications.map(n => ({ ...n, read: true }));
  res.json({ success: true });
});

// 5. Server-Side Gemini AI Chatbot Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Message string is required' });
  }

  const systemInstruction = `You are "Aero", the official AI Travel Concierge for Wiings Airline ("Your Journey, Our Responsibility.").
You are professional, polite, warm, and highly knowledgeable about Wiings Airline policies and flight schedules.
Key Wiings Airline Information:
- Hubs: Delhi (DEL Terminal 3), Mumbai (BOM Terminal 2), Bengaluru (BLR Terminal 2), Dubai (DXB Terminal 3).
- Fleet: Airbus A350-900 (The Sky Voyager), Boeing 787-9 Dreamliner (Silver Falcon), Airbus A321neo (Aero Swift).
- Cabin Classes: Economy (Lite, Standard, Flexi) and Business Class (Standard, Flexi).
- Baggage Policy:
  - Economy Lite: 7 kg Cabin baggage, 15 kg Check-in.
  - Economy Standard: 7 kg Cabin baggage, 25 kg Check-in.
  - Economy Flexi: 10 kg Cabin baggage, 35 kg Check-in.
  - Business Class: 14 kg Cabin baggage, 40-50 kg Check-in (2 pieces up to 32kg each on US flights).
- Web Check-in: Opens 48 hours prior to departure, closes 60 minutes before departure.
- Cancellation & Refunds: Lite has 50-75% fee, Standard has 20-35% fee, Flexi has minimal 5% administrative fee (>24h).
- Active Flights Today:
  - WG-204 (DEL -> DXB) 10:30 AM (Boarding at Gate 14B)
  - WG-305 (BOM -> LHR) 01:45 PM (Check-in open at Gate 08A)
  - WG-402 (BLR -> SIN) 04:15 PM (Scheduled at Gate 04)
  - WG-501 (DEL -> DOH) 06:30 PM (Scheduled at Gate 19)
  - WG-112 (BOM -> DEL) 07:00 PM (Delayed 30 mins)
  - WG-709 (DEL -> JFK) 11:55 PM (Scheduled at Gate 24)

Always provide clear, well-formatted, bulleted responses with a helpful and reassuring tone.`;

  // Fallback response if GEMINI_API_KEY is not configured or in case of API error
  const generateFallbackResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('baggage') || q.includes('luggage') || q.includes('weight')) {
      return `🧳 **Wiings Airline Baggage Allowance:**\n\n• **Economy Lite:** 7 kg Cabin + 15 kg Check-in\n• **Economy Standard:** 7 kg Cabin + 25 kg Check-in\n• **Economy Flexi:** 10 kg Cabin + 35 kg Check-in\n• **Business Class:** 14 kg Cabin + 40-50 kg Check-in\n\n*Tip: You can pre-book excess baggage (+10 kg) at a 40% discount during flight booking or at the Web Check-in desk.*`;
    }
    if (q.includes('check-in') || q.includes('boarding pass') || q.includes('web check')) {
      return `✈️ **Wiings Web Check-in Guide:**\n\n1. Web Check-in opens **48 hours prior** to departure and closes **60 minutes** before domestic flights (75 mins for international).\n2. Navigate to the **Web Check-in** tab above and enter your 6-character PNR (e.g. \`WG-78K9A\`) and Last Name.\n3. Confirm seat selection, declare health items, and instantly download or print your Digital Boarding Pass with QR code.\n4. Drop your bags at our dedicated Bag Drop counters at Terminal 3 (Counters 14-18).`;
    }
    if (q.includes('cancel') || q.includes('refund') || q.includes('change')) {
      return `💳 **Wiings Cancellation & Refund Policy:**\n\n• **Flexi Fares:** 95% refund if cancelled more than 24 hours before flight (5% administrative fee).\n• **Standard Fares:** 80% refund if cancelled >24h prior, 65% within 24h.\n• **Lite Fares:** Non-refundable base fare, airport taxes refunded.\n\n*You can manage or cancel your booking instantly in the "Manage Booking" tab using your PNR!*`;
    }
    if (q.includes('flight') || q.includes('status') || q.includes('wg-204') || q.includes('gate')) {
      return `🛫 **Live Flight Status Highlights:**\n\n• **WG-204 (DEL → DXB):** Currently **BOARDING** at Gate 14B, Terminal 3. Departure: 10:30 AM.\n• **WG-305 (BOM → LHR):** **CHECK-IN OPEN** at Gate 08A, Terminal 2. Departure: 01:45 PM.\n• **WG-112 (BOM → DEL):** **DELAYED** by 30 mins (inbound airspace congestion). New departure: 07:30 PM.\n\n*Check the live Flight Radar or Airport Staff portal for real-time gate and departure changes.*`;
    }
    return `👋 Hello! I am Aero, your **Wiings Airline AI Travel Concierge**.\n\nI can assist you with:\n• Searching flights and optimal routes\n• Baggage allowances & excess luggage booking\n• PNR lookup, web check-in & boarding pass generation\n• Ticket cancellation & transparent refund calculations\n• Real-time flight delays, gate assignments & carousel numbers\n\nHow may I help you make your journey seamless today?`;
  };

  if (!aiClient) {
    return res.json({ success: true, text: generateFallbackResponse(message) });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text || generateFallbackResponse(message);
    res.json({ success: true, text: replyText });
  } catch (error: any) {
    console.error('Gemini API Error, falling back to local concierge knowledge:', error?.message);
    res.json({ success: true, text: generateFallbackResponse(message) });
  }
});

// Start dev server with Vite middlewares
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✈️ Wiings Airline Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
