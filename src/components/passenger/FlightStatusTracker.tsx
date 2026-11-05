import React, { useState } from 'react';
import { Search, Plane, Clock, AlertTriangle, CheckCircle2, MapPin, Radio } from 'lucide-react';
import { Flight } from '../../types/airline';

interface FlightStatusTrackerProps {
  flights: Flight[];
}

export const FlightStatusTracker: React.FC<FlightStatusTrackerProps> = ({ flights }) => {
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = flights.filter((f) => {
    const matchesQuery =
      f.flightNumber.toLowerCase().includes(query.toLowerCase()) ||
      f.origin.city.toLowerCase().includes(query.toLowerCase()) ||
      f.destination.city.toLowerCase().includes(query.toLowerCase()) ||
      f.origin.code.toLowerCase().includes(query.toLowerCase()) ||
      f.destination.code.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-2">
            <Radio className="w-3 h-3 text-sky-600 animate-pulse" />
            <span>Live Radar & ADS-B Tracking</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2 font-['Outfit']">
            <Plane className="w-6 h-6 text-sky-600 transform -rotate-45" />
            Live Flight Radar & Departure Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time flight movements, gate assignments, runway delays, and baggage belt allocations.
          </p>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Flight number or city..."
              className="bg-white border border-[#E8E2D5] rounded-xl pl-3 pr-3 py-2 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-sky-500 shadow-sm"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-[#E8E2D5] rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-sky-500 shadow-sm cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Boarding">Boarding</option>
            <option value="In Flight">In Flight</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Delayed">Delayed</option>
            <option value="Landed">Landed</option>
          </select>
        </div>
      </div>

      {/* Flight Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((flight) => {
          const isDelayed = flight.status === 'Delayed';
          const isBoarding = flight.status === 'Boarding';
          const isInFlight = flight.status === 'In Flight';
          const isLanded = flight.status === 'Landed';

          return (
            <div
              key={flight.id}
              className="bg-white border border-[#E8E2D5] hover:border-sky-300 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg font-black font-mono text-slate-900 tracking-wide">
                    {flight.flightNumber}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {flight.aircraft.model}
                  </span>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isDelayed
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : isBoarding
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                      : isInFlight
                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                      : isLanded
                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {flight.status}
                </span>
              </div>

              {/* Route Progress bar visual */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div>
                    <span className="font-bold text-slate-900">{flight.origin.city}</span>{' '}
                    <span className="text-slate-500 font-mono">({flight.origin.code})</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] font-semibold">{flight.duration}</span>
                  <div>
                    <span className="font-bold text-slate-900">{flight.destination.city}</span>{' '}
                    <span className="text-slate-500 font-mono">({flight.destination.code})</span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-[#F2EDE2] rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isInFlight
                        ? 'w-1/2 bg-sky-600'
                        : isBoarding
                        ? 'w-1/4 bg-amber-500'
                        : isLanded
                        ? 'w-full bg-emerald-500'
                        : 'w-0 bg-transparent'
                    }`}
                  />
                </div>
              </div>

              {/* Gate, Terminal & Departure */}
              <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5] p-3 rounded-2xl border border-[#EBE5DA] text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Departure</span>
                  <span className="font-mono font-bold text-slate-800">{flight.departureTime}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Gate</span>
                  <span className="font-mono font-bold text-sky-700">{flight.gate}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Terminal</span>
                  <span className="font-mono font-bold text-slate-800">{flight.terminal}</span>
                </div>
              </div>

              {isDelayed && flight.delayReason && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>
                    Delayed by {flight.delayedByMinutes || 30} mins: {flight.delayReason}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
