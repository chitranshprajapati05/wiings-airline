import { Booking, Flight, CabinClass, FlightStatus } from '../types/airline';

/**
 * Generates a valid unique PNR code for Wiings Airline.
 * Format: WG-XXXXX (e.g., WG-78K9A)
 */
export function generatePNR(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude ambiguous chars like 0, O, 1, I
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WG-${randomPart}`;
}

/**
 * Validates a PNR string format.
 */
export function isValidPNR(pnr: string): boolean {
  if (!pnr) return false;
  const trimmed = pnr.trim().toUpperCase();
  // Validates formats like WG-XXXXX or XXXXX
  const regex = /^(WG-)?[A-Z0-9]{5,6}$/;
  return regex.test(trimmed);
}

/**
 * Normalizes PNR input (e.g. "78k9a" -> "WG-78K9A")
 */
export function normalizePNR(pnr: string): string {
  const clean = pnr.trim().toUpperCase();
  if (clean.startsWith('WG-')) return clean;
  return `WG-${clean}`;
}

/**
 * Generates an IATA standard baggage barcode/tag identifier.
 */
export function generateBaggageTag(flightNumber: string): string {
  const random = Math.floor(100000 + Math.random() * 900000);
  const cleanNum = flightNumber.replace(/[^A-Z0-9]/gi, '');
  return `WG-BAG-${cleanNum}-${random}`;
}

/**
 * Calculates fare summary including taxes, seat selection fee, add-ons.
 */
export interface FareCalculationInput {
  basePricePerPassenger: number;
  passengerCount: number;
  seatSelectionFee: number;
  addOnsTotal: number;
  tierMultiplier?: number; // e.g. 1.0 for Lite, 1.25 for Standard, 1.6 for Flexi
}

export interface FareCalculationOutput {
  baseFareTotal: number;
  seatFeesTotal: number;
  addOnsTotal: number;
  aviationSecurityFee: number;
  fuelSurcharge: number;
  airportTaxesAndGst: number;
  grandTotal: number;
}

export function calculateFare(input: FareCalculationInput): FareCalculationOutput {
  const { basePricePerPassenger, passengerCount, seatSelectionFee, addOnsTotal, tierMultiplier = 1 } = input;
  
  const baseFareTotal = Math.round(basePricePerPassenger * tierMultiplier * passengerCount);
  const seatFeesTotal = seatSelectionFee;
  const aviationSecurityFee = 250 * passengerCount;
  const fuelSurcharge = 850 * passengerCount;
  
  // 12% airport taxes and aviation GST on base fare
  const airportTaxesAndGst = Math.round(baseFareTotal * 0.12);
  
  const grandTotal = baseFareTotal + seatFeesTotal + addOnsTotal + aviationSecurityFee + fuelSurcharge + airportTaxesAndGst;
  
  return {
    baseFareTotal,
    seatFeesTotal,
    addOnsTotal,
    aviationSecurityFee,
    fuelSurcharge,
    airportTaxesAndGst,
    grandTotal,
  };
}

/**
 * Calculates cancellation refund according to Wiings Fare Rules.
 * - Flexi fare: minimal administrative fee ($25 or ₹1,500)
 * - Standard fare: 25% cancellation fee
 * - Lite fare: 60% cancellation fee
 */
export function calculateCancellationRefund(
  totalPaid: number,
  fareTier: 'Lite' | 'Standard' | 'Flexi',
  hoursBeforeDeparture: number
): { cancellationFee: number; refundAmount: number; policyNote: string } {
  let feePercentage = 0.25; // default Standard

  if (fareTier === 'Flexi') {
    feePercentage = hoursBeforeDeparture > 24 ? 0.05 : 0.15;
  } else if (fareTier === 'Lite') {
    feePercentage = hoursBeforeDeparture > 24 ? 0.50 : 0.75;
  } else {
    // Standard
    feePercentage = hoursBeforeDeparture > 24 ? 0.20 : 0.35;
  }

  const cancellationFee = Math.round(totalPaid * feePercentage);
  const refundAmount = Math.max(0, totalPaid - cancellationFee);

  return {
    cancellationFee,
    refundAmount,
    policyNote: `Based on ${fareTier} Fare rules (${Math.round(feePercentage * 100)}% fee applied for request ${hoursBeforeDeparture}h prior to departure).`,
  };
}

/**
 * Determine seat price based on seat category.
 */
export function getSeatDetails(seatNumber: string, cabinClass: CabinClass): {
  type: 'standard' | 'window' | 'aisle' | 'extra-legroom' | 'business-suite';
  price: number;
} {
  const rowMatch = seatNumber.match(/\d+/);
  const colMatch = seatNumber.match(/[A-Z]/i);
  
  const row = rowMatch ? parseInt(rowMatch[0], 10) : 1;
  const col = colMatch ? colMatch[0].toUpperCase() : 'A';

  if (cabinClass === 'Business' || cabinClass === 'First Class') {
    return { type: 'business-suite', price: 0 }; // included in business fare
  }

  if (row <= 4) {
    return { type: 'extra-legroom', price: 800 };
  }

  if (row === 12 || row === 13) {
    return { type: 'extra-legroom', price: 650 }; // Emergency exit rows
  }

  if (col === 'A' || col === 'F') {
    return { type: 'window', price: 350 };
  }

  if (col === 'C' || col === 'D') {
    return { type: 'aisle', price: 300 };
  }

  return { type: 'standard', price: 150 };
}

/**
 * Flight status state transitions validator.
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<FlightStatus, FlightStatus[]> = {
  'Scheduled': ['Check-in Open', 'Delayed', 'Cancelled'],
  'Check-in Open': ['Boarding', 'Delayed', 'Cancelled'],
  'Boarding': ['Gate Closed', 'Delayed', 'Cancelled'],
  'Gate Closed': ['Departed', 'Delayed', 'Cancelled'],
  'Departed': ['In Flight', 'Delayed'],
  'In Flight': ['Landed'],
  'Delayed': ['Check-in Open', 'Boarding', 'Gate Closed', 'Departed', 'Cancelled'],
  'Landed': [],
  'Cancelled': [],
};

export function canTransitionFlightStatus(current: FlightStatus, next: FlightStatus): boolean {
  if (current === next) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

/**
 * AI Smart Recommendation Helper for 1-Click Auto Booking
 */
export interface SmartRecommendationQuery {
  destinationCode: string;
  priority: 'budget' | 'comfort' | 'flexibility';
  passengerCount: number;
}

export function getAiSmartRecommendation(flights: Flight[], query: SmartRecommendationQuery) {
  const matchingFlights = flights.filter(
    (f) => f.destination.code.toUpperCase() === query.destinationCode.toUpperCase()
  );

  const selectedFlight = matchingFlights[0] || flights[0];
  const isComfort = query.priority === 'comfort';
  const cabinClass: CabinClass = isComfort ? 'Business' : 'Economy';
  const fareTier: 'Lite' | 'Standard' | 'Flexi' =
    query.priority === 'budget' ? 'Lite' : query.priority === 'flexibility' ? 'Flexi' : 'Standard';

  const fares = selectedFlight.fares[cabinClass === 'Business' ? 'Business' : 'Economy'] || [];
  const selectedFare = fares.find((f) => f.type === fareTier) || fares[0];

  const suggestedSeat = isComfort ? '2A' : query.priority === 'flexibility' ? '12A' : '15F';

  return {
    flight: selectedFlight,
    cabinClass,
    fareTier,
    selectedFare,
    suggestedSeat,
    reasoning:
      query.priority === 'budget'
        ? `Curated for maximum economy: Lowest airfare of ₹${selectedFare.price.toLocaleString()} on non-stop flight ${selectedFlight.flightNumber}.`
        : query.priority === 'comfort'
        ? `Curated for executive luxury: Lie-flat suite ${suggestedSeat}, lounge access, and chef dining on ${selectedFlight.flightNumber}.`
        : `Curated for full flexibility: Zero-fee reschedule, high refund guarantee, and 35kg checked baggage on ${selectedFlight.flightNumber}.`,
  };
}

