import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePNR,
  isValidPNR,
  normalizePNR,
  generateBaggageTag,
  calculateFare,
  calculateCancellationRefund,
  getSeatDetails,
  canTransitionFlightStatus,
  getAiSmartRecommendation
} from './airlineLogic';

test('PNR generation creates valid format WG-XXXXX', () => {
  const pnr = generatePNR();
  assert.equal(typeof pnr, 'string');
  assert.equal(pnr.startsWith('WG-'), true);
  assert.equal(pnr.length, 8); // "WG-" + 5 chars
  assert.equal(isValidPNR(pnr), true);
});

test('PNR validation accepts valid codes and rejects bad input', () => {
  assert.equal(isValidPNR('WG-78K9A'), true);
  assert.equal(isValidPNR('WG-B4M9P'), true);
  assert.equal(isValidPNR('78K9A'), true);
  assert.equal(isValidPNR(''), false);
  assert.equal(isValidPNR('12'), false);
});

test('PNR normalization prefixes WG- if missing', () => {
  assert.equal(normalizePNR('78k9a'), 'WG-78K9A');
  assert.equal(normalizePNR('WG-78K9A'), 'WG-78K9A');
});

test('Baggage tag generator generates formatted tag with flight number', () => {
  const tag = generateBaggageTag('WG-204');
  assert.equal(tag.startsWith('WG-BAG-WG204-'), true);
});

test('Fare calculation accurately computes taxes and grand total', () => {
  const fare = calculateFare({
    basePricePerPassenger: 5000,
    passengerCount: 2,
    seatSelectionFee: 500,
    addOnsTotal: 1000,
    tierMultiplier: 1.0,
  });

  // baseFareTotal = 5000 * 2 = 10000
  // aviationSecurityFee = 250 * 2 = 500
  // fuelSurcharge = 850 * 2 = 1700
  // airportTaxesAndGst = 10000 * 0.12 = 1200
  // grandTotal = 10000 + 500 + 1000 + 500 + 1700 + 1200 = 14900
  assert.equal(fare.baseFareTotal, 10000);
  assert.equal(fare.seatFeesTotal, 500);
  assert.equal(fare.addOnsTotal, 1000);
  assert.equal(fare.aviationSecurityFee, 500);
  assert.equal(fare.fuelSurcharge, 1700);
  assert.equal(fare.airportTaxesAndGst, 1200);
  assert.equal(fare.grandTotal, 14900);
});

test('Cancellation refund applies correct policy based on tier and timing', () => {
  // Flexi > 24h -> 5% fee
  const flexiRefund = calculateCancellationRefund(10000, 'Flexi', 48);
  assert.equal(flexiRefund.cancellationFee, 500);
  assert.equal(flexiRefund.refundAmount, 9500);

  // Standard > 24h -> 20% fee
  const standardRefund = calculateCancellationRefund(10000, 'Standard', 36);
  assert.equal(standardRefund.cancellationFee, 2000);
  assert.equal(standardRefund.refundAmount, 8000);

  // Lite < 24h -> 75% fee
  const liteRefund = calculateCancellationRefund(10000, 'Lite', 12);
  assert.equal(liteRefund.cancellationFee, 7500);
  assert.equal(liteRefund.refundAmount, 2500);
});

test('Seat details price and categorize correctly', () => {
  const businessSeat = getSeatDetails('2A', 'Business');
  assert.equal(businessSeat.price, 0);
  assert.equal(businessSeat.type, 'business-suite');

  const extraLegroom = getSeatDetails('3B', 'Economy');
  assert.equal(extraLegroom.type, 'extra-legroom');
  assert.equal(extraLegroom.price, 800);

  const windowSeat = getSeatDetails('15A', 'Economy');
  assert.equal(windowSeat.type, 'window');
  assert.equal(windowSeat.price, 350);
});

test('Flight status transitions validate permitted flows', () => {
  assert.equal(canTransitionFlightStatus('Scheduled', 'Check-in Open'), true);
  assert.equal(canTransitionFlightStatus('Check-in Open', 'Boarding'), true);
  assert.equal(canTransitionFlightStatus('Boarding', 'Gate Closed'), true);
  assert.equal(canTransitionFlightStatus('Gate Closed', 'Departed'), true);
  assert.equal(canTransitionFlightStatus('Departed', 'In Flight'), true);
  assert.equal(canTransitionFlightStatus('In Flight', 'Landed'), true);
  assert.equal(canTransitionFlightStatus('Landed', 'Scheduled'), false);
});

test('AI Smart Recommendation curates optimal flight and tier by priority', () => {
  const dummyFlights: any[] = [
    {
      id: 'f1',
      flightNumber: 'WG-204',
      destination: { code: 'DXB' },
      fares: {
        Economy: [
          { type: 'Lite', price: 14000 },
          { type: 'Standard', price: 17000 },
          { type: 'Flexi', price: 21000 },
        ],
        Business: [{ type: 'Standard', price: 48000 }],
      },
    },
  ];

  const budgetRec = getAiSmartRecommendation(dummyFlights, {
    destinationCode: 'DXB',
    priority: 'budget',
    passengerCount: 1,
  });
  assert.equal(budgetRec.fareTier, 'Lite');
  assert.equal(budgetRec.cabinClass, 'Economy');

  const comfortRec = getAiSmartRecommendation(dummyFlights, {
    destinationCode: 'DXB',
    priority: 'comfort',
    passengerCount: 1,
  });
  assert.equal(comfortRec.cabinClass, 'Business');
  assert.equal(comfortRec.suggestedSeat, '2A');
});

