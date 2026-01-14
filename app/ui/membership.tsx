"use client";

import { useState } from "react";
import { Coffee, MapPin, Users, Armchair, X, CheckCircle2, Trash2, LayoutGrid, Calendar, Clock, ChevronLeft } from "lucide-react";

interface CanteenReservation {
  type: "canteen";
  id: string;
  canteen: string;
  date: string;
  time: string;
  reservations: { table: number; seats: number[] }[];
  totalSeats: number;
  userName: string;
}

const canteens = [
  { id: "canteen1", name: "Engineering Canteen", location: "Engineering Building, 1st Floor", totalTables: 50 },
  { id: "canteen2", name: "Central Canteen", location: "Student Center, Ground Floor", totalTables: 30 },
];

export function MembershipCategory({ user, onAddReservation }: any) {
  const [selectedCanteen, setSelectedCanteen] = useState<string | null>(null);
  const [activeTable, setActiveTable] = useState<number | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<{table: number, seats: number[]}[]>([]);
  
  const [formData, setFormData] = useState({
    date: "13/01/2026",
    time: ""
  });

  const canteen = canteens.find((c) => c.id === selectedCanteen);
  const totalSeatsCount = selectedSeats.reduce((acc, curr) => acc + curr.seats.length, 0);

  // --- LOGIC FUNCTIONS ---
  const toggleSeat = (tableNum: number, seatNum: number) => {
    setSelectedSeats(prev => {
      const tableEntry = prev.find(item => item.table === tableNum);
      if (tableEntry) {
        const newSeats = tableEntry.seats.includes(seatNum)
          ? tableEntry.seats.filter(s => s !== seatNum)
          : [...tableEntry.seats, seatNum];
        
        return newSeats.length === 0 
          ? prev.filter(item => item.table !== tableNum)
          : prev.map(item => item.table === tableNum ? { ...item, seats: newSeats } : item);
      }
      return [...prev, { table: tableNum, seats: [seatNum] }];
    });
  };

  const selectFullTable = (tableNum: number) => {
    const allSeats = [1, 2, 3, 4, 5, 6, 7, 8];
    setSelectedSeats(prev => {
      const otherTables = prev.filter(item => item.table !== tableNum);
      return [...otherTables, { table: tableNum, seats: allSeats }];
    });
  };

  const handleConfirmAll = () => {
    if (!formData.time) return alert("Please select a time slot first.");
    if (selectedSeats.length === 0) return alert("Please select at least one seat.");

    onAddReservation({
      type: "canteen",
      id: Date.now().toString(),
      canteen: canteen?.name || "Unknown",
      date: formData.date,
      time: formData.time,
      reservations: selectedSeats,
      totalSeats: totalSeatsCount,
      userName: user.name,
    });

    alert(`Reservation Confirmed!\nTotal Seats: ${totalSeatsCount}`);
    setSelectedSeats([]);
    setSelectedCanteen(null);
  };

  if (!selectedCanteen) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-tight">Canteen Table Booking</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {canteens.map((c) => (
            <button key={c.id} onClick={() => setSelectedCanteen(c.id)} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all text-left group">
              <div className="bg-orange-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform">
                <Coffee size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">{c.name}</h3>
              <p className="text-sm text-gray-400 font-bold mb-4 flex items-center gap-2"><MapPin size={16} className="text-orange-500"/> {c.location}</p>
              <span className="text-xs font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase tracking-tighter">{c.totalTables} Tables Available</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20">
      {/* HEADER SECTION */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div>
            <button onClick={() => setSelectedCanteen(null)} className="text-[#0070f3] font-bold mb-2 flex items-center gap-1 hover:underline">
               <ChevronLeft size={18} /> Back to Canteens
            </button>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{canteen?.name}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1"><Calendar size={12}/> Date</label>
              <input type="text" value={formData.date} readOnly className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-bold text-sm w-32 outline-none"/>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1"><Clock size={12}/> Booking Time</label>
              <select 
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="bg-blue-50 border border-blue-100 text-[#0070f3] rounded-xl px-4 py-2 font-black text-sm outline-none"
              >
                <option value="">Select Time</option>
                {Array.from({ length: 14 }, (_, i) => i + 6).map((h) => (
                  <option key={h} value={`${h.toString().padStart(2, '0')}:00`}>{h.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase">Selected</p>
              <div className="flex items-baseline gap-1">
                <p key={totalSeatsCount} className="text-3xl font-black text-[#0070f3] animate-in zoom-in duration-300">
                    {totalSeatsCount}
                </p>
                <span className="text-xs font-black text-gray-400 uppercase">Seats</span>
              </div>
            </div>

            <button 
                onClick={handleConfirmAll} 
                className={`px-8 py-4 rounded-2xl font-black shadow-lg transition-all flex items-center gap-2 active:scale-95 ${
                    totalSeatsCount > 0 
                    ? 'bg-[#0070f3] text-white shadow-blue-100 hover:bg-blue-700 animate-pulse' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              <CheckCircle2 size={20} /> Confirm Booking
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <div className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Zone A • Entrance</h4>
          <div className="grid grid-cols-5 gap-4 bg-gray-50 p-8 rounded-[3rem] border border-gray-100">
            {Array.from({ length: 25 }).map((_, i) => (
              <TableBlock key={i} num={i + 1} seatsCount={selectedSeats.find(s => s.table === i + 1)?.seats.length || 0} onOpen={() => setActiveTable(i + 1)} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Zone B • Window</h4>
          <div className="grid grid-cols-5 gap-4 bg-gray-50 p-8 rounded-[3rem] border border-gray-100">
            {Array.from({ length: 25 }).map((_, i) => (
              <TableBlock key={i} num={i + 26} seatsCount={selectedSeats.find(s => s.table === i + 26)?.seats.length || 0} onOpen={() => setActiveTable(i + 26)} />
            ))}
          </div>
        </div>
      </div>

      {activeTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-12 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setActiveTable(null)} className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full">
              <X size={24} className="text-gray-400" />
            </button>
            <div className="text-center mb-8">
              <span className="bg-blue-50 text-[#0070f3] px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Table {activeTable} Settings</span>
              <h3 className="text-3xl font-black text-gray-900 mt-3">Select Seats</h3>
            </div>
            
            <div className="flex flex-col items-center">
                <div className="relative w-72 h-44 bg-gray-50 border-4 border-gray-100 rounded-[2.5rem] flex items-center justify-center shadow-inner mb-14">
                    <LayoutGrid className="text-gray-100 absolute" size={80} />
                    <span className="text-gray-300 font-black text-xl z-10">TABLE {activeTable}</span>
                    <div className="absolute -top-6 inset-x-6 flex justify-between">
                        {[1,2,3,4].map(s => <SeatCircle key={s} num={s} active={selectedSeats.find(t=>t.table===activeTable)?.seats.includes(s)} onClick={()=>toggleSeat(activeTable, s)} />)}
                    </div>
                    <div className="absolute -bottom-6 inset-x-6 flex justify-between">
                        {[5,6,7,8].map(s => <SeatCircle key={s} num={s} active={selectedSeats.find(t=>t.table===activeTable)?.seats.includes(s)} onClick={()=>toggleSeat(activeTable, s)} />)}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                  <button 
                    onClick={() => selectFullTable(activeTable)}
                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all text-sm ${
                      selectedSeats.find(t => t.table === activeTable)?.seats.length === 8
                      ? 'bg-[#0070f3] text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Users size={18} /> {selectedSeats.find(t => t.table === activeTable)?.seats.length === 8 ? 'Full Table' : 'Select Whole Table'}
                  </button>
                  <button 
                    onClick={() => setSelectedSeats(prev => prev.filter(t => t.table !== activeTable))}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-colors text-sm"
                  >
                    <Trash2 size={18} /> Clear Seats
                  </button>
                </div>
            </div>
            <button onClick={() => setActiveTable(null)} className="w-full py-5 bg-[#0070f3] text-white rounded-[2rem] font-black shadow-xl shadow-blue-100 text-lg hover:bg-blue-700 active:scale-95 transition-all">
              Done with Table {activeTable}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TableBlock({ num, onOpen, seatsCount }: any) {
    return (
      <button onClick={onOpen} className={`aspect-square rounded-[1.8rem] flex flex-col items-center justify-center transition-all duration-200 ${seatsCount > 0 ? 'bg-[#0070f3] text-white shadow-lg scale-105' : 'bg-white text-gray-400 border border-transparent shadow-sm hover:scale-105'}`}>
        <span className="text-[7px] font-black uppercase opacity-70">Table</span>
        <span className="text-xl font-black">{num}</span>
        {seatsCount > 0 && <span className="text-[8px] font-bold mt-1 bg-white/20 px-1.5 rounded-md">{seatsCount} Seats</span>}
      </button>
    );
}

function SeatCircle({ num, active, onClick }: any) {
    return (
      <button onClick={onClick} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 ${active ? 'bg-[#0070f3] border-[#0070f3] text-white scale-110 shadow-lg' : 'bg-white border-gray-100 text-gray-300 hover:border-blue-400'}`}>
        <div className="flex flex-col items-center">
          <Armchair size={18} />
          <span className="text-[7px] font-black">{num}</span>
        </div>
      </button>
    );
}