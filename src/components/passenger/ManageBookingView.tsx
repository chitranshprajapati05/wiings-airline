import React, { useState } from 'react';
import { Search, Plane, ShieldAlert, Luggage, Printer, RefreshCw, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { Booking } from '../../types/airline';
import { calculateCancellationRefund } from '../../utils/airlineLogic';

interface ManageBookingViewProps {
  bookings: Booking[];
  onCancelBooking: (pnr: string) => Promise<void>;
  onGoToCheckin: (pnr: string) => void;
}

export const ManageBookingView: React.FC<ManageBookingViewProps> = ({
  bookings,
  onCancelBooking,
  onGoToCheckin,
}) => {
  const [searchPnr, setSearchPnr] = useState('WG-78K9A');
  const [searchLastName, setSearchLastName] = useState('Sharma');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(bookings[0] || null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchPnr.trim().toUpperCase();
    const found = bookings.find(
      (b) => b.pnr.toUpperCase() === clean || b.pnr.toUpperCase() === `WG-${clean}`
    );

    if (found) {
      setSelectedBooking(found);
    } else {
      alert(`No booking found matching PNR: ${searchPnr}`);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!selectedBooking) return;
    setIsCancelling(true);
    try {
      await onCancelBooking(selectedBooking.pnr);
      setShowCancelModal(false);
      const updated = bookings.find((b) => b.pnr === selectedBooking.pnr);
      if (updated) setSelectedBooking({ ...updated, bookingStatus: 'Cancelled' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsCancelling(false);
    }
  };

  const refundDetails = selectedBooking
    ? calculateCancellationRefund(selectedBooking.totalAmount, selectedBooking.fareTier, 36)
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header */}
      <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
        <div className="max-w-2xl mb-4">
          <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
            Manage Reservation & Digital Itinerary
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Retrieve flight details, view baggage tracking status, or request transparent refunds.
          </p>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="text-xs text-slate-500 block mb-1 font-medium">
              Booking Reference (PNR) *
            </label>
            <input
              type="text"
              required
              value={searchPnr}
              onChange={(e) => setSearchPnr(e.target.value)}
              placeholder="e.g. WG-78K9A"
              className="w-full bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono font-bold uppercase focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="text-xs text-slate-500 block mb-1 font-medium">
              Passenger Surname
            </label>
            <input
              type="text"
              value={searchLastName}
              onChange={(e) => setSearchLastName(e.target.value)}
              placeholder="e.g. Sharma"
              className="w-full bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Retrieve Booking</span>
            </button>
          </div>
        </form>

        <div className="mt-3 pt-3 border-t border-[#F0EBE1] flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium text-[11px]">Quick Samples:</span>
          {bookings.map((b) => (
            <button
              key={b.pnr}
              type="button"
              onClick={() => {
                setSearchPnr(b.pnr);
                setSelectedBooking(b);
              }}
              className={`px-2 py-0.5 rounded-lg font-mono text-[11px] transition-all ${
                selectedBooking?.pnr === b.pnr
                  ? 'bg-sky-600 text-white font-bold'
                  : 'bg-[#FAF8F5] text-slate-600 border border-[#E8E2D5]'
              }`}
            >
              {b.pnr} ({b.passengers[0]?.lastName})
            </button>
          ))}
        </div>
      </div>

      {selectedBooking && (
        <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EBE1]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium uppercase">PNR</span>
                <span className="text-base font-mono font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                  {selectedBooking.pnr}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    selectedBooking.bookingStatus === 'Confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : selectedBooking.bookingStatus === 'Cancelled'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}
                >
                  {selectedBooking.bookingStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Booked on {selectedBooking.bookingDate} • {selectedBooking.fareTier} {selectedBooking.cabinClass} Class
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 border border-[#E8E2D5]"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              {selectedBooking.bookingStatus !== 'Cancelled' && (
                <>
                  <button
                    type="button"
                    onClick={() => onGoToCheckin(selectedBooking.pnr)}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                  >
                    Web Check-in
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold"
                  >
                    Cancel Ticket
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Flight Card */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 font-mono">
                    Flight {selectedBooking.flight.flightNumber}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedBooking.flight.aircraft.model} • Gate {selectedBooking.flight.gate} • Terminal {selectedBooking.flight.terminal}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div>
                  <div className="text-base font-black text-slate-900 font-mono">
                    {selectedBooking.flight.departureTime}
                  </div>
                  <div className="text-xs font-bold text-sky-700">
                    {selectedBooking.flight.origin.city} ({selectedBooking.flight.origin.code})
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-[10px] text-slate-400">{selectedBooking.flight.duration}</div>
                  <div className="w-14 h-0.5 bg-slate-300 my-1 mx-auto" />
                  <div className="text-[9px] text-emerald-700 font-semibold">Non-Stop</div>
                </div>

                <div>
                  <div className="text-base font-black text-slate-900 font-mono">
                    {selectedBooking.flight.arrivalTime}
                  </div>
                  <div className="text-xs font-bold text-sky-700">
                    {selectedBooking.flight.destination.city} ({selectedBooking.flight.destination.code})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Baggage tracking */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5]">
            <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Luggage className="w-3.5 h-3.5 text-sky-600" />
              Luggage Tracking & Carousel Status
            </h5>

            {selectedBooking.baggage.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No checked baggage registered for this booking.</p>
            ) : (
              <div className="space-y-2">
                {selectedBooking.baggage.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white border border-[#E8E2D5] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-sky-700">{b.tagNumber}</span>
                      <span className="text-slate-500 ml-2">Weight: {b.weightKg} kg • Belt: {b.carousel}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && selectedBooking && refundDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-[#E8E2D5] rounded-3xl p-6 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Cancel Ticket & Calculate Refund
              </h3>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5] text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Original Fare Paid:</span>
                <span className="font-mono font-bold">₹{selectedBooking.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Cancellation Fee:</span>
                <span className="font-mono font-bold">-₹{refundDetails.cancellationFee.toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-200 my-1" />
              <div className="flex justify-between text-sm font-bold text-emerald-700">
                <span>Refund Amount:</span>
                <span className="font-mono font-black">₹{refundDetails.refundAmount.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-slate-400">{refundDetails.policyNote}</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancellation}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
              >
                {isCancelling ? 'Processing...' : 'Confirm & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
