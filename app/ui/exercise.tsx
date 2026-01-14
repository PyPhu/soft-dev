"use client";

import { useState } from "react";
import { Dumbbell, Waves, Calendar, Users, Clock, ChevronLeft, Tag, Info } from "lucide-react";

type ExerciseFacility = "fitness" | "swimming";

interface User {
  name: string;
  email: string;
}

interface ExerciseReservation {
  type: "exercise";
  id: string;
  facility: string;
  date: string;
  time: string;
  participants: number;
  userName: string;
}

interface ExerciseCategoryProps {
  user: User;
  onAddReservation: (reservation: ExerciseReservation) => void;
  onBack: () => void;
}

// --- NEW BROCHURE COMPONENT ---
function ExerciseBrochure() {
  const facilities = [
    {
      title: "KMITL Fitness Gym",
      icon: <Dumbbell className="text-[#0070f3]" size={32} />,
      hours: "06:00 - 21:00",
      price: "20 THB",
      details: ["Sneakers required", "Bring a towel"],
    },
    {
      title: "Swimming Pool",
      icon: <Waves className="text-cyan-500" size={32} />,
      hours: "06:00 - 20:00",
      price: "30 THB",
      details: ["Swimwear only", "Shower first"],
    }
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-10">
      {facilities.map((f, i) => (
        <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 shadow-sm">
          <div className="bg-gray-50 p-4 rounded-2xl shrink-0">{f.icon}</div>
          <div className="min-w-0">
            <h4 className="font-black text-gray-900 truncate text-base md:text-lg">{f.title}</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] font-black text-[#0070f3] bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1">
                <Clock size={10}/> {f.hours}
              </span>
              <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1">
                <Tag size={10}/> {f.price}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExerciseCategory({ user, onAddReservation, onBack }: ExerciseCategoryProps) {
  const [selectedFacility, setSelectedFacility] = useState<ExerciseFacility | null>(null);
  const [formData, setFormData] = useState({
    date: "2026-01-13", // Changed to YYYY-MM-DD for native date picker
    time: "",
    participants: 1,
  });

  const facilityConfig = {
    fitness: { name: "Fitness Center", maxCapacity: 30, icon: Dumbbell },
    swimming: { name: "Swimming Pool", maxCapacity: 35, icon: Waves },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;
    const config = facilityConfig[selectedFacility];

    const newReservation: ExerciseReservation = {
      type: "exercise",
      id: Date.now().toString(),
      facility: config.name,
      date: formData.date,
      time: formData.time,
      participants: formData.participants,
      userName: user.name,
    };

    onAddReservation(newReservation);
    alert(`Reservation Confirmed!\nFacility: ${config.name}\nDate: ${formData.date}\nTime: ${formData.time}`);
    setFormData({ date: "2026-01-13", time: "", participants: 1 });
    setSelectedFacility(null);
  };

  if (!selectedFacility) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* RESPONSIVE HEADER */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <button onClick={onBack} className="text-[#0070f3] font-black flex items-center gap-2 shrink-0">
                <ChevronLeft size={20} /> <span className="hidden sm:inline">Back to Dashboard</span><span className="sm:hidden">Back</span>
            </button>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Exercise Facilities</h2>
        </div>

        {/* BROCHURE SECTION */}
        <ExerciseBrochure />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(facilityConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedFacility(key as ExerciseFacility)}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all text-left group"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{config.name}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                  <Users size={16} />
                  <span>Max {config.maxCapacity} users</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const config = facilityConfig[selectedFacility];
  const Icon = config.icon;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <button
        onClick={() => setSelectedFacility(null)}
        className="mb-6 text-[#0070f3] font-bold flex items-center gap-1 hover:underline"
      >
        <ChevronLeft size={20} /> Back to Selection
      </button>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-10 shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0070f3] shrink-0">
            <Icon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">{config.name}</h2>
            <p className="text-gray-500 font-bold text-sm">Max capacity: {config.maxCapacity} users</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3">
              <Calendar size={18} className="text-gray-400" /> Date
            </label>
            {/* FIXED DATE BOX: Added max-w-full and box-border */}
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full max-w-full box-border px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3">
              <Clock size={18} className="text-gray-400" /> Time
            </label>
            <select
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full max-w-full box-border px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none appearance-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select time</option>
              {Array.from({ length: 14 }, (_, i) => i + 6).map((hour) => (
                <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                  {hour.toString().padStart(2, '0')}:00
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-black text-gray-700 mb-3">
              <Users size={18} className="text-gray-400" /> Participants
            </label>
            <input
              type="number"
              required
              min="1"
              max={config.maxCapacity}
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
              className="w-full max-w-full box-border px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!formData.time}
            className="w-full py-5 bg-[#0070f3] text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
          >
            Confirm Reservation
          </button>
        </form>
      </div>
    </div>
  );
}