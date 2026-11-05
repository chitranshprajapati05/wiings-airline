import React, { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, QrCode, Printer, Plane, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { Booking } from '../../types/airline';

interface WebCheckInViewProps {
  bookings: Booking[];
  prefilledPnr?: string;
  onCheckInComplete: (pnr: string, seat: string) => Promise<void>;
}

export const WebCheckInView: React.FC<WebCheckInViewProps> = ({
  bookings,
  prefilledPnr = 'WG-78K9A',
  onCheckInComplete,
}) => {
  const [pnrInput, setPnrInput] = useState(prefilledPnr);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
    bookings.find((b) => b.pnr === prefilledPnr) || bookings[0] || null
  );

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [declaredSafety, setDeclaredSafety] = useState(false);
  const [assignedSeat, setAssignedSeat] = useState(selectedBooking?.selectedSeats[0] || '12A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pnrInput.trim().toUpperCase();
    const found = bookings.find(
      (b) => b.pnr.toUpperCase() === clean || b.pnr.toUpperCase() === `WG-${clean}`
    );

    if (found) {
      setSelectedBooking(found);
      setAssignedSeat(found.selectedSeats[0] || '12A');
      setStep(1);
    } else {
      alert(`No booking found matching PNR ${pnrInput}`);
    }
  };

  const handleFinishCheckin = async () => {
    if (!selectedBooking) return;
    setIsSubmitting(true);
    try {
      await onCheckInComplete(selectedBooking.pnr, assignedSeat);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header */}
      <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm">
        <div className="max-w-xl mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-2">
            <Plane className="w-3.5 h-3.5" />
            <span>Opens 48h Prior • Closes 60 mins before departure</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
            Wiings Airline Web Check-in & Boarding Pass
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirm seat assignment, review safety regulations, and generate your digital pass.
          </p>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-8">
            <label className="text-xs text-slate-500 block mb-1 font-medium">
              Booking Reference (PNR) *
            </label>
            <input
              type="text"
              required
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value)}
              placeholder="e.g. WG-78K9A"
              className="w-full bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="sm:col-span-4">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Retrieve Itinerary</span>
            </button>
          </div>
        </form>
      </div>

      {selectedBooking && (
        <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 sm:p-7 shadow-sm">
          {step === 1 && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-[#F0EBE1] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                    Step 1: Aviation Safety & Prohibited Articles Declaration
                  </h3>
                  <p className="text-xs text-slate-500">
                    Flight: <strong className="text-sky-700 font-mono">{selectedBooking.flight.flightNumber}</strong> ({selectedBooking.flight.origin.city} → {selectedBooking.flight.destination.city})
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5] space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-amber-600 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Mandatory Security Declaration</span>
                </div>
                <p className="leading-relaxed">
                  I confirm that I am not carrying any explosives, flammable liquids, compressed gases, or dangerous chemicals in my baggage. Power banks and spare lithium batteries must remain strictly in cabin hand baggage.
                </p>
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-slate-900">
                    <input
                      type="checkbox"
                      checked={declaredSafety}
                      onChange={(e) => setDeclaredSafety(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <span>I understand and certify that my baggage complies with all airline safety regulations.</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!declaredSafety}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>Proceed to Seat Confirmation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-[#F0EBE1]">
                <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
                  Step 2: Confirm Seat Number
                </h3>
              </div>

              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E2D5] max-w-sm mx-auto text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto text-xl font-mono font-black border border-sky-100">
                  {assignedSeat}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Seat {assignedSeat}</h4>
                  <p className="text-[11px] text-slate-500">Forward Cabin • Window Seat</p>
                </div>

                <div className="flex justify-center gap-2 text-xs">
                  {['12A', '12F', '14C', '3A'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAssignedSeat(s)}
                      className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
                        assignedSeat === s
                          ? 'bg-sky-600 text-white'
                          : 'bg-white text-slate-700 border border-[#E8E2D5]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Back
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinishCheckin}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmitting ? 'Issuing Pass...' : 'Issue Boarding Pass'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center">
                <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mb-1.5">
                  ✓ Check-in Verified • Ready to Board
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">
                  Official Digital Boarding Pass
                </h3>
              </div>

              {/* Boarding Pass */}
              <div className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-sm border border-[#E8E2D5] max-w-xl mx-auto">
                <div className="bg-sky-600 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4" />
                    <span className="font-extrabold tracking-wider font-['Outfit'] text-sm">
                      WIINGS AIRLINE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-100">
                    BOARDING PASS #{selectedBooking.pnr}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Passenger</span>
                      <strong className="text-slate-900 text-xs">
                        {selectedBooking.passengers[0]?.firstName} {selectedBooking.passengers[0]?.lastName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Flight</span>
                      <strong className="text-slate-900 font-mono text-xs">{selectedBooking.flight.flightNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Gate</span>
                      <strong className="text-sky-700 font-mono text-xs">{selectedBooking.flight.gate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Seat</span>
                      <strong className="text-sky-700 font-mono text-xs">{assignedSeat}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-black font-mono text-slate-900">
                        {selectedBooking.flight.origin.code}
                      </span>
                      <p className="text-xs text-slate-500">{selectedBooking.flight.origin.city}</p>
                      <p className="text-xs font-mono font-bold text-sky-700 mt-0.5">Dep: {selectedBooking.flight.departureTime}</p>
                    </div>

                    <div className="text-center">
                      <div className="p-1 bg-white border border-slate-200 rounded-lg">
                        <QrCode className="w-14 h-14 text-slate-900" />
                      </div>
                      <span className="text-[8px] font-mono text-slate-400 mt-0.5 block">GATE SCANNER</span>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-slate-900">
                        {selectedBooking.flight.destination.code}
                      </span>
                      <p className="text-xs text-slate-500">{selectedBooking.flight.destination.city}</p>
                      <p className="text-xs font-mono font-bold text-sky-700 mt-0.5">Arr: {selectedBooking.flight.arrivalTime}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8E2D5] text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Boarding Pass</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
