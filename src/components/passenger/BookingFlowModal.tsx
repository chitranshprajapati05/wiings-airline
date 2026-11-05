import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X, Check, Plane, User, CreditCard, ShieldCheck, ArrowRight, ArrowLeft,
  QrCode, Utensils, Luggage, Coffee, Printer, Download, Sparkles, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Flight, CabinClass, FlightFareTier, Passenger, AddOnItem, Booking } from '../../types/airline';
import { ADD_ONS } from '../../data/mockData';
import { calculateFare, getSeatDetails } from '../../utils/airlineLogic';

interface BookingFlowModalProps {
  flight: Flight;
  cabinClass: CabinClass;
  fareTier: 'Lite' | 'Standard' | 'Flexi';
  tierFare: FlightFareTier;
  passengersCount: number;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  flight,
  cabinClass,
  fareTier,
  tierFare,
  passengersCount,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      id: 'p-1',
      title: 'Mr',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      passportNumber: '',
      dateOfBirth: '1995-01-01',
      nationality: 'Indian',
      cabinClass,
      mealPreference: 'Vegetarian Hindu Meal (AVML)',
    },
  ]);

  const [selectedSeat, setSelectedSeat] = useState<string>('12A');
  const [selectedAddons, setSelectedAddons] = useState<AddOnItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Credit/Debit Card' | 'UPI / QR Code' | 'Net Banking' | 'Apple Pay'>('Credit/Debit Card');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('882');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  const occupiedSeats = new Set(['1A', '2B', '5C', '8F', '14A', '14B']);
  const seatFee = tierFare.seatSelectionIncluded ? 0 : getSeatDetails(selectedSeat, cabinClass).price;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);

  const fareCalc = calculateFare({
    basePricePerPassenger: tierFare.price,
    passengerCount: passengersCount,
    seatSelectionFee: seatFee,
    addOnsTotal: addonsTotal,
    tierMultiplier: 1.0,
  });

  const handlePassengerChange = (index: number, field: keyof Passenger, value: any) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const toggleAddon = (addon: AddOnItem) => {
    setSelectedAddons((prev) => {
      if (prev.some((a) => a.id === addon.id)) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);

    try {
      const bookingData = {
        flightId: flight.id,
        cabinClass,
        fareTier,
        passengers: passengers.map((p) => ({ ...p, seatNumber: selectedSeat })),
        selectedSeats: [selectedSeat],
        addOns: selectedAddons,
        paymentMethod,
        baseFare: fareCalc.baseFareTotal,
        taxesAndFees: fareCalc.airportTaxesAndGst + fareCalc.aviationSecurityFee + fareCalc.fuelSurcharge,
        totalAmount: fareCalc.grandTotal,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setConfirmedBooking(json.data);
        onBookingSuccess(json.data);
        setStep(5);
        try {
          confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-4xl bg-[#FCFAF6] border border-[#E8E2D5] rounded-3xl text-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Luxury Header */}
        <div className="p-4 sm:p-5 border-b border-[#EBE5DA] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                  Wiings Reservation: {flight.flightNumber}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100/70 text-sky-700 border border-sky-200">
                  {fareTier} {cabinClass}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {flight.origin.city} ({flight.origin.code}) → {flight.destination.city} ({flight.destination.code}) • {flight.departureTime}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 py-2.5 bg-[#F6F2E9]/70 border-b border-[#EBE5DA] flex items-center justify-between text-xs">
          {[
            { num: 1, label: 'Passengers' },
            { num: 2, label: 'Seat Selection' },
            { num: 3, label: 'Add-ons' },
            { num: 4, label: 'Payment' },
            { num: 5, label: 'E-Ticket' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === s.num
                    ? 'bg-sky-600 text-white shadow-sm'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#EAE4D7] text-slate-500'
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </span>
              <span className={`hidden sm:inline font-semibold ${step === s.num ? 'text-sky-700' : 'text-slate-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {/* STEP 1: PASSENGER FORM */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-bold text-slate-900 mb-0.5 flex items-center gap-2 font-['Outfit']">
                  <User className="w-4 h-4 text-sky-600" />
                  Primary Passenger Details
                </h4>
                <p className="text-xs text-slate-500">
                  Please ensure names exactly match government-issued photo ID / Passport.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-500 block mb-1 font-medium">Title</label>
                  <select
                    value={passengers[0].title}
                    onChange={(e) => handlePassengerChange(0, 'title', e.target.value)}
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>

                <div className="sm:col-span-5">
                  <label className="text-xs text-slate-500 block mb-1 font-medium">First & Middle Name *</label>
                  <input
                    type="text"
                    required
                    value={passengers[0].firstName}
                    onChange={(e) => handlePassengerChange(0, 'firstName', e.target.value)}
                    placeholder="e.g. Aarav"
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="text-xs text-slate-500 block mb-1 font-medium">Last Name / Surname *</label>
                  <input
                    type="text"
                    required
                    value={passengers[0].lastName}
                    onChange={(e) => handlePassengerChange(0, 'lastName', e.target.value)}
                    placeholder="e.g. Sharma"
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="text-xs text-slate-500 block mb-1 font-medium">Email (For E-Ticket) *</label>
                  <input
                    type="email"
                    required
                    value={passengers[0].email}
                    onChange={(e) => handlePassengerChange(0, 'email', e.target.value)}
                    placeholder="aarav.sharma@example.com"
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="text-xs text-slate-500 block mb-1 font-medium">Mobile (For SMS Alerts) *</label>
                  <input
                    type="tel"
                    required
                    value={passengers[0].phone}
                    onChange={(e) => handlePassengerChange(0, 'phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-xs text-slate-500 block mb-1 font-medium">Passport / National ID</label>
                  <input
                    type="text"
                    value={passengers[0].passportNumber}
                    onChange={(e) => handlePassengerChange(0, 'passportNumber', e.target.value)}
                    placeholder="e.g. Z984210"
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-xs text-slate-500 block mb-1 font-medium">Date of Birth</label>
                  <input
                    type="date"
                    value={passengers[0].dateOfBirth}
                    onChange={(e) => handlePassengerChange(0, 'dateOfBirth', e.target.value)}
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-xs text-slate-500 block mb-1 font-medium">In-Flight Meal</label>
                  <select
                    value={passengers[0].mealPreference}
                    onChange={(e) => handlePassengerChange(0, 'mealPreference', e.target.value)}
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Vegetarian Hindu Meal (AVML)">Vegetarian Hindu Meal (AVML)</option>
                    <option value="Non-Vegetarian Chicken Meal">Non-Vegetarian Chicken Meal</option>
                    <option value="Jain Vegetarian Meal (VJML)">Jain Vegetarian Meal (VJML)</option>
                    <option value="Diabetic Meal (DBML)">Diabetic Meal (DBML)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INTERACTIVE SEAT SELECTION */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-['Outfit']">
                    Cabin Seat Selection ({flight.aircraft.model})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Selected Seat: <strong className="text-sky-700 text-sm font-mono">{selectedSeat}</strong> •{' '}
                    {tierFare.seatSelectionIncluded ? 'Included in your Flexi/Standard tier' : `+₹${seatFee} seat fee`}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-sky-600 inline-block" /> Selected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-white border border-[#E8E2D5] inline-block" /> Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-300 inline-block" /> Occupied
                  </span>
                </div>
              </div>

              {/* Fuselage Container */}
              <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E8E2D5] max-w-md mx-auto text-center shadow-sm">
                <div className="w-28 h-10 mx-auto bg-white rounded-t-full border-t border-x border-[#E0DACF] flex items-center justify-center text-[10px] text-slate-400 font-mono tracking-widest mb-3">
                  COCKPIT
                </div>

                {/* Business Class */}
                <div className="mb-4 p-3 rounded-2xl bg-white border border-sky-100 shadow-sm">
                  <div className="text-[10px] font-bold text-sky-700 uppercase tracking-widest mb-2">
                    Wiings Business Suites (1 - 2 - 1)
                  </div>
                  <div className="space-y-1.5">
                    {[1, 2, 3].map((row) => (
                      <div key={row} className="flex items-center justify-between px-2">
                        {['A', 'C', 'D', 'F'].map((col) => {
                          const seatId = `${row}${col}`;
                          const isOccupied = occupiedSeats.has(seatId);
                          const isSelected = selectedSeat === seatId;

                          return (
                            <button
                              key={seatId}
                              type="button"
                              disabled={isOccupied}
                              onClick={() => setSelectedSeat(seatId)}
                              className={`w-10 h-10 rounded-xl text-xs font-bold font-mono transition-all flex flex-col items-center justify-center ${
                                isSelected
                                  ? 'bg-sky-600 text-white shadow-md scale-105'
                                  : isOccupied
                                  ? 'bg-rose-50 border border-rose-200 text-rose-300 cursor-not-allowed'
                                  : 'bg-white hover:bg-sky-50 border border-[#E8E2D5] text-slate-700'
                              }`}
                            >
                              <span>{seatId}</span>
                              <span className="text-[7px] opacity-75">Suite</span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-[#E8E2D5] my-3" />

                {/* Economy Class */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                    Economy Main Cabin (3 - 3)
                  </div>

                  {[10, 11, 12, 13, 14, 15].map((row) => {
                    const isExitRow = row === 12 || row === 13;
                    return (
                      <div key={row} className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {['A', 'B', 'C'].map((col) => {
                            const seatId = `${row}${col}`;
                            const isOccupied = occupiedSeats.has(seatId);
                            const isSelected = selectedSeat === seatId;

                            return (
                              <button
                                key={seatId}
                                type="button"
                                disabled={isOccupied}
                                onClick={() => setSelectedSeat(seatId)}
                                className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-all ${
                                  isSelected
                                    ? 'bg-sky-600 text-white shadow-sm'
                                    : isOccupied
                                    ? 'bg-rose-50 text-rose-300 cursor-not-allowed border border-rose-100'
                                    : isExitRow
                                    ? 'bg-sky-50 border border-sky-200 text-sky-800'
                                    : 'bg-white hover:bg-slate-50 border border-[#E8E2D5] text-slate-700'
                                }`}
                              >
                                {seatId}
                              </button>
                            );
                          })}
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono font-semibold px-2">
                          {row}
                        </span>

                        <div className="flex gap-1">
                          {['D', 'E', 'F'].map((col) => {
                            const seatId = `${row}${col}`;
                            const isOccupied = occupiedSeats.has(seatId);
                            const isSelected = selectedSeat === seatId;

                            return (
                              <button
                                key={seatId}
                                type="button"
                                disabled={isOccupied}
                                onClick={() => setSelectedSeat(seatId)}
                                className={`w-8 h-8 rounded-lg text-xs font-mono font-semibold transition-all ${
                                  isSelected
                                    ? 'bg-sky-600 text-white shadow-sm'
                                    : isOccupied
                                    ? 'bg-rose-50 text-rose-300 cursor-not-allowed border border-rose-100'
                                    : isExitRow
                                    ? 'bg-sky-50 border border-sky-200 text-sky-800'
                                    : 'bg-white hover:bg-slate-50 border border-[#E8E2D5] text-slate-700'
                                }`}
                              >
                                {seatId}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ADD-ONS */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-bold text-slate-900 font-['Outfit']">
                  Curated Services & Enhancements
                </h4>
                <p className="text-xs text-slate-500">
                  Select premium dining, excess baggage, and lounge privileges.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADD_ONS.map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);

                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-sky-50/70 border-sky-400 shadow-sm'
                          : 'bg-white border-[#E8E2D5] hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-sky-50 text-sky-600 mt-0.5 border border-sky-100">
                          {addon.icon === 'Utensils' && <Utensils className="w-4 h-4" />}
                          {addon.icon === 'Luggage' && <Luggage className="w-4 h-4" />}
                          {addon.icon === 'Coffee' && <Coffee className="w-4 h-4" />}
                          {addon.icon === 'ShieldCheck' && <ShieldCheck className="w-4 h-4" />}
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-slate-900">{addon.name}</h5>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {addon.description}
                          </p>
                          <span className="inline-block mt-1 font-mono font-bold text-sky-700 text-xs">
                            +₹{addon.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-sky-600 border-sky-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 font-bold" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: FARE SUMMARY & PAYMENT */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Payment Selection */}
                <div className="md:col-span-7 space-y-4">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 font-['Outfit']">
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    Payment Method
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'Credit/Debit Card', label: 'Credit / Debit Card' },
                      { id: 'UPI / QR Code', label: 'UPI / Instant QR' },
                      { id: 'Net Banking', label: 'Net Banking' },
                      { id: 'Apple Pay', label: 'Apple Pay' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          paymentMethod === pm.id
                            ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-sm'
                            : 'bg-white border-[#E8E2D5] text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'Credit/Debit Card' && (
                    <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] space-y-3 shadow-sm">
                      <div>
                        <label className="text-xs text-slate-500 block mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-500 block mb-1">Expiry</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 block mb-1">CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'UPI / QR Code' && (
                    <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] text-center space-y-2 shadow-sm">
                      <div className="w-28 h-28 mx-auto bg-slate-50 p-2 rounded-xl flex items-center justify-center border border-slate-100">
                        <QrCode className="w-24 h-24 text-slate-800" />
                      </div>
                      <p className="text-xs text-slate-600">Scan via Google Pay, PhonePe, Paytm, or BHIM.</p>
                    </div>
                  )}
                </div>

                {/* Fare Summary */}
                <div className="md:col-span-5 bg-white p-4 rounded-2xl border border-[#E8E2D5] flex flex-col justify-between shadow-sm">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-2 mb-3">
                      Fare Calculation
                    </h5>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Base Airfare ({passengersCount}x)</span>
                        <span className="font-mono">₹{fareCalc.baseFareTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Seat Selection ({selectedSeat})</span>
                        <span className="font-mono">₹{fareCalc.seatFeesTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Selected Add-ons ({selectedAddons.length})</span>
                        <span className="font-mono">₹{fareCalc.addOnsTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Taxes & Aviation Fees (12%)</span>
                        <span className="font-mono">
                          ₹{(fareCalc.airportTaxesAndGst + fareCalc.aviationSecurityFee + fareCalc.fuelSurcharge).toLocaleString()}
                        </span>
                      </div>

                      <div className="h-px bg-slate-100 my-2" />

                      <div className="flex justify-between text-base font-extrabold text-sky-700">
                        <span>Grand Total</span>
                        <span className="font-mono">₹{fareCalc.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleCompletePayment}
                      className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Authorizing Ticket Issuance...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Authorize Payment (₹{fareCalc.grandTotal.toLocaleString()})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: E-TICKET CONFIRMATION */}
          {step === 5 && confirmedBooking && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
                  Booking Confirmed! Have a Pleasant Flight!
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your electronic ticket has been generated. Confirmation SMS & Email dispatched.
                </p>
              </div>

              {/* Printable Official E-Ticket Card */}
              <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-sm border border-[#E8E2D5] font-sans">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-sky-600" />
                    <div>
                      <span className="text-lg font-black tracking-wider font-['Outfit'] text-slate-900">
                        WIINGS AIRLINE
                      </span>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest">
                        Official Electronic Passenger Ticket & Itinerary
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Booking Reference (PNR)</span>
                    <div className="text-lg font-black font-mono text-sky-700 tracking-wider">
                      {confirmedBooking.pnr}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Passenger</span>
                    <strong className="text-xs text-slate-900">
                      {passengers[0].title} {passengers[0].firstName} {passengers[0].lastName}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Flight / Date</span>
                    <strong className="text-xs font-mono text-slate-900">
                      {flight.flightNumber} • {confirmedBooking.bookingDate}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Seat / Class</span>
                    <strong className="text-xs font-mono text-sky-700 font-bold">
                      {selectedSeat} ({cabinClass})
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Gate / Terminal</span>
                    <strong className="text-xs text-slate-900">
                      Gate {flight.gate} • {flight.terminal}
                    </strong>
                  </div>
                </div>

                <div className="py-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black font-mono text-slate-900">{flight.departureTime}</span>
                    <p className="text-xs font-bold text-slate-700">{flight.origin.city} ({flight.origin.code})</p>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 font-medium">{flight.duration} Non-stop</span>
                    <div className="w-20 h-0.5 bg-slate-200 my-1 mx-auto" />
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      CONFIRMED
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black font-mono text-slate-900">{flight.arrivalTime}</span>
                    <p className="text-xs font-bold text-slate-700">{flight.destination.city} ({flight.destination.code})</p>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                  <p>Baggage: <strong>{tierFare.cabinBaggage} Cabin + {tierFare.checkInBaggage} Check-in</strong></p>
                  <div className="text-center font-mono">
                    <span className="text-xs tracking-widest text-slate-800 font-black">
                      ||| |||| | ||||| ||| || |||||| | |||
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#E8E2D5] text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print E-Ticket</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        {step < 5 && (
          <div className="p-4 border-t border-[#EBE5DA] bg-white flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  if (!passengers[0].firstName || !passengers[0].lastName || !passengers[0].email) {
                    alert('Please enter passenger First Name, Last Name, and Email.');
                    return;
                  }
                  setStep(2);
                } else if (step === 2) {
                  setStep(3);
                } else if (step === 3) {
                  setStep(4);
                }
              }}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <span>{step === 4 ? 'Complete Payment' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
