import React from 'react';
import { Plane, ShieldCheck, Users, Briefcase, Bell, Sparkles, Clock, Globe, HelpCircle } from 'lucide-react';
import { UserRole } from '../types/airline';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activePassengerTab: string;
  onPassengerTabChange: (tab: string) => void;
  unreadNotifsCount: number;
  onToggleNotifs: () => void;
  onOpenAi: () => void;
  onOpenSmartAiBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activePassengerTab,
  onPassengerTabChange,
  unreadNotifsCount,
  onToggleNotifs,
  onOpenAi,
  onOpenSmartAiBooking,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FCFAF6]/95 backdrop-blur-md border-b border-[#EBE5DA] text-slate-800 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
      {/* Top luxury micro bar */}
      <div className="bg-[#F6F2E9]/80 px-4 py-1.5 text-xs text-slate-600 border-b border-[#EBE5DA]/60 hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sky-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            96.4% On-Time Performance Guarantee
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Globe className="w-3 h-3 text-sky-600" />
            Global Hubs: DEL T3 · BOM T2 · BLR T2 · DXB T3
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-600">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-slate-400" />
            UTC+5:30 (IST)
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-sky-700 font-medium italic">
            "Your Journey, Our Responsibility."
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div 
            onClick={() => {
              onRoleChange('passenger');
              onPassengerTabChange('search');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 p-0.5 shadow-md shadow-sky-600/15 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#FCFAF6] rounded-[14px] flex items-center justify-center">
                <Plane className="w-5 h-5 text-sky-600 transform -rotate-45" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-wider text-slate-900 font-['Outfit']">
                  WIINGS
                </span>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-full tracking-widest uppercase">
                  Airlines
                </span>
              </div>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
                Luxury Global Aviation
              </p>
            </div>
          </div>

          {/* Passenger Sub-Navigation */}
          {currentRole === 'passenger' && (
            <nav className="hidden md:flex items-center gap-1 bg-[#F2EDE2]/70 p-1 rounded-2xl border border-[#E6DFD1]">
              <button
                type="button"
                onClick={() => onPassengerTabChange('search')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activePassengerTab === 'search'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                Book Flights
              </button>
              <button
                type="button"
                onClick={() => onPassengerTabChange('manage')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activePassengerTab === 'manage'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                Manage Trips
              </button>
              <button
                type="button"
                onClick={() => onPassengerTabChange('checkin')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activePassengerTab === 'checkin'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                Web Check-in
              </button>
              <button
                type="button"
                onClick={() => onPassengerTabChange('status')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activePassengerTab === 'status'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                Flight Radar
              </button>
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* AI 1-Click Smart Assisted Booking Button */}
            <button
              type="button"
              onClick={onOpenSmartAiBooking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 text-white text-xs font-bold hover:from-sky-500 hover:to-sky-400 transition-all shadow-md shadow-sky-600/20 active:scale-95"
              title="Passenger Assisted Auto-Booking: Choose easily without dashboard confusion"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-100 animate-spin" style={{ animationDuration: '6s' }} />
              <span>AI Auto-Choice</span>
            </button>

            {/* AI Travel Assistant Concierge */}
            <button
              type="button"
              onClick={onOpenAi}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#E8E2D5] text-slate-700 text-xs font-semibold hover:border-sky-300 hover:text-sky-700 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>Ask Aero</span>
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={onToggleNotifs}
              className="relative p-2 rounded-xl bg-white hover:bg-slate-50 border border-[#E8E2D5] text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Role Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-[#F2EDE2]/80 border border-[#E6DFD1] text-xs font-medium">
              <button
                type="button"
                onClick={() => onRoleChange('passenger')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                  currentRole === 'passenger'
                    ? 'bg-sky-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Passenger Booking & Check-in Portal"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Passenger</span>
              </button>

              <button
                type="button"
                onClick={() => onRoleChange('staff')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                  currentRole === 'staff'
                    ? 'bg-sky-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Airport Staff Verification & Gate Controller"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Staff Desk</span>
              </button>

              <button
                type="button"
                onClick={() => onRoleChange('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                  currentRole === 'admin'
                    ? 'bg-sky-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Airline Executive Admin Management"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Submenu for Passenger */}
        {currentRole === 'passenger' && (
          <div className="flex md:hidden items-center justify-around py-2 border-t border-[#EBE5DA] text-xs font-semibold">
            <button
              type="button"
              onClick={() => onPassengerTabChange('search')}
              className={`py-1 px-2 ${
                activePassengerTab === 'search' ? 'text-sky-700 border-b-2 border-sky-600' : 'text-slate-500'
              }`}
            >
              Book Flights
            </button>
            <button
              type="button"
              onClick={() => onPassengerTabChange('manage')}
              className={`py-1 px-2 ${
                activePassengerTab === 'manage' ? 'text-sky-700 border-b-2 border-sky-600' : 'text-slate-500'
              }`}
            >
              Manage Trips
            </button>
            <button
              type="button"
              onClick={() => onPassengerTabChange('checkin')}
              className={`py-1 px-2 ${
                activePassengerTab === 'checkin' ? 'text-sky-700 border-b-2 border-sky-600' : 'text-slate-500'
              }`}
            >
              Web Check-in
            </button>
            <button
              type="button"
              onClick={() => onPassengerTabChange('status')}
              className={`py-1 px-2 ${
                activePassengerTab === 'status' ? 'text-sky-700 border-b-2 border-sky-600' : 'text-slate-500'
              }`}
            >
              Radar
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
