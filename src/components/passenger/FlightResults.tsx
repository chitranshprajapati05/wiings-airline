import React, { useState } from 'react';
import { Plane, Clock, ShieldCheck, Check, Info, ArrowRight, Filter, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Flight, CabinClass, FlightFareTier } from '../../types/airline';

interface FlightResultsProps {
  flights: Flight[];
  cabinClass: CabinClass;
  passengersCount: number;
  onSelectFlight: (flight: Flight, selectedTier: 'Lite' | 'Standard' | 'Flexi', fare: FlightFareTier) => void;
  onBackToSearch: () => void;
}

export const FlightResults: React.FC<FlightResultsProps> = ({
  flights,
  cabinClass,
  passengersCount,
  onSelectFlight,
  onBackToSearch,
}) => {
  const [selectedSort, setSelectedSort] = useState<'price' | 'duration' | 'departure'>('price');
  const [filterAircraft, setFilterAircraft] = useState<string>('all');
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);

  let displayedFlights = flights.filter((f) => {
    if (filterAircraft !== 'all' && !f.aircraft.model.includes(filterAircraft)) {
      return false;
    }
    return true;
  });

  displayedFlights.sort((a, b) => {
    const aFare = a.fares[cabinClass === 'Business' ? 'Business' : 'Economy']?.[0]?.price || 999999;
    const bFare = b.fares[cabinClass === 'Business' ? 'Business' : 'Economy']?.[0]?.price || 999999;

    if (selectedSort === 'price') return aFare - bFare;
    if (selectedSort === 'departure') return a.departureTime.localeCompare(b.departureTime);
    return 0;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top results bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-[#E8E2D5]">
        <div>
          <button
            type="button"
            onClick={onBackToSearch}
            className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 mb-1 transition-colors"
          >
            ← Modify Search Route
          </button>
          <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">
            Available Flights ({displayedFlights.length} Direct Routes)
          </h2>
          <p className="text-xs text-slate-500">
            Fares shown per passenger for {cabinClass} Class • Taxes and surcharges itemized at checkout
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#E8E2D5] shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Aircraft:</span>
            <select
              value={filterAircraft}
              onChange={(e) => setFilterAircraft(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Fleets</option>
              <option value="A350">Airbus A350</option>
              <option value="787">Boeing 787</option>
              <option value="A321">Airbus A321neo</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#E8E2D5] shadow-sm">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as any)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="price">Lowest Price</option>
              <option value="departure">Departure Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flight Cards list */}
      <div className="space-y-4">
        {displayedFlights.map((flight) => {
          const fareTiers = flight.fares[cabinClass === 'Business' ? 'Business' : 'Economy'] || [];
          const isExpanded = expandedFlightId === flight.id;
          const lowestFare = fareTiers[0]?.price || 0;

          return (
            <div
              key={flight.id}
              className="bg-white border border-[#E8E2D5] hover:border-sky-300 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all"
            >
              {/* Flight Summary Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-3 border-b border-[#F0EBE1]">
                {/* Airline & Aircraft details */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                    <Plane className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900 font-mono tracking-wide">
                        {flight.flightNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {flight.aircraft.model}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          flight.status === 'Delayed'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : flight.status === 'Boarding'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {flight.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {flight.aircraft.registration} • Terminal {flight.terminal} • Gate {flight.gate}
                    </p>
                  </div>
                </div>

                {/* Route Times and Duration */}
                <div className="flex items-center gap-5 sm:gap-8 justify-between sm:justify-start">
                  <div className="text-left">
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {flight.departureTime}
                    </div>
                    <div className="text-xs font-bold text-sky-600">{flight.origin.code}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[100px]">{flight.origin.city}</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {flight.duration}
                    </span>
                    <div className="w-20 sm:w-28 flex items-center gap-1 my-1">
                      <div className="h-0.5 flex-1 bg-slate-200" />
                      <Plane className="w-3.5 h-3.5 text-sky-500" />
                      <div className="h-0.5 flex-1 bg-slate-200" />
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold">Non-Stop</span>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {flight.arrivalTime}
                    </div>
                    <div className="text-xs font-bold text-sky-600">{flight.destination.code}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[100px]">{flight.destination.city}</div>
                  </div>
                </div>

                {/* Price CTA */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">From</span>
                    <span className="text-xl font-black text-sky-700 font-mono">
                      ₹{lowestFare.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">per passenger</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedFlightId(isExpanded ? null : flight.id)}
                    className="mt-1 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-sm active:scale-95"
                  >
                    <span>{isExpanded ? 'Hide Fares' : 'View Fare Tiers'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Fare Tiers Comparison Grid */}
              {isExpanded && (
                <div className="mt-4 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      Select Experience Tier
                    </h4>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      {flight.availableSeats} Seats Remaining
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {fareTiers.map((tier) => {
                      const isFlexi = tier.type === 'Flexi';
                      const isStandard = tier.type === 'Standard';

                      return (
                        <div
                          key={tier.type}
                          className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${
                            isFlexi
                              ? 'bg-sky-50/60 border-sky-300 shadow-sm'
                              : isStandard
                              ? 'bg-white border-[#E8E2D5] hover:border-sky-300'
                              : 'bg-[#FBF9F5] border-[#E8E2D5]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm text-slate-900">{tier.type} Tier</span>
                              {isFlexi && (
                                <span className="text-[9px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full">
                                  BEST VALUE
                                </span>
                              )}
                            </div>

                            <div className="text-lg font-black text-sky-700 font-mono mb-3">
                              ₹{tier.price.toLocaleString()}
                            </div>

                            <ul className="space-y-1.5 text-xs text-slate-600 mb-4">
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Cabin Bag: <strong>{tier.cabinBaggage}</strong></span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Check-in: <strong>{tier.checkInBaggage}</strong></span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{tier.seatSelectionIncluded ? 'Free Seat Selection' : 'Paid Seat Selection'}</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>
                                  {tier.refundable
                                    ? `Refundable (₹${tier.cancellationFee.toLocaleString()} fee)`
                                    : 'Non-Refundable Base'}
                                </span>
                              </li>
                            </ul>
                          </div>

                          <button
                            type="button"
                            onClick={() => onSelectFlight(flight, tier.type, tier)}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isFlexi
                                ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                                : 'bg-slate-800 hover:bg-slate-700 text-white'
                            }`}
                          >
                            <span>Select {tier.type}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
