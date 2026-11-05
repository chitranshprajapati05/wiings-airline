/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { AiTravelAssistant } from './components/ai/AiTravelAssistant';
import { HeroSearch } from './components/passenger/HeroSearch';
import { FlightResults } from './components/passenger/FlightResults';
import { BookingFlowModal } from './components/passenger/BookingFlowModal';
import { ManageBookingView } from './components/passenger/ManageBookingView';
import { WebCheckInView } from './components/passenger/WebCheckInView';
import { FlightStatusTracker } from './components/passenger/FlightStatusTracker';
import { AiSmartBookingModal } from './components/passenger/AiSmartBookingModal';
import { StaffOperations } from './components/staff/StaffOperations';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserRole, Flight, Booking, AirlineNotification, CabinClass, FlightFareTier, FlightStatus, BaggageStatus } from './types/airline';
import { INITIAL_FLIGHTS, INITIAL_BOOKINGS, INITIAL_NOTIFICATIONS } from './data/mockData';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('passenger');
  const [activePassengerTab, setActivePassengerTab] = useState<string>('search');

  // Core application data synced with server
  const [flights, setFlights] = useState<Flight[]>(INITIAL_FLIGHTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [notifications, setNotifications] = useState<AirlineNotification[]>(INITIAL_NOTIFICATIONS);

  // Passenger search & booking wizard state
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedCabinClass, setSearchedCabinClass] = useState<CabinClass>('Economy');
  const [searchedPassengerCount, setSearchedPassengerCount] = useState<number>(1);
  const [selectedFlightForBooking, setSelectedFlightForBooking] = useState<Flight | null>(null);
  const [selectedTier, setSelectedTier] = useState<'Lite' | 'Standard' | 'Flexi'>('Standard');
  const [selectedFareTier, setSelectedFareTier] = useState<FlightFareTier | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSmartAiBookingOpen, setIsSmartAiBookingOpen] = useState(false);

  // Deep-linked check-in PNR
  const [checkInPnr, setCheckInPnr] = useState('WG-78K9A');

  // Drawers
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  // Fetch initial data from server API
  const loadData = async () => {
    try {
      const [flRes, bkRes, notRes] = await Promise.all([
        fetch('/api/flights'),
        fetch('/api/bookings'),
        fetch('/api/notifications'),
      ]);

      if (flRes.ok) {
        const flJson = await flRes.json();
        if (flJson.data && flJson.data.length > 0) setFlights(flJson.data);
      }
      if (bkRes.ok) {
        const bkJson = await bkRes.json();
        if (bkJson.data && bkJson.data.length > 0) setBookings(bkJson.data);
      }
      if (notRes.ok) {
        const notJson = await notRes.json();
        if (notJson.data && notJson.data.length > 0) setNotifications(notJson.data);
      }
    } catch (e) {
      console.warn('Backend server sync running in local memory state:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Flight Search handler
  const handleFlightSearch = (params: {
    origin: any;
    destination: any;
    tripType: 'oneway' | 'roundtrip';
    departDate: string;
    returnDate?: string;
    passengers: number;
    cabinClass: CabinClass;
  }) => {
    setSearchedCabinClass(params.cabinClass);
    setSearchedPassengerCount(params.passengers);
    setHasSearched(true);
  };

  // 2. Select Flight & Fare Tier
  const handleSelectFlight = (
    flight: Flight,
    tier: 'Lite' | 'Standard' | 'Flexi',
    fare: FlightFareTier
  ) => {
    setSelectedFlightForBooking(flight);
    setSelectedTier(tier);
    setSelectedFareTier(fare);
    setIsBookingModalOpen(true);
  };

  // 3. Booking success callback
  const handleBookingSuccess = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    // Dispatch local notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'SMS',
        recipient: newBooking.passengers[0]?.phone || 'Customer',
        title: `Wiings Ticket Issued: PNR ${newBooking.pnr}`,
        message: `Booking confirmed for ${newBooking.flight.flightNumber} (${newBooking.flight.origin.code} → ${newBooking.flight.destination.code}). Seat: ${newBooking.selectedSeats.join(', ')}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false,
        pnr: newBooking.pnr,
      },
      ...prev,
    ]);
  };

  // 4. Ticket Cancellation
  const handleCancelBooking = async (pnr: string) => {
    try {
      const res = await fetch(`/api/bookings/${pnr}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      if (res.ok) {
        await loadData();
      } else {
        // Fallback local update
        setBookings((prev) =>
          prev.map((b) => (b.pnr === pnr ? { ...b, bookingStatus: 'Cancelled' } : b))
        );
      }
    } catch (e) {
      setBookings((prev) =>
        prev.map((b) => (b.pnr === pnr ? { ...b, bookingStatus: 'Cancelled' } : b))
      );
    }
  };

  // 5. Check-in Passenger
  const handleCheckInComplete = async (pnr: string, seat: string) => {
    try {
      await fetch(`/api/bookings/${pnr}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkInCompleted: true,
          bookingStatus: 'Checked-in',
          selectedSeats: [seat],
          boardingPassIssued: true,
        }),
      });
      await loadData();
    } catch (e) {
      setBookings((prev) =>
        prev.map((b) =>
          b.pnr === pnr
            ? { ...b, checkInCompleted: true, bookingStatus: 'Checked-in', selectedSeats: [seat], boardingPassIssued: true }
            : b
        )
      );
    }
  };

  // 6. Board Passenger at Gate
  const handleBoardPassenger = async (pnr: string) => {
    try {
      await fetch(`/api/bookings/${pnr}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardingCompleted: true,
          bookingStatus: 'Boarded',
        }),
      });
      await loadData();
    } catch (e) {
      setBookings((prev) =>
        prev.map((b) =>
          b.pnr === pnr ? { ...b, boardingCompleted: true, bookingStatus: 'Boarded' } : b
        )
      );
    }
  };

  // 7. Add Baggage Tag
  const handleAddBaggage = async (pnr: string, weightKg: number) => {
    try {
      await fetch('/api/baggage/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pnr, weightKg }),
      });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // 8. Update Baggage Status
  const handleUpdateBaggageStatus = async (tagNumber: string, status: BaggageStatus) => {
    try {
      await fetch('/api/baggage/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagNumber, status }),
      });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // 9. Update Flight Status & Gate
  const handleUpdateFlightStatus = async (
    flightId: string,
    status: FlightStatus,
    delayMins?: number,
    delayReason?: string,
    gate?: string
  ) => {
    try {
      await fetch(`/api/flights/${flightId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, delayedByMinutes: delayMins, delayReason, gate }),
      });
      await loadData();
    } catch (e) {
      setFlights((prev) =>
        prev.map((f) =>
          f.id === flightId || f.flightNumber === flightId
            ? { ...f, status, delayedByMinutes: delayMins, delayReason, gate: gate || f.gate }
            : f
        )
      );
    }
  };

  // 10. Admin Add New Flight
  const handleAddNewFlight = async (flightData: Partial<Flight>) => {
    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightData),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F8F6F2] text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Main Navigation */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activePassengerTab={activePassengerTab}
        onPassengerTabChange={setActivePassengerTab}
        unreadNotifsCount={unreadNotifsCount}
        onToggleNotifs={() => setIsNotifsOpen((prev) => !prev)}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenSmartAiBooking={() => setIsSmartAiBookingOpen(true)}
      />

      {/* Main View Portals */}
      <main className="flex-1 pb-16">
        {/* ROLE 1: PASSENGER PORTAL */}
        {currentRole === 'passenger' && (
          <div>
            {activePassengerTab === 'search' && (
              <>
                <HeroSearch
                  onSearch={handleFlightSearch}
                  onOpenSmartAiBooking={() => setIsSmartAiBookingOpen(true)}
                />
                <FlightResults
                  flights={flights}
                  cabinClass={searchedCabinClass}
                  passengersCount={searchedPassengerCount}
                  onSelectFlight={handleSelectFlight}
                  onBackToSearch={() => setHasSearched(false)}
                />
              </>
            )}

            {activePassengerTab === 'manage' && (
              <ManageBookingView
                bookings={bookings}
                onCancelBooking={handleCancelBooking}
                onGoToCheckin={(pnr) => {
                  setCheckInPnr(pnr);
                  setActivePassengerTab('checkin');
                }}
              />
            )}

            {activePassengerTab === 'checkin' && (
              <WebCheckInView
                bookings={bookings}
                prefilledPnr={checkInPnr}
                onCheckInComplete={handleCheckInComplete}
              />
            )}

            {activePassengerTab === 'status' && (
              <FlightStatusTracker flights={flights} />
            )}
          </div>
        )}

        {/* ROLE 2: AIRPORT STAFF OPERATIONS PORTAL */}
        {currentRole === 'staff' && (
          <StaffOperations
            flights={flights}
            bookings={bookings}
            onUpdateFlightStatus={handleUpdateFlightStatus}
            onCheckInPassenger={handleCheckInComplete}
            onBoardPassenger={handleBoardPassenger}
            onAddBaggage={handleAddBaggage}
            onUpdateBaggageStatus={handleUpdateBaggageStatus}
          />
        )}

        {/* ROLE 3: ADMIN MANAGEMENT DASHBOARD */}
        {currentRole === 'admin' && (
          <AdminDashboard
            flights={flights}
            bookings={bookings}
            onAddNewFlight={handleAddNewFlight}
            onUpdateFlight={(id, updates) => handleUpdateFlightStatus(id, updates.status || 'Scheduled')}
          />
        )}
      </main>

      {/* 1-Click AI Smart Auto-Booking & Explainer Modal */}
      <AiSmartBookingModal
        isOpen={isSmartAiBookingOpen}
        onClose={() => setIsSmartAiBookingOpen(false)}
        flights={flights}
        onBookingSuccess={handleBookingSuccess}
        onNavigateTab={(tab) => {
          if (['staff', 'admin'].includes(tab)) {
            setCurrentRole(tab as any);
          } else {
            setCurrentRole('passenger');
            setActivePassengerTab(tab);
          }
        }}
      />

      {/* Standard Booking Flow Wizard Modal */}
      {selectedFlightForBooking && selectedFareTier && (
        <BookingFlowModal
          flight={selectedFlightForBooking}
          cabinClass={searchedCabinClass}
          fareTier={selectedTier}
          tierFare={selectedFareTier}
          passengersCount={searchedPassengerCount}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Real-time Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          fetch('/api/notifications/mark-read', { method: 'POST' }).catch(() => {});
        }}
      />

      {/* Wiings AI Concierge "Aero" */}
      <AiTravelAssistant
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      {/* Luxury Footer */}
      <footer className="bg-[#FAF8F5] border-t border-[#E8E2D5] text-xs text-slate-500 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-extrabold text-slate-800 font-['Outfit'] tracking-wider">
              WIINGS AIRLINE MANAGEMENT SYSTEM
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tagline: "Your Journey, Our Responsibility." • Sky Blue & Cream White Luxury Edition
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <button
              type="button"
              onClick={() => {
                setCurrentRole('passenger');
                setActivePassengerTab('search');
              }}
              className="hover:text-sky-600 transition-colors"
            >
              Passenger Booking
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setCurrentRole('staff')}
              className="hover:text-sky-600 transition-colors"
            >
              Staff Terminal
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={() => setCurrentRole('admin')}
              className="hover:text-sky-600 transition-colors"
            >
              Executive Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
