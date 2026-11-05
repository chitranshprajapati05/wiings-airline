import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles, X, Check, Plane, ShieldCheck, ArrowRight, ArrowLeft,
  CreditCard, Compass, HelpCircle, Utensils, Luggage, Coffee, CheckCircle2,
  HeartHandshake, ChevronRight, Zap
} from 'lucide-react';
import { Flight, Booking } from '../../types/airline';
import { AIRPORTS } from '../../data/mockData';
import { getAiSmartRecommendation, calculateFare, generatePNR } from '../../utils/airlineLogic';

interface AiSmartBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flights: Flight[];
  onBookingSuccess: (booking: Booking) => void;
  onNavigateTab: (tab: string) => void;
}

export const AiSmartBookingModal: React.FC<AiSmartBookingModalProps> = ({
  isOpen,
  onClose,
  flights,
  onBookingSuccess,
  onNavigateTab,
}) => {
  const [activeMode, setActiveMode] = useState<'smart-book' | 'explainer'>('smart-book');

  // Auto-Booking state
  const [destCode, setDestCode] = useState('DXB');
  const [priority, setPriority] = useState<'budget' | 'comfort' | 'flexibility'>('comfort');
  const [passengerName, setPassengerName] = useState('Aarav Verma');
  const [passengerEmail, setPassengerEmail] = useState('aarav.verma@example.com');
  const [passengerPhone, setPassengerPhone] = useState('+91 98765 12345');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'UPI' | 'ApplePay'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedPnr, setConfirmedPnr] = useState('');

  if (!isOpen) return null;

  const recommendation = getAiSmartRecommendation(flights, {
    destinationCode: destCode,
    priority,
    passengerCount: 1,
  });

  const fareCalc = calculateFare({
    basePricePerPassenger: recommendation.selectedFare.price,
    passengerCount: 1,
    seatSelectionFee: 0,
    addOnsTotal: priority === 'comfort' ? 1400 : priority === 'flexibility' ? 499 : 0,
    tierMultiplier: 1.0,
  });

  const handleInstantBook = async () => {
    setIsProcessing(true);
    try {
      const pnr = generatePNR();
      const newBooking: Booking = {
        pnr,
        bookingDate: new Date().toISOString().split('T')[0],
        flight: recommendation.flight,
        cabinClass: recommendation.cabinClass,
        fareTier: recommendation.fareTier,
        passengers: [
          {
            id: `p-${Date.now()}`,
            title: 'Mr',
            firstName: passengerName.split(' ')[0] || 'Traveler',
            lastName: passengerName.split(' ')[1] || 'Guest',
            email: passengerEmail,
            phone: passengerPhone,
            dateOfBirth: '1995-06-15',
            nationality: 'Indian',
            cabinClass: recommendation.cabinClass,
            seatNumber: recommendation.suggestedSeat,
            mealPreference: priority === 'comfort' ? 'Chef Specialty Salmon' : 'Vegetarian Hindu Meal (AVML)',
          },
        ],
        selectedSeats: [recommendation.suggestedSeat],
        baggage: [],
        addOns: [],
        baseFare: fareCalc.baseFareTotal,
        taxesAndFees: fareCalc.airportTaxesAndGst + fareCalc.aviationSecurityFee + fareCalc.fuelSurcharge,
        totalAmount: fareCalc.grandTotal,
        paymentMethod: paymentMethod === 'UPI' ? 'UPI / QR Code' : paymentMethod === 'ApplePay' ? 'Apple Pay' : 'Credit/Debit Card',
        paymentStatus: 'Paid',
        bookingStatus: 'Confirmed',
        checkInCompleted: false,
        boardingCompleted: false,
        boardingPassIssued: false,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });

      if (res.ok) {
        setConfirmedPnr(pnr);
        setIsConfirmed(true);
        onBookingSuccess(newBooking);
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const dashboardFeatures = [
    {
      title: '1. Book Flights (फ़्लाइट टिकट बुक करें)',
      desc: 'Yahan aap origin aur destination select karke flights search karte hain, fare choose karte hain, aircraft seat map me seat select karte hain aur instant ticket generate karte hain.',
      tab: 'search',
      tag: 'Passenger Booking',
    },
    {
      title: '2. Manage Trips (अपनी टिकट देखें या कैंसिल करें)',
      desc: 'Apna 6-letter PNR (e.g. WG-78K9A) daal kar ticket dekh sakte hain, baggage track kar sakte hain aur transparent 1-click refund ke sath ticket cancel kar sakte hain.',
      tab: 'manage',
      tag: 'Self Service',
    },
    {
      title: '3. Web Check-in (डिजिटल बोर्डिंग पास)',
      desc: 'Flight se 48 ghante pehle online check-in karein, safety declaration confirm karein aur apna digital boarding pass QR code ke sath download/print karein.',
      tab: 'checkin',
      tag: 'Express Gate Entry',
    },
    {
      title: '4. Flight Radar (लाइव फ़्लाइट स्टेटस)',
      desc: 'Airports par departure delays, runway movements aur assigned gate (e.g. Gate 14B) real-time me track karein.',
      tab: 'status',
      tag: 'Live Ops',
    },
    {
      title: '5. Airport Staff & Admin Terminal (ऑपरेशन्स)',
      desc: 'Staff portal me boarding gate controllers, luggage weighing scale aur passenger verification desk access kar sakte hain. Admin me revenue analytics aur nayi flight schedule kar sakte hain.',
      tab: 'staff',
      tag: 'Airline Crew & Management',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-2xl bg-[#FCFAF6] border border-[#E8E2D5] rounded-3xl text-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Luxury Header */}
        <div className="p-5 border-b border-[#EBE5DA] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                  Aero AI Smart Concierge
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100/70 text-sky-700 border border-sky-200">
                  Instant Auto-Curate
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Short, effortless luxury booking without dashboard complexity.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="px-6 py-2.5 bg-[#F6F2E9]/70 border-b border-[#EBE5DA] flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMode('smart-book')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeMode === 'smart-book'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            ⚡ 1-Click Smart Auto-Booking
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('explainer')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeMode === 'explainer'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            📖 Explain Dashboard Features Simply
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {activeMode === 'smart-book' && (
            <div>
              {!isConfirmed ? (
                <div className="space-y-6">
                  {/* Step 1: Destination & Priority */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-sky-600" />
                      1. Where would you like to travel?
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {[
                        { code: 'DXB', label: 'Dubai (DXB)' },
                        { code: 'LHR', label: 'London (LHR)' },
                        { code: 'SIN', label: 'Singapore (SIN)' },
                        { code: 'JFK', label: 'New York (JFK)' },
                      ].map((d) => (
                        <button
                          key={d.code}
                          type="button"
                          onClick={() => setDestCode(d.code)}
                          className={`p-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                            destCode === d.code
                              ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                              : 'bg-white text-slate-700 border-[#E8E2D5] hover:border-sky-300'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority selector */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      2. What is your priority for this journey?
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
                      {[
                        {
                          id: 'budget',
                          title: 'Value Saver',
                          desc: 'Best lowest fare, direct non-stop, essential 15kg baggage.',
                          badge: 'Economy Lite',
                        },
                        {
                          id: 'comfort',
                          title: 'Luxury & Dining',
                          desc: 'Business Suite, lie-flat seat 2A, lounge & chef meal.',
                          badge: 'Business Class',
                        },
                        {
                          id: 'flexibility',
                          title: 'Total Flexibility',
                          desc: 'Free reschedule, 35kg baggage & instant refundable.',
                          badge: 'Economy Flexi',
                        },
                      ].map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setPriority(p.id as any)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            priority === p.id
                              ? 'bg-sky-50/80 border-sky-400 shadow-sm'
                              : 'bg-white border-[#E8E2D5] hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-slate-900">{p.title}</span>
                            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {p.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{p.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Curated AI Package Card */}
                  <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                          AI Curated Match
                        </span>
                        <span className="text-sm font-bold font-mono text-slate-900">
                          {recommendation.flight.flightNumber}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Price</span>
                        <span className="text-lg font-black font-mono text-sky-700">
                          ₹{fareCalc.grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Departure</span>
                        <strong className="text-slate-800">{recommendation.flight.departureTime}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Class</span>
                        <strong className="text-slate-800">{recommendation.cabinClass} ({recommendation.fareTier})</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Assigned Seat</span>
                        <strong className="text-sky-700 font-mono">{recommendation.suggestedSeat}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Gate & Terminal</span>
                        <strong className="text-slate-800">Gate {recommendation.flight.gate} • {recommendation.flight.terminal}</strong>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-sky-50/50 p-2.5 rounded-xl border border-sky-100">
                      💡 <strong>Why this was chosen:</strong> {recommendation.reasoning}
                    </p>
                  </div>

                  {/* Traveler details */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Passenger Contact (Instant E-Ticket Dispatch)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">Full Name</label>
                        <input
                          type="text"
                          value={passengerName}
                          onChange={(e) => setPassengerName(e.target.value)}
                          className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">Email</label>
                        <input
                          type="email"
                          value={passengerEmail}
                          onChange={(e) => setPassengerEmail(e.target.value)}
                          className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment selector */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex gap-2">
                      {['UPI', 'Card', 'ApplePay'].map((pm) => (
                        <button
                          key={pm}
                          type="button"
                          onClick={() => setPaymentMethod(pm as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                            paymentMethod === pm
                              ? 'bg-sky-50 border-sky-500 text-sky-700'
                              : 'bg-white border-[#E8E2D5] text-slate-600'
                          }`}
                        >
                          {pm === 'UPI' ? 'Instant UPI' : pm === 'Card' ? 'Credit Card' : 'Apple Pay'}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleInstantBook}
                      className="py-3 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/20 active:scale-95 transition-all"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Issuing Ticket...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>1-Click Pay & Book (₹{fareCalc.grandTotal.toLocaleString()})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Instant Confirmation Card */
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 font-['Outfit']">
                    Congratulations! Your Journey is Confirmed!
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Your PNR has been issued without having to deal with complex settings.
                  </p>

                  <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] max-w-sm mx-auto text-left shadow-sm space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-2 border-slate-100">
                      <span className="text-slate-500">Booking Reference (PNR)</span>
                      <strong className="font-mono text-sky-700 font-black text-sm">{confirmedPnr}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Flight</span>
                      <strong className="text-slate-800">{recommendation.flight.flightNumber}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seat Pre-reserved</span>
                      <strong className="text-sky-700 font-mono">{recommendation.suggestedSeat}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Passenger</span>
                      <strong className="text-slate-800">{passengerName}</strong>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateTab('manage');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      View in Manage Trips
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-white border border-[#E8E2D5] hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mode B: DASHBOARD EXPLAINER */}
          {activeMode === 'explainer' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Wiings Airline Dashboard Guide (आसान भाषा में समझें)
                </h4>
                <p className="text-xs text-slate-500">
                  Yeh dashboard aapko passenger booking se lekar airport gate check-in tak sab kuch manage karne deta hai:
                </p>
              </div>

              <div className="space-y-3">
                {dashboardFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-[#E8E2D5] hover:border-sky-300 transition-all shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-900">{feat.title}</h5>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                        {feat.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateTab(feat.tab);
                        }}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                      >
                        <span>Open this feature</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
