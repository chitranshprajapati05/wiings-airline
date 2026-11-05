import React, { useState } from 'react';
import { PlaneTakeoff, PlaneLanding, Calendar, Users, ArrowRightLeft, Search, ShieldCheck, Sparkles, Award, Zap } from 'lucide-react';
import { AIRPORTS } from '../../data/mockData';
import { Airport, CabinClass } from '../../types/airline';

interface HeroSearchProps {
  onSearch: (params: {
    origin: Airport;
    destination: Airport;
    tripType: 'oneway' | 'roundtrip';
    departDate: string;
    returnDate?: string;
    passengers: number;
    cabinClass: CabinClass;
  }) => void;
  onOpenSmartAiBooking: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, onOpenSmartAiBooking }) => {
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
  const [originCode, setOriginCode] = useState<string>('DEL');
  const [destinationCode, setDestinationCode] = useState<string>('DXB');
  const [departDate, setDepartDate] = useState<string>('2026-11-04');
  const [passengers, setPassengers] = useState<number>(1);
  const [cabinClass, setCabinClass] = useState<CabinClass>('Economy');

  const originAirport = AIRPORTS.find((a) => a.code === originCode) || AIRPORTS[0];
  const destAirport = AIRPORTS.find((a) => a.code === destinationCode) || AIRPORTS[3];

  const handleSwapAirports = () => {
    const temp = originCode;
    setOriginCode(destinationCode);
    setDestinationCode(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      origin: originAirport,
      destination: destAirport,
      tripType,
      departDate,
      passengers,
      cabinClass,
    });
  };

  const quickRoutes = [
    { from: 'DEL', to: 'DXB', label: 'Delhi ⇄ Dubai' },
    { from: 'BOM', to: 'LHR', label: 'Mumbai ⇄ London' },
    { from: 'BLR', to: 'SIN', label: 'Bengaluru ⇄ Singapore' },
    { from: 'DEL', to: 'JFK', label: 'Delhi ⇄ New York' },
  ];

  return (
    <section className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F9F7F2] via-[#FAF8F5] to-[#F5F2EB]">
      {/* Subtle sky ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] bg-sky-200/25 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Luxury Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E8E2D5] text-sky-700 text-xs font-semibold mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Wiings Global Luxury Aviation • Sky Blue Heritage</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
            Your Journey, <span className="text-sky-600">Our Responsibility.</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-normal leading-relaxed">
            Short, effortless bookings, transparent fare tiers, and curated luxury flight services.
          </p>
        </div>

        {/* AI Assisted Auto-Choice Banner for New / Confused Passengers */}
        <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-sky-50/80 to-[#FAF8F5] border border-sky-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                Dashboard samajh nahi aa raha? Confusion hai?
              </h3>
              <p className="text-[11px] text-slate-600">
                Let our AI auto-curate the best flight, fare tier & meal package in 10 seconds.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSmartAiBooking}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 active:scale-95 transition-all whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-100" />
            <span>Try AI 1-Click Auto-Choice</span>
          </button>
        </div>

        {/* Minimalist White Luxury Search Card */}
        <div className="bg-white border border-[#E8E2D5] rounded-3xl p-5 sm:p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)]">
          {/* Trip Type & Passenger Selectors */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#F0EBE1]">
            <div className="flex items-center gap-1 bg-[#F5F2EB] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTripType('oneway')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  tripType === 'oneway' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                One Way
              </button>
              <button
                type="button"
                onClick={() => setTripType('roundtrip')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  tripType === 'roundtrip' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Round Trip
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8E2D5] text-xs">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-slate-500 font-medium">Travelers:</span>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value, 10))}
                  className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8E2D5] text-xs">
                <Award className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-slate-500 font-medium">Class:</span>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                  className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="Economy">Economy</option>
                  <option value="Business">Business Suites</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Grid */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Origin */}
              <div className="md:col-span-4 bg-[#FBF9F5] border border-[#EBE5DA] rounded-2xl p-3 hover:border-sky-400 transition-colors">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <PlaneTakeoff className="w-3.5 h-3.5 text-sky-600" />
                  Departure From
                </label>
                <select
                  value={originCode}
                  onChange={(e) => setOriginCode(e.target.value)}
                  className="w-full bg-transparent text-slate-900 font-bold text-sm mt-0.5 focus:outline-none cursor-pointer"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.city} ({a.code})
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-400 truncate">{originAirport.name}</div>
              </div>

              {/* Swap Button */}
              <div className="md:col-span-1 flex justify-center -my-2 md:my-0">
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  className="p-2 rounded-full bg-white hover:bg-slate-50 border border-[#E8E2D5] text-sky-600 shadow-sm transition-transform active:scale-90"
                  aria-label="Swap Airports"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Destination */}
              <div className="md:col-span-4 bg-[#FBF9F5] border border-[#EBE5DA] rounded-2xl p-3 hover:border-sky-400 transition-colors">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <PlaneLanding className="w-3.5 h-3.5 text-sky-600" />
                  Destination To
                </label>
                <select
                  value={destinationCode}
                  onChange={(e) => setDestinationCode(e.target.value)}
                  className="w-full bg-transparent text-slate-900 font-bold text-sm mt-0.5 focus:outline-none cursor-pointer"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code} disabled={a.code === originCode}>
                      {a.city} ({a.code})
                    </option>
                  ))}
                </select>
                <div className="text-[10px] text-slate-400 truncate">{destAirport.name}</div>
              </div>

              {/* Travel Date */}
              <div className="md:col-span-3 bg-[#FBF9F5] border border-[#EBE5DA] rounded-2xl p-3 hover:border-sky-400 transition-colors">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  Travel Date
                </label>
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="w-full bg-transparent text-slate-900 font-bold text-xs mt-0.5 focus:outline-none cursor-pointer"
                />
              </div>

              {/* Submit CTA */}
              <div className="md:col-span-12 mt-1">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Flights</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Route Chips */}
          <div className="mt-4 pt-3 border-t border-[#F0EBE1] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Routes:</span>
            {quickRoutes.map((r, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setOriginCode(r.from);
                  setDestinationCode(r.to);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#F2EDE2] text-slate-600 hover:text-sky-700 border border-[#E8E2D5] transition-colors font-medium text-[11px]"
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Short, high-impact value props */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-white border border-[#EBE5DA] rounded-2xl p-3 flex items-center gap-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <div className="text-[11px]">
              <strong className="text-slate-800 block">Zero-Fee Cancellation</strong>
              <span className="text-slate-400">Flexi refundable</span>
            </div>
          </div>

          <div className="bg-white border border-[#EBE5DA] rounded-2xl p-3 flex items-center gap-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <Award className="w-4 h-4 text-sky-600 shrink-0" />
            <div className="text-[11px]">
              <strong className="text-slate-800 block">B787 & A350 Fleet</strong>
              <span className="text-slate-400">Quiet luxury cabins</span>
            </div>
          </div>

          <div className="bg-white border border-[#EBE5DA] rounded-2xl p-3 flex items-center gap-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <div className="text-[11px]">
              <strong className="text-slate-800 block">48h Web Check-in</strong>
              <span className="text-slate-400">Digital boarding pass</span>
            </div>
          </div>

          <div className="bg-white border border-[#EBE5DA] rounded-2xl p-3 flex items-center gap-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <PlaneTakeoff className="w-4 h-4 text-sky-600 shrink-0" />
            <div className="text-[11px]">
              <strong className="text-slate-800 block">96.4% On-Time Record</strong>
              <span className="text-slate-400">Punctual departures</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
