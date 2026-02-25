"use client";

import React, { useState, FormEvent } from "react";
import { Users, Calendar, Clock, Mail, X, ChevronLeft } from "lucide-react";

type SportType = "football" | "volleyball" | "badminton" | "tabletennis";

const sportsConfig: Record<SportType, { name: string; minParticipants: number; icon: string; color: string }> = {
  football: { name: "Football", minParticipants: 6, icon: "⚽", color: "green" },
  volleyball: { name: "Volleyball", minParticipants: 6, icon: "🏐", color: "orange" },
  badminton: { name: "Badminton", minParticipants: 4, icon: "🏸", color: "red" },
  tabletennis: { name: "Table Tennis", minParticipants: 2, icon: "🏓", color: "blue" },
};

export function SportsCategory({ user, onAddReservation, onBack }: any) {
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);
  const [formData, setFormData] = useState({ date: "", time: "" });
  const [invitations, setInvitations] = useState<{ email: string; status: string }[]>([]);
  const [emailInput, setEmailInput] = useState("");

  const addInvitation = () => {
    if (!emailInput.trim()) return;
    if (invitations.some((inv) => inv.email === emailInput)) return;
    setInvitations([...invitations, { email: emailInput, status: "pending" }]);
    setEmailInput("");
  };

  const removeInvitation = (email: string) => {
    setInvitations(invitations.filter((inv) => inv.email !== email));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedSport) return;

    const config = sportsConfig[selectedSport];
    const totalParticipants = invitations.length + 1;

    if (totalParticipants < config.minParticipants) {
      alert(`Minimum ${config.minParticipants} participants required.`);
      return;
    }

    const reservationData = {
      sport: config.name,
      date: formData.date,
      timeSlot: formData.time,
      hostName: user.name,
      minParticipants: config.minParticipants,
    };

    try {
      // 1. Save Reservation to MongoDB
      const res = await fetch("/api/auth/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      if (!res.ok) throw new Error("Failed to save reservation");
      const savedRes = await res.json();

      // 2. Send Invitations to each email added
      for (const inv of invitations) {
        await fetch("/api/invitation/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: user.id || user._id,
            email: inv.email,
            reservationId: savedRes._id
          }),
        });
      }

      onAddReservation(savedRes);
      setSelectedSport(null);
      setInvitations([]);
      setFormData({ date: "", time: "" });
      alert("Reservation confirmed and invites sent!");
    } catch (err) {
      console.error(err);
      alert("Error saving reservation to database.");
    }
  };

  if (!selectedSport) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <button onClick={onBack} className="text-[#0070f3] font-black flex items-center gap-2 shrink-0">
            <ChevronLeft size={20} /> Back to Dashboard
          </button>
          <h2 className="text-2xl font-black text-gray-900">Sports Facilities</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(sportsConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedSport(key as SportType)}
              className="p-8 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-blue-500 hover:shadow-xl transition-all group text-center"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{config.icon}</div>
              <h3 className="text-xl font-black mb-2">{config.name}</h3>
              <div className="flex items-center gap-2 text-gray-400 justify-center font-bold">
                <Users className="w-4 h-4" />
                <span className="text-sm">Min {config.minParticipants} players</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const config = sportsConfig[selectedSport];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={() => setSelectedSport(null)} className="mb-6 text-[#0070f3] font-bold flex items-center gap-2">
        ← Back to Sports
      </button>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
        <div className="flex items-center gap-5 mb-10">
          <span className="text-6xl">{config.icon}</span>
          <div>
            <h2 className="text-3xl font-black text-gray-900">{config.name}</h2>
            <p className="text-gray-400 font-bold">Minimum {config.minParticipants} participants required</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-black text-gray-700 uppercase text-[10px] tracking-widest">Host Name</label>
            <input type="text" readOnly value={user.name} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-black text-gray-700 uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0070f3]" /> Date
              </label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" min={new Date().toISOString().split("T")[0]} />
            </div>

            <div>
              <label className="block mb-2 font-black text-gray-700 uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0070f3]" /> Time Slot
              </label>
              <select required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold appearance-none" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })}>
                <option value="">Select Time</option>
                {Array.from({ length: 14 }, (_, i) => i + 6).map((hour) => (
                  <option key={hour} value={`${hour}:00`}>{hour.toString().padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-black text-gray-700 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0070f3]" /> Invite Participants
            </label>
            <div className="flex gap-2 mb-4">
              <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="flex-1 px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" placeholder="email@example.com" />
              <button type="button" onClick={addInvitation} className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-colors">Add</button>
            </div>

            {invitations.length > 0 && (
              <div className="grid grid-cols-1 gap-2 mb-4">
                {invitations.map((inv) => (
                  <div key={inv.email} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <span className="text-sm font-bold text-[#0070f3]">{inv.email}</span>
                    <button type="button" onClick={() => removeInvitation(inv.email)} className="text-red-500"><X className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="w-full py-5 bg-[#0070f3] text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
            Confirm Reservation
          </button>
        </form>
      </div>
    </div>
  );
}