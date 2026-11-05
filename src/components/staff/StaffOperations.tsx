import React, { useState } from 'react';
import {
  Briefcase, CheckCircle2, ShieldCheck, Luggage, QrCode, AlertTriangle,
  Plane, Search, ArrowRight, UserCheck, Volume2, Clock, MapPin, Tag, RefreshCw
} from 'lucide-react';
import { Flight, Booking, BaggageStatus, FlightStatus, BaggageItem } from '../../types/airline';
import { STAFF_MEMBERS } from '../../data/mockData';

interface StaffOperationsProps {
  flights: Flight[];
  bookings: Booking[];
  onUpdateFlightStatus: (flightId: string, status: FlightStatus, delayMins?: number, delayReason?: string, gate?: string) => Promise<void>;
  onCheckInPassenger: (pnr: string, seat: string) => Promise<void>;
  onBoardPassenger: (pnr: string) => Promise<void>;
  onAddBaggage: (pnr: string, weightKg: number) => Promise<void>;
  onUpdateBaggageStatus: (tagNumber: string, status: BaggageStatus) => Promise<void>;
}

export const StaffOperations: React.FC<StaffOperationsProps> = ({
  flights,
  bookings,
  onUpdateFlightStatus,
  onCheckInPassenger,
  onBoardPassenger,
  onAddBaggage,
  onUpdateBaggageStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'gate' | 'baggage' | 'flights'>('checkin');
  const [staffUser] = useState(STAFF_MEMBERS[1]); // Priya Nambiar, Check-in Agent

  // Check-in desk state
  const [deskPnr, setDeskPnr] = useState('WG-78K9A');
  const [activeBooking, setActiveBooking] = useState<Booking | null>(bookings[0] || null);
  const [bagWeightInput, setBagWeightInput] = useState('18.5');
  const [isTaggingBag, setIsTaggingBag] = useState(false);

  // Gate controller state
  const [selectedGateFlightId, setSelectedGateFlightId] = useState<string>(flights[0]?.id || '');
  const [newGateInput, setNewGateInput] = useState('14B');
  const [announcementMsg, setAnnouncementMsg] = useState('');

  // Flight ops state
  const [selectedOpsFlightId, setSelectedOpsFlightId] = useState<string>(flights[1]?.id || '');
  const [newStatus, setNewStatus] = useState<FlightStatus>('Check-in Open');
  const [delayMinutes, setDelayMinutes] = useState('30');
  const [delayReason, setDelayReason] = useState('Air traffic control sequencing delay');

  const selectedGateFlight = flights.find((f) => f.id === selectedGateFlightId) || flights[0];
  const selectedOpsFlight = flights.find((f) => f.id === selectedOpsFlightId) || flights[0];

  // Bookings for selected gate flight
  const flightBookings = bookings.filter((b) => b.flight.id === selectedGateFlight?.id);
  const boardedCount = flightBookings.filter((b) => b.boardingCompleted).length;

  const handleSearchDesk = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = deskPnr.trim().toUpperCase();
    const found = bookings.find(
      (b) => b.pnr.toUpperCase() === clean || b.pnr.toUpperCase() === `WG-${clean}`
    );
    if (found) {
      setActiveBooking(found);
    } else {
      alert(`No booking found matching PNR: ${deskPnr}`);
    }
  };

  const handleAddBaggageTag = async () => {
    if (!activeBooking) return;
    setIsTaggingBag(true);
    try {
      await onAddBaggage(activeBooking.pnr, parseFloat(bagWeightInput) || 15);
      // refresh booking reference
      const refreshed = bookings.find((b) => b.pnr === activeBooking.pnr);
      if (refreshed) setActiveBooking({ ...refreshed });
    } catch (err) {
      console.error(err);
    } finally {
      setIsTaggingBag(false);
    }
  };

  const handleGateChange = async () => {
    if (!selectedGateFlight) return;
    await onUpdateFlightStatus(selectedGateFlight.id, selectedGateFlight.status, undefined, undefined, newGateInput);
    alert(`Gate for flight ${selectedGateFlight.flightNumber} successfully changed to ${newGateInput}. Announcement dispatched!`);
  };

  const handleDispatchAnnouncement = (preset?: string) => {
    const text = preset || announcementMsg;
    if (!text) return;
    alert(`📢 GATE BROADCAST: "${text}" sent to terminal speakers and passenger mobile devices.`);
    setAnnouncementMsg('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Staff Header & Duty Profile Banner */}
      <div className="bg-white border border-[#E8E2D5] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-sm">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit']">Airport Staff Operations Terminal</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE DUTY
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged in as: <strong className="text-slate-800">{staffUser.name}</strong> ({staffUser.role}) • Badge: <strong className="text-sky-700 font-mono">{staffUser.badgeId}</strong> • {staffUser.terminal}
            </p>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#E8E2D5] text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('checkin')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'checkin'
                ? 'bg-sky-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Check-in & Baggage Scale
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gate')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'gate'
                ? 'bg-sky-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Boarding Gate Scanner
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('baggage')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'baggage'
                ? 'bg-sky-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cargo & Carousel Hub
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flights')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'flights'
                ? 'bg-sky-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flight Status & Delays
          </button>
        </div>
      </div>

      {/* TAB 1: PASSENGER VERIFICATION & BAGGAGE DESK */}
      {activeTab === 'checkin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Passenger Lookup */}
          <div className="lg:col-span-5 bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-600" />
                Passenger Verification Desk
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan ticket or enter passenger PNR to verify passport and issue baggage tags.
              </p>
            </div>

            <form onSubmit={handleSearchDesk} className="flex gap-2">
              <input
                type="text"
                value={deskPnr}
                onChange={(e) => setDeskPnr(e.target.value)}
                placeholder="Enter PNR e.g. WG-78K9A"
                className="flex-1 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3.5 py-2 text-sm text-slate-900 font-mono uppercase focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                Lookup
              </button>
            </form>

            {/* Quick Demo Pickers */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {bookings.map((b) => (
                <button
                  key={b.pnr}
                  type="button"
                  onClick={() => {
                    setDeskPnr(b.pnr);
                    setActiveBooking(b);
                  }}
                  className={`px-2 py-1 rounded font-mono border transition-all ${
                    activeBooking?.pnr === b.pnr
                      ? 'bg-sky-600 text-white border-sky-600 font-bold'
                      : 'bg-[#FAF8F5] text-slate-600 border-[#E8E2D5] hover:bg-white'
                  }`}
                >
                  {b.pnr} ({b.passengers[0]?.lastName})
                </button>
              ))}
            </div>

            {/* Passenger Profile Summary */}
            {activeBooking && (
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5] text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                  <span className="font-bold text-slate-900 text-sm">
                    {activeBooking.passengers[0]?.title} {activeBooking.passengers[0]?.firstName} {activeBooking.passengers[0]?.lastName}
                  </span>
                  <span className="font-mono text-sky-700 font-bold">{activeBooking.pnr}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Flight No</span>
                    <strong className="text-slate-900">{activeBooking.flight.flightNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Seat Allocated</span>
                    <strong className="text-sky-700 font-mono">{activeBooking.selectedSeats.join(', ') || 'Unassigned'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Passport / ID</span>
                    <strong className="text-slate-900">{activeBooking.passengers[0]?.passportNumber || 'VERIFIED'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">Check-in Status</span>
                    <strong className={activeBooking.checkInCompleted ? 'text-emerald-700' : 'text-amber-700'}>
                      {activeBooking.checkInCompleted ? 'Checked-in' : 'Pending'}
                    </strong>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onCheckInPassenger(activeBooking.pnr, activeBooking.selectedSeats[0] || '12A')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Identification & Check-in</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Baggage Scale & Barcode Generation Desk */}
          <div className="lg:col-span-7 bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Luggage className="w-5 h-5 text-sky-600" />
                Electronic Baggage Scale & IATA Barcode Tagging Desk
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Weigh baggage at Counter 16, tag piece, and dispatch to Terminal Cargo Conveyor.
              </p>
            </div>

            {/* Weighing input */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E2D5] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1 font-semibold">
                  Digital Scale Weight Reading (kg)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={bagWeightInput}
                    onChange={(e) => setBagWeightInput(e.target.value)}
                    className="w-32 bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xl font-bold font-mono text-sky-700 focus:outline-none focus:border-sky-500 shadow-sm"
                  />
                  <span className="text-sm font-bold text-slate-400">KG</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Allowance: 25 kg • Overweight surcharge applies &gt;25kg
                </span>
              </div>

              <button
                type="button"
                disabled={isTaggingBag || !activeBooking}
                onClick={handleAddBaggageTag}
                className="py-3 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Tag className="w-4 h-4" />
                <span>Issue & Print Baggage Tag</span>
              </button>
            </div>

            {/* Attached Baggage Items */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Active Checked Bags for Passenger ({activeBooking?.baggage.length || 0})
              </h4>

              {activeBooking?.baggage.length === 0 ? (
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] text-center text-xs text-slate-400">
                  No bags attached yet. Place luggage on scale and click "Issue & Print Baggage Tag".
                </div>
              ) : (
                <div className="space-y-2">
                  {activeBooking?.baggage.map((bag, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-50 text-sky-600 rounded-lg border border-sky-100">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-mono font-bold text-sky-700">{bag.tagNumber}</span>
                          <span className="text-slate-500 block text-[11px]">
                            Weight: {bag.weightKg} kg • Carousel: {bag.carousel || 'T3-Car-4'}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                        {bag.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOARDING GATE CONTROLLER */}
      {activeTab === 'gate' && (
        <div className="space-y-6">
          {/* Flight Selector & Gate Progress */}
          <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D5]">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-['Outfit']">
                  <Plane className="w-5 h-5 text-sky-600" />
                  Departure Gate Boarding Controller
                </h3>
                <p className="text-xs text-slate-500">
                  Monitor live passenger boarding scan counts, gate changes, and terminal broadcasts.
                </p>
              </div>

              {/* Select active gate flight */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Active Gate Flight:</span>
                <select
                  value={selectedGateFlightId}
                  onChange={(e) => setSelectedGateFlightId(e.target.value)}
                  className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono font-bold focus:outline-none cursor-pointer"
                >
                  {flights.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.flightNumber} ({f.origin.code} → {f.destination.code}) - Gate {f.gate}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Flight stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5] text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Gate</span>
                <span className="text-2xl font-black text-sky-700 font-mono">Gate {selectedGateFlight.gate}</span>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5] text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Flight Status</span>
                <span className="text-lg font-bold text-emerald-700">{selectedGateFlight.status}</span>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5] text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Passengers Boarded</span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {boardedCount} / {flightBookings.length}
                </span>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D5] text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Departure Time</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{selectedGateFlight.departureTime}</span>
              </div>
            </div>

            {/* Boarding progress bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Boarding Completion</span>
                <span className="font-bold text-slate-900">
                  {flightBookings.length > 0 ? Math.round((boardedCount / flightBookings.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-3 w-full bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E8E2D5]">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${flightBookings.length > 0 ? (boardedCount / flightBookings.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Passenger Boarding Manifest & Scanner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center justify-between font-['Outfit']">
                <span>Passenger Boarding Manifest</span>
                <span className="text-xs text-slate-400 font-normal">
                  Click "Mark as Boarded" to simulate gate scanner
                </span>
              </h4>

              {flightBookings.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-8">
                  No bookings registered for flight {selectedGateFlight.flightNumber} yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {flightBookings.map((b) => (
                    <div
                      key={b.pnr}
                      className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {b.passengers[0]?.firstName} {b.passengers[0]?.lastName}
                          </span>
                          <span className="text-sky-700 font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#E8E2D5]">
                            {b.pnr}
                          </span>
                          <span className="text-slate-500">Seat: {b.selectedSeats.join(', ') || '12A'}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Class: {b.cabinClass} • Bags: {b.baggage.length} Checked
                        </span>
                      </div>

                      <div>
                        {b.boardingCompleted ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            BOARDED
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onBoardPassenger(b.pnr)}
                            className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-sm"
                          >
                            Mark as Boarded
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gate Control & Broadcast Actions */}
            <div className="lg:col-span-4 bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 font-['Outfit']">
                <Volume2 className="w-5 h-5 text-sky-600" />
                Gate Audio & Push Broadcast
              </h4>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleDispatchAnnouncement(`Now boarding all passengers for flight ${selectedGateFlight.flightNumber} to ${selectedGateFlight.destination.city} at Gate ${selectedGateFlight.gate}.`)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] hover:bg-slate-100 text-slate-800 text-xs font-semibold text-left transition-colors border border-[#E8E2D5]"
                >
                  📢 "General Boarding Announcement"
                </button>

                <button
                  type="button"
                  onClick={() => handleDispatchAnnouncement(`Final boarding call for flight ${selectedGateFlight.flightNumber} at Gate ${selectedGateFlight.gate}. Gate closing in 5 minutes.`)}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold text-left transition-colors border border-amber-200"
                >
                  ⚠️ "Final Boarding Call Notice"
                </button>
              </div>

              {/* Gate Change */}
              <div className="pt-3 border-t border-[#E8E2D5]">
                <label className="text-xs text-slate-500 block mb-1 font-semibold">Reassign Gate</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGateInput}
                    onChange={(e) => setNewGateInput(e.target.value)}
                    placeholder="e.g. 12A"
                    className="flex-1 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleGateChange}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CARGO & CAROUSEL HUB */}
      {activeTab === 'baggage' && (
        <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-['Outfit']">
              <Luggage className="w-5 h-5 text-sky-600" />
              Baggage Cargo Routing & Arrival Carousel Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Track and advance luggage states across security scanners, cargo loading, and arrival baggage carousels.
            </p>
          </div>

          <div className="space-y-3">
            {bookings
              .flatMap((b) => b.baggage.map((bag) => ({ ...bag, pnr: b.pnr, flightNumber: b.flight.flightNumber })))
              .map((bag, i) => (
                <div
                  key={i}
                  className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-700 text-sm">{bag.tagNumber}</span>
                      <span className="text-xs bg-white border border-[#E8E2D5] px-2 py-0.5 rounded text-slate-800 font-mono font-semibold">
                        PNR: {bag.pnr}
                      </span>
                      <span className="text-xs text-slate-500">Flight: {bag.flightNumber}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Weight: <strong>{bag.weightKg} kg</strong> • Assigned Carousel:{' '}
                      <strong>{bag.carousel || 'Carousel 4'}</strong> • Last Scan: {bag.lastUpdated}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Change Status:</span>
                    <select
                      value={bag.status}
                      onChange={(e) => onUpdateBaggageStatus(bag.tagNumber, e.target.value as BaggageStatus)}
                      className="bg-white border border-[#E8E2D5] rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer shadow-sm"
                    >
                      <option value="Checked">Checked</option>
                      <option value="Security Screened">Security Screened</option>
                      <option value="Loaded to Cargo">Loaded to Cargo</option>
                      <option value="In-Transit">In-Transit</option>
                      <option value="Arrived at Carousel">Arrived at Carousel</option>
                      <option value="Claimed">Claimed</option>
                    </select>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: FLIGHT STATUS & DELAY OPERATIONS */}
      {activeTab === 'flights' && (
        <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-['Outfit']">
              <Clock className="w-5 h-5 text-sky-600" />
              Flight Departure Operations & Runway Status Controller
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Change flight state (Scheduled, Boarding, Departed, Landed, Delayed) and publish passenger advisories.
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E2D5] grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="text-xs text-slate-500 block mb-1 font-semibold">Select Target Flight</label>
              <select
                value={selectedOpsFlightId}
                onChange={(e) => setSelectedOpsFlightId(e.target.value)}
                className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none shadow-sm"
              >
                {flights.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.flightNumber} ({f.origin.code} → {f.destination.code}) - Current: {f.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="text-xs text-slate-500 block mb-1 font-semibold">New Status State</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as FlightStatus)}
                className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none shadow-sm"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Check-in Open">Check-in Open</option>
                <option value="Boarding">Boarding</option>
                <option value="Gate Closed">Gate Closed</option>
                <option value="Departed">Departed</option>
                <option value="In Flight">In Flight</option>
                <option value="Landed">Landed</option>
                <option value="Delayed">Delayed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {newStatus === 'Delayed' && (
              <>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-500 block mb-1 font-semibold">Delay Mins</label>
                  <input
                    type="number"
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(e.target.value)}
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs text-slate-900 font-mono shadow-sm"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs text-slate-500 block mb-1 font-semibold">Official Reason</label>
                  <input
                    type="text"
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value)}
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-xs text-slate-900 shadow-sm"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={async () => {
                  await onUpdateFlightStatus(
                    selectedOpsFlight.id,
                    newStatus,
                    newStatus === 'Delayed' ? parseInt(delayMinutes, 10) : undefined,
                    newStatus === 'Delayed' ? delayReason : undefined
                  );
                  alert(`Flight ${selectedOpsFlight.flightNumber} status updated to ${newStatus}!`);
                }}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Save State
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
