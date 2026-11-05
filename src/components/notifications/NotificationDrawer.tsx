import React from 'react';
import { X, Bell, Mail, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AirlineNotification } from '../../types/airline';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AirlineNotification[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#FCFAF6] border-l border-[#E8E2D5] text-slate-800 shadow-2xl h-full flex flex-col transform transition-transform duration-300">
        {/* Header */}
        <div className="p-4 border-b border-[#EBE5DA] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 font-['Outfit']">
                Airline Notification Dispatch
              </h3>
              <p className="text-xs text-slate-500">Live SMS, Email & Ops Gate Alerts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2 bg-[#F6F2E9]/70 border-b border-[#EBE5DA] flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">{notifications.length} Total Alerts</span>
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-sky-600 hover:text-sky-700 font-bold transition-colors"
          >
            Mark all as read
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">All caught up! No active alerts.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isSMS = notif.type === 'SMS';
              const isEmail = notif.type === 'Email';

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    notif.read
                      ? 'bg-white/70 border-[#EBE5DA] text-slate-600'
                      : 'bg-white border-sky-300 text-slate-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isSMS
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isEmail
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isSMS ? <MessageSquare className="w-2.5 h-2.5" /> : isEmail ? <Mail className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                        {notif.type} Dispatch
                      </span>
                      {notif.pnr && (
                        <span className="text-[10px] font-mono bg-sky-50 px-2 py-0.5 rounded font-bold text-sky-700 border border-sky-200">
                          {notif.pnr}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mb-1">{notif.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span>To: {notif.recipient}</span>
                    <span className="text-sky-600 font-semibold">Delivered via Wiings Comms</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
