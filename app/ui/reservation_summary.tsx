"use client";

import { useState } from "react";
import { 
  Calendar, Clock, Users, MapPin, Book, Coffee, 
  Dumbbell, Trophy, Trash2, AlertCircle 
} from "lucide-react";

export function ReservationSummary({ user, reservations, onBack, onCancelReservation }: any) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Filters to group reservations by type
  const exerciseReservations = reservations.filter((r: any) => r.type === "exercise");
  const sportsReservations = reservations.filter((r: any) => r.type === "sports");
  const libraryReservations = reservations.filter((r: any) => r.type === "library");
  const canteenReservations = reservations.filter((r: any) => r.type === "canteen");

  const handleCancel = (id: string) => {
    onCancelReservation(id);
    setCancellingId(null);
  };

  const StatBox = ({ label, count }: { label: string; count: number }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
      <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-white">{count}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={onBack} className="text-[#0070f3] font-bold flex items-center gap-2 hover:underline">
            ← Back to Categories
          </button>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            Welcome, <span className="text-gray-900 font-bold">{user.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-8 px-4">
        {/* Statistics Header */}
        <div className="bg-gradient-to-br from-[#0070f3] to-[#00a3ff] rounded-[2.5rem] p-10 mb-10 text-white shadow-2xl shadow-blue-100 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-6 tracking-tight">My Reservations</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBox label="Total" count={reservations.length} />
              <StatBox label="Exercise" count={exerciseReservations.length} />
              <StatBox label="Sports" count={sportsReservations.length} />
              <StatBox label="Canteen" count={canteenReservations.length} />
            </div>
          </div>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-[#0070f3]" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No active bookings</h2>
            <button onClick={onBack} className="mt-4 px-10 py-4 bg-[#0070f3] text-white rounded-2xl font-black shadow-lg">
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* --- SPORTS SECTION (FIXED) --- */}
            {sportsReservations.length > 0 && (
              <ReservationSection title="Sports Facilities" icon={<Trophy />}>
                {sportsReservations.map((res: any) => (
                  <ReservationCard 
                    key={res.id} 
                    res={res}
                    title={res.sport} 
                    date={res.date} 
                    time={res.time}
                    isCancelling={cancellingId === res.id}
                    onCancelClick={() => setCancellingId(res.id)}
                    onConfirmCancel={() => handleCancel(res.id)}
                    onAbortCancel={() => setCancellingId(null)}
                    extra={
                        <div className="mt-2 flex gap-4 text-xs font-bold text-gray-400">
                             <div className="flex items-center gap-1"><Users size={14}/> {res.participants} Participants</div>
                             {res.court && <div className="flex items-center gap-1"><MapPin size={14}/> Court {res.court}</div>}
                        </div>
                    }
                  />
                ))}
              </ReservationSection>
            )}

            {/* --- CANTEEN SECTION --- */}
            {canteenReservations.length > 0 && (
              <ReservationSection title="Canteen Tables" icon={<Coffee />}>
                {canteenReservations.map((res: any) => (
                  <ReservationCard 
                    key={res.id} 
                    res={res}
                    title={res.canteen} 
                    date="Multiple Tables Selected" 
                    time={`${res.totalSeats} Total Seats`}
                    isCancelling={cancellingId === res.id}
                    onCancelClick={() => setCancellingId(res.id)}
                    onConfirmCancel={() => handleCancel(res.id)}
                    onAbortCancel={() => setCancellingId(null)}
                    extra={
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {res.reservations.map((table: any, idx: number) => (
                                <div key={idx} className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                                    <p className="text-[10px] font-black text-[#0070f3] uppercase tracking-tighter">Table {table.table}</p>
                                    <p className="text-xs font-bold text-gray-600">Seats: {table.seats.join(", ")}</p>
                                </div>
                            ))}
                        </div>
                    }
                  />
                ))}
              </ReservationSection>
            )}

            {/* --- EXERCISE SECTION --- */}
            {exerciseReservations.length > 0 && (
              <ReservationSection title="Exercise Facilities" icon={<Dumbbell />}>
                {exerciseReservations.map((res: any) => (
                  <ReservationCard 
                    key={res.id} 
                    res={res}
                    title={res.facility} 
                    date={res.date} 
                    time={res.time}
                    isCancelling={cancellingId === res.id}
                    onCancelClick={() => setCancellingId(res.id)}
                    onConfirmCancel={() => handleCancel(res.id)}
                    onAbortCancel={() => setCancellingId(null)}
                  />
                ))}
              </ReservationSection>
            )}

          </div>
        )}
      </main>
    </div>
  );
}

// Sub-components
function ReservationSection({ title, icon, children }: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 ml-2">
                <div className="w-10 h-10 bg-[#0070f3] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                    {icon}
                </div>
                <h2 className="text-lg font-black text-gray-900">{title}</h2>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function ReservationCard({ title, date, time, extra, isCancelling, onCancelClick, onConfirmCancel, onAbortCancel }: any) {
    return (
        <div className={`bg-white rounded-[2.5rem] p-8 border transition-all ${isCancelling ? 'border-red-200 ring-4 ring-red-50' : 'border-gray-100 shadow-sm'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-gray-900">{title}</h3>
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase border border-green-100">
                            Confirmed
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-500">
                        <div className="flex items-center gap-2"><Calendar size={18} className="text-[#0070f3]" /> {date}</div>
                        <div className="flex items-center gap-2"><Clock size={18} className="text-[#0070f3]" /> {time}</div>
                    </div>
                    {extra}
                </div>

                <div className="w-full md:w-auto">
                    {!isCancelling ? (
                        <button onClick={onCancelClick} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors">
                            <Trash2 size={18} /> Cancel Booking
                        </button>
                    ) : (
                        <div className="bg-red-50 p-4 rounded-2xl flex flex-col gap-3 animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                                <AlertCircle size={16} /> Confirm cancellation?
                            </div>
                            <div className="flex gap-2">
                                <button onClick={onConfirmCancel} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-100">Yes, Cancel</button>
                                <button onClick={onAbortCancel} className="bg-white text-gray-600 px-4 py-2 rounded-xl text-xs font-bold border border-red-100">Keep it</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}