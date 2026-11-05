export type UserRole = 'passenger' | 'admin' | 'staff';

export type CabinClass = 'Economy' | 'Premium Economy' | 'Business' | 'First Class';

export type FlightStatus =
  | 'Scheduled'
  | 'Check-in Open'
  | 'Boarding'
  | 'Gate Closed'
  | 'Departed'
  | 'In Flight'
  | 'Landed'
  | 'Delayed'
  | 'Cancelled';

export type BookingStatus =
  | 'Confirmed'
  | 'Checked-in'
  | 'Boarded'
  | 'Cancelled'
  | 'Refunded';

export type BaggageStatus =
  | 'Checked'
  | 'Security Screened'
  | 'Loaded to Cargo'
  | 'In-Transit'
  | 'Arrived at Carousel'
  | 'Claimed';

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  terminal: string;
}

export interface Aircraft {
  id: string;
  model: string;
  registration: string;
  totalSeats: number;
  economySeats: number;
  businessSeats: number;
  status: 'Active' | 'Maintenance' | 'Turnaround';
  flightHours: number;
}

export interface FlightFareTier {
  type: 'Lite' | 'Standard' | 'Flexi';
  price: number;
  cabinBaggage: string;
  checkInBaggage: string;
  seatSelectionIncluded: boolean;
  refundable: boolean;
  cancellationFee: number;
}

export interface Flight {
  id: string;
  flightNumber: string; // e.g. "WG-204"
  origin: Airport;
  destination: Airport;
  departureTime: string; // ISO string or "10:30 AM"
  arrivalTime: string;
  duration: string;
  aircraft: Aircraft;
  status: FlightStatus;
  gate: string;
  terminal: string;
  fares: {
    Economy: FlightFareTier[];
    Business: FlightFareTier[];
  };
  totalSeats: number;
  availableSeats: number;
  delayedByMinutes?: number;
  delayReason?: string;
}

export interface Passenger {
  id: string;
  title: 'Mr' | 'Ms' | 'Mrs' | 'Dr';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passportNumber?: string;
  dateOfBirth: string;
  nationality: string;
  seatNumber?: string;
  cabinClass: CabinClass;
  mealPreference?: string;
  specialAssistance?: string;
}

export interface BaggageItem {
  tagNumber: string; // e.g. "WG-BAG-84920"
  weightKg: number;
  status: BaggageStatus;
  carousel?: string;
  lastUpdated: string;
}

export interface AddOnItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon?: string;
}

export interface Booking {
  pnr: string; // e.g. "WG-78K9A"
  bookingDate: string;
  flight: Flight;
  cabinClass: CabinClass;
  fareTier: 'Lite' | 'Standard' | 'Flexi';
  passengers: Passenger[];
  selectedSeats: string[];
  baggage: BaggageItem[];
  addOns: AddOnItem[];
  baseFare: number;
  taxesAndFees: number;
  totalAmount: number;
  paymentMethod: 'Credit/Debit Card' | 'UPI / QR Code' | 'Net Banking' | 'Apple Pay';
  paymentStatus: 'Paid' | 'Refund Pending' | 'Refunded';
  bookingStatus: BookingStatus;
  checkInCompleted: boolean;
  boardingCompleted: boolean;
  boardingPassIssued: boolean;
  cancellationDetails?: {
    cancelledAt: string;
    cancellationFee: number;
    refundAmount: number;
    refundTxnId: string;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Check-in Agent' | 'Gate Controller' | 'Baggage Officer' | 'Duty Manager';
  terminal: string;
  shift: string;
  badgeId: string;
}

export interface AirlineNotification {
  id: string;
  type: 'SMS' | 'Email' | 'System';
  recipient: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  pnr?: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalBookings: number;
  activeFlights: number;
  onTimePerformanceRate: number; // e.g. 94.8%
  seatOccupancyRate: number; // e.g. 87.2%
  checkedInToday: number;
}
