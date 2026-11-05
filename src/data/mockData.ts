import { Airport, Aircraft, Flight, Booking, AddOnItem, StaffMember, AirlineNotification } from '../types/airline';

export const AIRPORTS: Airport[] = [
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', terminal: 'Terminal 3' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', terminal: 'Terminal 2' },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', terminal: 'Terminal 2' },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', terminal: 'Terminal 3' },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', terminal: 'Main Terminal' },
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', terminal: 'Terminal 4' },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', terminal: 'Terminal 3' },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', terminal: 'Terminal 7' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', terminal: 'Terminal 1' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', terminal: 'International Terminal' },
];

export const AIRCRAFT_FLEET: Aircraft[] = [
  {
    id: 'AC-350-01',
    model: 'Airbus A350-900',
    registration: 'VT-WGA (The Sky Voyager)',
    totalSeats: 314,
    businessSeats: 42,
    economySeats: 272,
    status: 'Active',
    flightHours: 4210,
  },
  {
    id: 'AC-787-02',
    model: 'Boeing 787-9 Dreamliner',
    registration: 'VT-WGB (Silver Falcon)',
    totalSeats: 296,
    businessSeats: 30,
    economySeats: 266,
    status: 'Active',
    flightHours: 5890,
  },
  {
    id: 'AC-321-03',
    model: 'Airbus A321neo',
    registration: 'VT-WGC (Aero Swift)',
    totalSeats: 222,
    businessSeats: 16,
    economySeats: 206,
    status: 'Active',
    flightHours: 2150,
  },
  {
    id: 'AC-350-04',
    model: 'Airbus A350-900',
    registration: 'VT-WGD (Celestial Star)',
    totalSeats: 314,
    businessSeats: 42,
    economySeats: 272,
    status: 'Turnaround',
    flightHours: 3780,
  },
];

export const ADD_ONS: AddOnItem[] = [
  {
    id: 'addon-meal',
    name: 'Chef-Curated Gourmet Meal',
    description: 'Multi-course culinary experience with hot beverage & dessert',
    price: 650,
    icon: 'Utensils',
  },
  {
    id: 'addon-baggage-10kg',
    name: 'Extra Baggage (+10 kg)',
    description: 'Pre-book excess baggage at 40% discount vs airport counter',
    price: 1800,
    icon: 'Luggage',
  },
  {
    id: 'addon-lounge',
    name: 'Wiings Executive Lounge Access',
    description: 'Complimentary buffet, showers, high-speed Wi-Fi & quiet pods',
    price: 1400,
    icon: 'Coffee',
  },
  {
    id: 'addon-insurance',
    name: 'Comprehensive Travel Guard',
    description: 'Trip delay, medical emergency & lost luggage insurance up to $50,000',
    price: 499,
    icon: 'ShieldCheck',
  },
];

export const INITIAL_FLIGHTS: Flight[] = [
  {
    id: 'fl-wg204',
    flightNumber: 'WG-204',
    origin: AIRPORTS[0], // DEL
    destination: AIRPORTS[3], // DXB
    departureTime: '10:30 AM',
    arrivalTime: '01:15 PM',
    duration: '4h 15m',
    aircraft: AIRCRAFT_FLEET[1], // 787-9
    status: 'Boarding',
    gate: '14B',
    terminal: 'T3',
    totalSeats: 296,
    availableSeats: 48,
    fares: {
      Economy: [
        { type: 'Lite', price: 14500, cabinBaggage: '7 kg', checkInBaggage: '15 kg', seatSelectionIncluded: false, refundable: false, cancellationFee: 8500 },
        { type: 'Standard', price: 17200, cabinBaggage: '7 kg', checkInBaggage: '25 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 3500 },
        { type: 'Flexi', price: 21000, cabinBaggage: '10 kg', checkInBaggage: '35 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 1000 },
      ],
      Business: [
        { type: 'Standard', price: 48500, cabinBaggage: '14 kg', checkInBaggage: '40 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 5000 },
        { type: 'Flexi', price: 56000, cabinBaggage: '14 kg', checkInBaggage: '50 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 1500 },
      ],
    },
  },
  {
    id: 'fl-wg305',
    flightNumber: 'WG-305',
    origin: AIRPORTS[1], // BOM
    destination: AIRPORTS[5], // LHR
    departureTime: '01:45 PM',
    arrivalTime: '06:30 PM',
    duration: '9h 15m',
    aircraft: AIRCRAFT_FLEET[0], // A350-900
    status: 'Check-in Open',
    gate: '08A',
    terminal: 'T2',
    totalSeats: 314,
    availableSeats: 72,
    fares: {
      Economy: [
        { type: 'Lite', price: 34500, cabinBaggage: '7 kg', checkInBaggage: '23 kg', seatSelectionIncluded: false, refundable: false, cancellationFee: 18000 },
        { type: 'Standard', price: 41000, cabinBaggage: '7 kg', checkInBaggage: '30 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 6000 },
        { type: 'Flexi', price: 49500, cabinBaggage: '10 kg', checkInBaggage: '40 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 2000 },
      ],
      Business: [
        { type: 'Standard', price: 112000, cabinBaggage: '14 kg', checkInBaggage: '46 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 10000 },
        { type: 'Flexi', price: 135000, cabinBaggage: '14 kg', checkInBaggage: '60 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 3000 },
      ],
    },
  },
  {
    id: 'fl-wg402',
    flightNumber: 'WG-402',
    origin: AIRPORTS[2], // BLR
    destination: AIRPORTS[6], // SIN
    departureTime: '04:15 PM',
    arrivalTime: '11:20 PM',
    duration: '4h 35m',
    aircraft: AIRCRAFT_FLEET[2], // A321neo
    status: 'Scheduled',
    gate: '04',
    terminal: 'T2',
    totalSeats: 222,
    availableSeats: 94,
    fares: {
      Economy: [
        { type: 'Lite', price: 12800, cabinBaggage: '7 kg', checkInBaggage: '20 kg', seatSelectionIncluded: false, refundable: false, cancellationFee: 7000 },
        { type: 'Standard', price: 15400, cabinBaggage: '7 kg', checkInBaggage: '25 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 3000 },
        { type: 'Flexi', price: 19200, cabinBaggage: '10 kg', checkInBaggage: '35 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 900 },
      ],
      Business: [
        { type: 'Standard', price: 39500, cabinBaggage: '14 kg', checkInBaggage: '40 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 4000 },
        { type: 'Flexi', price: 46000, cabinBaggage: '14 kg', checkInBaggage: '45 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 1200 },
      ],
    },
  },
  {
    id: 'fl-wg101',
    flightNumber: 'WG-101',
    origin: AIRPORTS[0], // DEL
    destination: AIRPORTS[1], // BOM
    departureTime: '06:00 AM',
    arrivalTime: '08:15 AM',
    duration: '2h 15m',
    aircraft: AIRCRAFT_FLEET[2], // A321neo
    status: 'Landed',
    gate: '21',
    terminal: 'T3',
    totalSeats: 222,
    availableSeats: 0,
    fares: {
      Economy: [
        { type: 'Standard', price: 5800, cabinBaggage: '7 kg', checkInBaggage: '15 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 2000 },
      ],
      Business: [
        { type: 'Standard', price: 16500, cabinBaggage: '10 kg', checkInBaggage: '30 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 3000 },
      ],
    },
  },
  {
    id: 'fl-wg501',
    flightNumber: 'WG-501',
    origin: AIRPORTS[0], // DEL
    destination: AIRPORTS[4], // DOH
    departureTime: '06:30 PM',
    arrivalTime: '08:45 PM',
    duration: '4h 45m',
    aircraft: AIRCRAFT_FLEET[1], // 787-9
    status: 'Scheduled',
    gate: '19',
    terminal: 'T3',
    totalSeats: 296,
    availableSeats: 112,
    fares: {
      Economy: [
        { type: 'Lite', price: 16200, cabinBaggage: '7 kg', checkInBaggage: '20 kg', seatSelectionIncluded: false, refundable: false, cancellationFee: 8000 },
        { type: 'Standard', price: 18900, cabinBaggage: '7 kg', checkInBaggage: '30 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 3500 },
        { type: 'Flexi', price: 23500, cabinBaggage: '10 kg', checkInBaggage: '40 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 1000 },
      ],
      Business: [
        { type: 'Standard', price: 52000, cabinBaggage: '14 kg', checkInBaggage: '40 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 6000 },
        { type: 'Flexi', price: 61000, cabinBaggage: '14 kg', checkInBaggage: '50 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 1800 },
      ],
    },
  },
  {
    id: 'fl-wg112',
    flightNumber: 'WG-112',
    origin: AIRPORTS[1], // BOM
    destination: AIRPORTS[0], // DEL
    departureTime: '07:00 PM',
    arrivalTime: '09:15 PM',
    duration: '2h 15m',
    aircraft: AIRCRAFT_FLEET[2],
    status: 'Delayed',
    delayedByMinutes: 30,
    delayReason: 'Late arrival of inbound aircraft from Bangalore due to airspace congestion',
    gate: '05',
    terminal: 'T2',
    totalSeats: 222,
    availableSeats: 35,
    fares: {
      Economy: [
        { type: 'Standard', price: 6200, cabinBaggage: '7 kg', checkInBaggage: '15 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 2000 },
        { type: 'Flexi', price: 8100, cabinBaggage: '10 kg', checkInBaggage: '25 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 800 },
      ],
      Business: [
        { type: 'Standard', price: 18200, cabinBaggage: '10 kg', checkInBaggage: '30 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 3000 },
      ],
    },
  },
  {
    id: 'fl-wg709',
    flightNumber: 'WG-709',
    origin: AIRPORTS[0], // DEL
    destination: AIRPORTS[7], // JFK
    departureTime: '11:55 PM',
    arrivalTime: '06:15 AM',
    duration: '15h 50m',
    aircraft: AIRCRAFT_FLEET[0], // A350-900
    status: 'Scheduled',
    gate: '24',
    terminal: 'T3',
    totalSeats: 314,
    availableSeats: 88,
    fares: {
      Economy: [
        { type: 'Lite', price: 62000, cabinBaggage: '7 kg', checkInBaggage: '2x23 kg', seatSelectionIncluded: false, refundable: false, cancellationFee: 25000 },
        { type: 'Standard', price: 74000, cabinBaggage: '7 kg', checkInBaggage: '2x23 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 12000 },
        { type: 'Flexi', price: 89000, cabinBaggage: '10 kg', checkInBaggage: '2x32 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 3500 },
      ],
      Business: [
        { type: 'Standard', price: 210000, cabinBaggage: '14 kg', checkInBaggage: '2x32 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 18000 },
        { type: 'Flexi', price: 255000, cabinBaggage: '14 kg', checkInBaggage: '3x32 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 5000 },
      ],
    },
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    pnr: 'WG-78K9A',
    bookingDate: '2026-11-01',
    flight: INITIAL_FLIGHTS[0], // WG-204 DEL to DXB
    cabinClass: 'Economy',
    fareTier: 'Standard',
    passengers: [
      {
        id: 'p-01',
        title: 'Mr',
        firstName: 'Aarav',
        lastName: 'Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        passportNumber: 'Z8942018',
        dateOfBirth: '1992-05-14',
        nationality: 'Indian',
        seatNumber: '12A',
        cabinClass: 'Economy',
        mealPreference: 'Vegetarian Hindu Meal (AVML)',
      },
    ],
    selectedSeats: ['12A'],
    baggage: [
      {
        tagNumber: 'WG-BAG-WG204-748920',
        weightKg: 18.2,
        status: 'Loaded to Cargo',
        carousel: 'T3-Car-4',
        lastUpdated: '10:12 AM',
      },
    ],
    addOns: [ADD_ONS[0]],
    baseFare: 17200,
    taxesAndFees: 3164,
    totalAmount: 21014,
    paymentMethod: 'Credit/Debit Card',
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed',
    checkInCompleted: true,
    boardingCompleted: false,
    boardingPassIssued: true,
  },
  {
    pnr: 'WG-44M2P',
    bookingDate: '2026-11-02',
    flight: INITIAL_FLIGHTS[1], // WG-305 BOM to LHR
    cabinClass: 'Business',
    fareTier: 'Flexi',
    passengers: [
      {
        id: 'p-02',
        title: 'Ms',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena.rostova@example.com',
        phone: '+44 7700 900123',
        passportNumber: 'GB9081234',
        dateOfBirth: '1988-11-20',
        nationality: 'British',
        seatNumber: '3A',
        cabinClass: 'Business',
        mealPreference: 'Chef Specialty Salmon',
      },
    ],
    selectedSeats: ['3A'],
    baggage: [
      {
        tagNumber: 'WG-BAG-WG305-110482',
        weightKg: 21.0,
        status: 'Security Screened',
        carousel: 'T4-Car-2',
        lastUpdated: '11:40 AM',
      },
      {
        tagNumber: 'WG-BAG-WG305-110483',
        weightKg: 14.5,
        status: 'Security Screened',
        carousel: 'T4-Car-2',
        lastUpdated: '11:40 AM',
      },
    ],
    addOns: [ADD_ONS[2], ADD_ONS[3]],
    baseFare: 135000,
    taxesAndFees: 18100,
    totalAmount: 154999,
    paymentMethod: 'Apple Pay',
    paymentStatus: 'Paid',
    bookingStatus: 'Checked-in',
    checkInCompleted: true,
    boardingCompleted: false,
    boardingPassIssued: true,
  },
  {
    pnr: 'WG-92D1X',
    bookingDate: '2026-11-02',
    flight: INITIAL_FLIGHTS[0], // WG-204
    cabinClass: 'Economy',
    fareTier: 'Lite',
    passengers: [
      {
        id: 'p-03',
        title: 'Mr',
        firstName: 'Vikram',
        lastName: 'Malhotra',
        email: 'vikram.m@example.com',
        phone: '+91 99887 76655',
        passportNumber: 'P4839201',
        dateOfBirth: '1985-08-10',
        nationality: 'Indian',
        seatNumber: '14C',
        cabinClass: 'Economy',
      },
    ],
    selectedSeats: ['14C'],
    baggage: [],
    addOns: [],
    baseFare: 14500,
    taxesAndFees: 2840,
    totalAmount: 17340,
    paymentMethod: 'UPI / QR Code',
    paymentStatus: 'Paid',
    bookingStatus: 'Boarded',
    checkInCompleted: true,
    boardingCompleted: true,
    boardingPassIssued: true,
  },
];

export const STAFF_MEMBERS: StaffMember[] = [
  { id: 'ST-101', name: 'Rajesh Varma', role: 'Duty Manager', terminal: 'T3 - Delhi Hub', shift: 'Morning (06:00 - 15:00)', badgeId: 'WG-EMP-882' },
  { id: 'ST-102', name: 'Priya Nambiar', role: 'Check-in Agent', terminal: 'T3 Counter 14-18', shift: 'Morning (06:00 - 15:00)', badgeId: 'WG-EMP-914' },
  { id: 'ST-103', name: 'David Miller', role: 'Gate Controller', terminal: 'Gate 14B / Gate 08A', shift: 'Afternoon (14:00 - 22:00)', badgeId: 'WG-EMP-703' },
  { id: 'ST-104', name: 'Amit Patel', role: 'Baggage Officer', terminal: 'Baggage Makeup Area B', shift: 'All Shifts', badgeId: 'WG-EMP-645' },
];

export const INITIAL_NOTIFICATIONS: AirlineNotification[] = [
  {
    id: 'notif-1',
    type: 'SMS',
    recipient: '+91 98765 43210',
    title: 'Flight WG-204 Boarding Call',
    message: 'Dear Aarav Sharma, your flight WG-204 to DXB is now boarding at Gate 14B, Terminal 3. Please proceed immediately.',
    timestamp: '10:05 AM',
    read: false,
    pnr: 'WG-78K9A',
  },
  {
    id: 'notif-2',
    type: 'Email',
    recipient: 'elena.rostova@example.com',
    title: 'E-Ticket & Web Check-in Confirmation',
    message: 'Wiings Reservation Confirmed: PNR WG-44M2P for flight WG-305 (BOM -> LHR). Boarding Pass attached.',
    timestamp: '09:30 AM',
    read: false,
    pnr: 'WG-44M2P',
  },
  {
    id: 'notif-3',
    type: 'System',
    recipient: 'Operations Desk',
    title: 'Air Traffic Flow Management Advisory',
    message: 'Flight WG-112 rescheduled due to congestion in Mumbai airspace. Push notifications sent to 187 passengers.',
    timestamp: '08:45 AM',
    read: true,
  },
];
