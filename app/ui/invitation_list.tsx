"use client";

import { Check, X, Clock } from "lucide-react";

export function InvitationList({ invitations, onRespond }: any) {
  
  const isExpired = (expiryDate: string) => new Date() > new Date(expiryDate);

  if (!invitations || invitations.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 mb-10">
      <div className="flex items-center gap-3 mb-6 ml-2">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
          <Clock size={20} />
        </div>
        <h2 className="text-lg font-black text-gray-900">Pending Invitations</h2>
      </div>

      <div className="grid gap-4">
        {invitations.map((invite: any) => {
          const expired = isExpired(invite.expiresAt);
          if (expired) return null;

          return (
            <div key={invite._id} className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-[10px] font-black text-[#0070f3] uppercase tracking-tighter">New Invitation</p>
                <h3 className="text-xl font-black text-gray-900">
                  {invite.reservation.sport} <span className="text-gray-400 font-medium">with</span> {invite.sender.name}
                </h3>
                <p className="text-sm font-bold text-gray-500">{invite.reservation.date} • {invite.reservation.timeSlot}</p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => onRespond(invite._id, "accepted")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#0070f3] text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all"
                >
                  <Check size={18} /> Accept
                </button>
                <button 
                  onClick={() => onRespond(invite._id, "declined")}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
                >
                  <X size={18} /> Decline
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}