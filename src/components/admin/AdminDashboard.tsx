import React, { useState } from 'react';
import {
  ShieldCheck, Plane, Users, TrendingUp, DollarSign, Plus, Trash2, Edit3,
  Calendar, Clock, CheckCircle2, AlertCircle, X, Search, Luggage, ArrowUpRight
} from 'lucide-react';
import { Flight, Booking, Aircraft, CabinClass, Airport } from '../../types/airline';
import { AIRPORTS, AIRCRAFT_FLEET, STAFF_MEMBERS } from '../../data/mockData';

interface AdminDashboardProps {
  flights: Flight[];
  bookings: Booking[];
  onAddNewFlight: (flight: Partial<Flight>) => Promise<void>;
  onUpdateFlight: (id: string, updates: Partial<Flight>) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  flights,
  bookings,
  onAddNewFlight,
  onUpdateFlight,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'flights' | 'fleet' | 'bookings' | 'refunds' | 'staff'>('overview');
  const [showAddFlightModal, setShowAddFlightModal] = useState(false);

  // New flight form state
  const [newFlightNumber, setNewFlightNumber] = useState('WG-505');
  const [newOriginCode, setNewOriginCode] = useState('DEL');
  const [newDestCode, setNewDestCode] = useState('SIN');
  const [newDepTime, setNewDepTime] = useState('02:30 PM');
  const [newArrTime, setNewArrTime] = useState('08:45 PM');
  const [newDuration, setNewDuration] = useState('5h 15m');
  const [newAircraftId, setNewAircraftId] = useState(AIRCRAFT_FLEET[0].id);
  const [newEcoPrice, setNewEcoPrice] = useState('18500');
  const [newBizPrice, setNewBizPrice] = useState('52000');
  const [newGate, setNewGate] = useState('12A');

  // Bookings filter
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  // KPI Calculations
  const totalRevenue = bookings.reduce((sum, b) => (b.bookingStatus !== 'Cancelled' ? sum + b.totalAmount : sum), 0);
  const totalBookingsCount = bookings.length;
  const activeFlightsCount = flights.filter((f) => f.status !== 'Landed' && f.status !== 'Cancelled').length;
  const cancelledBookings = bookings.filter((b) => b.bookingStatus === 'Cancelled');
  const totalRefunded = cancelledBookings.reduce((sum, b) => sum + (b.cancellationDetails?.refundAmount || 0), 0);
  const totalFeesRetained = cancelledBookings.reduce((sum, b) => sum + (b.cancellationDetails?.cancellationFee || 0), 0);

  const handleCreateFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    const origin = AIRPORTS.find((a) => a.code === newOriginCode) || AIRPORTS[0];
    const destination = AIRPORTS.find((a) => a.code === newDestCode) || AIRPORTS[1];
    const aircraft = AIRCRAFT_FLEET.find((ac) => ac.id === newAircraftId) || AIRCRAFT_FLEET[0];

    const flightData: Partial<Flight> = {
      flightNumber: newFlightNumber.toUpperCase(),
      origin,
      destination,
      departureTime: newDepTime,
      arrivalTime: newArrTime,
      duration: newDuration,
      aircraft,
      status: 'Scheduled',
      gate: newGate,
      terminal: 'T3',
      totalSeats: aircraft.totalSeats,
      availableSeats: aircraft.totalSeats,
      fares: {
        Economy: [
          { type: 'Standard', price: parseInt(newEcoPrice, 10), cabinBaggage: '7 kg', checkInBaggage: '20 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 3000 }
        ],
        Business: [
          { type: 'Standard', price: parseInt(newBizPrice, 10), cabinBaggage: '14 kg', checkInBaggage: '40 kg', seatSelectionIncluded: true, refundable: true, cancellationFee: 5000 }
        ]
      }
    };

    await onAddNewFlight(flightData);
    setShowAddFlightModal(false);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.pnr.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.passengers.some((p) => p.lastName.toLowerCase().includes(bookingSearch.toLowerCase()));
    const matchesStatus = bookingStatusFilter === 'all' || b.bookingStatus === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit']">Airline Executive Control Center</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprise Fleet Operations, Flight Yield Management, Passenger Manifest & Financial Reporting
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#E8E2D5] text-xs font-semibold overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & KPIs' },
            { id: 'flights', label: 'Flight Schedules' },
            { id: 'fleet', label: 'Aircraft Fleet' },
            { id: 'bookings', label: 'All Bookings' },
            { id: 'refunds', label: 'Refunds Desk' },
            { id: 'staff', label: 'Staff & RBAC' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Total Ticket Revenue</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            ₹{totalRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +14.2% vs last month
          </span>
        </div>

        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Total Reservations</span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {totalBookingsCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across 10 global hub routes
          </span>
        </div>

        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Average Load Factor</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-sky-700">
            88.4%
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Optimal seat yield performance
          </span>
        </div>

        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">On-Time Performance</span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Plane className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            96.4%
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Top tier airline punctuality
          </span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Flight Radar summary */}
          <div className="lg:col-span-7 bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-['Outfit']">
                <Plane className="w-5 h-5 text-sky-600" />
                Live Fleet Flight Status ({flights.length} Scheduled)
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('flights')}
                className="text-xs text-sky-600 hover:text-sky-700 font-bold"
              >
                Manage Flights →
              </button>
            </div>

            <div className="space-y-2">
              {flights.slice(0, 5).map((f) => (
                <div
                  key={f.id}
                  className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-sm">{f.flightNumber}</span>
                    <span className="text-slate-600">
                      {f.origin.code} → {f.destination.code}
                    </span>
                    <span className="text-slate-400 hidden sm:inline">{f.aircraft.model}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-700 font-medium">{f.departureTime}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.status === 'Delayed'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : f.status === 'Boarding'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Route Yield & Capacity */}
          <div className="lg:col-span-5 bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Top Revenue Routes</h3>
            <div className="space-y-3 text-xs">
              {[
                { route: 'Delhi (DEL) ⇄ Dubai (DXB)', load: '94%', revenue: '₹4,80,000' },
                { route: 'Mumbai (BOM) ⇄ London (LHR)', load: '91%', revenue: '₹14,20,000' },
                { route: 'Bengaluru (BLR) ⇄ Singapore (SIN)', load: '87%', revenue: '₹3,40,000' },
                { route: 'Delhi (DEL) ⇄ New York (JFK)', load: '89%', revenue: '₹18,50,000' },
              ].map((r, i) => (
                <div key={i} className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-900 block">{r.route}</span>
                    <span className="text-slate-500 text-[11px]">Seat Load: {r.load}</span>
                  </div>
                  <span className="font-mono font-bold text-sky-700">{r.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FLIGHT MANAGEMENT */}
      {activeTab === 'flights' && (
        <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Airline Flight Schedule & Yield</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure routes, aircraft assignments, base pricing, gates, and statuses.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddFlightModal(true)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Flight</span>
            </button>
          </div>

          {/* Flights Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#FAF8F5] text-slate-500 uppercase font-semibold text-[10px] border-b border-[#E8E2D5]">
                <tr>
                  <th className="py-3 px-4">Flight</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Departure / Arrival</th>
                  <th className="py-3 px-4">Aircraft</th>
                  <th className="py-3 px-4">Available Seats</th>
                  <th className="py-3 px-4">Gate</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE5DA] font-mono">
                {flights.map((f) => (
                  <tr key={f.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4 font-bold text-sky-700">{f.flightNumber}</td>
                    <td className="py-3 px-4 font-sans text-slate-900">
                      {f.origin.code} ({f.origin.city}) → {f.destination.code} ({f.destination.city})
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {f.departureTime} - {f.arrivalTime}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600">{f.aircraft.model}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {f.availableSeats} / {f.totalSeats}
                    </td>
                    <td className="py-3 px-4 font-bold text-sky-700">{f.gate}</td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.status === 'Delayed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : f.status === 'Boarding'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AIRCRAFT FLEET */}
      {activeTab === 'fleet' && (
        <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Commercial Aircraft Fleet Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AIRCRAFT_FLEET.map((ac) => (
              <div key={ac.id} className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">{ac.model}</h4>
                    <span className="text-xs font-mono text-sky-700 font-semibold">{ac.registration}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {ac.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-white p-3 rounded-xl border border-[#E8E2D5]">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Total Seats</span>
                    <strong className="text-slate-900 font-mono">{ac.totalSeats}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Business Suites</span>
                    <strong className="text-sky-700 font-mono">{ac.businessSeats}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Flight Hours</span>
                    <strong className="text-slate-900 font-mono">{ac.flightHours}h</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BOOKINGS MANIFEST */}
      {activeTab === 'bookings' && (
        <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">All Passenger Bookings Manifest</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search PNR or Last Name..."
                className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
              />
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Checked-in">Checked-in</option>
                <option value="Boarded">Boarded</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#FAF8F5] text-slate-500 uppercase font-semibold text-[10px] border-b border-[#E8E2D5]">
                <tr>
                  <th className="py-3 px-4">PNR</th>
                  <th className="py-3 px-4">Passenger Name</th>
                  <th className="py-3 px-4">Flight</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Seat</th>
                  <th className="py-3 px-4">Total Paid</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE5DA] font-mono">
                {filteredBookings.map((b) => (
                  <tr key={b.pnr} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-4 font-bold text-sky-700">{b.pnr}</td>
                    <td className="py-3 px-4 font-sans text-slate-900 font-medium">
                      {b.passengers[0]?.firstName} {b.passengers[0]?.lastName}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{b.flight.flightNumber}</td>
                    <td className="py-3 px-4 font-sans text-slate-600">{b.cabinClass}</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">{b.selectedSeats.join(', ') || 'Auto'}</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">₹{b.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.bookingStatus === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.bookingStatus === 'Cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REFUNDS DESK */}
      {activeTab === 'refunds' && (
        <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Ticket Cancellation & Refund Ledger</h3>
              <p className="text-xs text-slate-500">
                Processed refund settlements and cancellation fees collected.
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="text-slate-500">Total Net Refunded: </span>
              <strong className="text-emerald-700 font-mono font-bold text-sm">
                ₹{totalRefunded.toLocaleString()}
              </strong>
            </div>
          </div>

          {cancelledBookings.length === 0 ? (
            <div className="p-8 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] text-center text-xs text-slate-400">
              No cancelled tickets on record. All reservations active!
            </div>
          ) : (
            <div className="space-y-3">
              {cancelledBookings.map((b) => (
                <div
                  key={b.pnr}
                  className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-sky-700 text-sm">PNR: {b.pnr}</span>
                    <span className="text-slate-900 ml-2 font-medium">
                      Passenger: {b.passengers[0]?.firstName} {b.passengers[0]?.lastName}
                    </span>
                    <p className="text-slate-500 mt-1">
                      Flight: {b.flight.flightNumber} ({b.flight.origin.code} → {b.flight.destination.code})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-rose-600 block font-medium">
                      Airline Fee: ₹{b.cancellationDetails?.cancellationFee.toLocaleString()}
                    </span>
                    <strong className="text-emerald-700 font-mono text-sm block">
                      Refund Amount: ₹{b.cancellationDetails?.refundAmount.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Txn: {b.cancellationDetails?.refundTxnId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: STAFF ROSTER & RBAC */}
      {activeTab === 'staff' && (
        <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Airport Staff Roster & Role Access Control</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STAFF_MEMBERS.map((st) => (
              <div key={st.id} className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5] flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{st.name}</h4>
                  <span className="text-sky-700 font-semibold">{st.role}</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">{st.terminal}</p>
                  <p className="text-slate-400 text-[10px]">Shift: {st.shift}</p>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-white text-sky-700 font-mono text-[11px] border border-[#E8E2D5] font-bold">
                    {st.badgeId}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD FLIGHT MODAL */}
      {showAddFlightModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FCFAF6] border border-[#E8E2D5] rounded-3xl p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 font-['Outfit']">
                <Plus className="w-5 h-5 text-sky-600" />
                Add New Airline Flight Route
              </h3>
              <button
                type="button"
                onClick={() => setShowAddFlightModal(false)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFlight} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-500 block mb-1 font-semibold">Flight Number *</label>
                <input
                  type="text"
                  required
                  value={newFlightNumber}
                  onChange={(e) => setNewFlightNumber(e.target.value)}
                  placeholder="e.g. WG-505"
                  className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-slate-900 font-mono uppercase focus:outline-none focus:border-sky-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">Origin Hub *</label>
                  <select
                    value={newOriginCode}
                    onChange={(e) => setNewOriginCode(e.target.value)}
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500 shadow-sm cursor-pointer"
                  >
                    {AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.city} ({a.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">Destination *</label>
                  <select
                    value={newDestCode}
                    onChange={(e) => setNewDestCode(e.target.value)}
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500 shadow-sm cursor-pointer"
                  >
                    {AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code} disabled={a.code === newOriginCode}>
                        {a.city} ({a.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">Departure</label>
                  <input
                    type="text"
                    value={newDepTime}
                    onChange={(e) => setNewDepTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-slate-900 font-mono shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">Arrival</label>
                  <input
                    type="text"
                    value={newArrTime}
                    onChange={(e) => setNewArrTime(e.target.value)}
                    placeholder="02:15 PM"
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-slate-900 font-mono shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">Gate</label>
                  <input
                    type="text"
                    value={newGate}
                    onChange={(e) => setNewGate(e.target.value)}
                    placeholder="12A"
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-slate-900 font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">Economy Base (₹)</label>
                  <input
                    type="number"
                    value={newEcoPrice}
                    onChange={(e) => setNewEcoPrice(e.target.value)}
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-slate-900 font-mono shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-500 block mb-1 font-semibold">Business Base (₹)</label>
                  <input
                    type="number"
                    value={newBizPrice}
                    onChange={(e) => setNewBizPrice(e.target.value)}
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-slate-900 font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFlightModal(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E8E2D5] text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md shadow-sky-600/20"
                >
                  Save & Publish Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
