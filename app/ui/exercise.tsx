"use client";

import { ChevronLeft, Clock, Dumbbell, Waves, Info } from "lucide-react";

interface User {
  name: string;
  email: string;
  id?: string;
  _id?: string;
}

interface ExerciseCategoryProps {
  user: User;
  onAddReservation: (reservation: unknown) => void;
  onBack: () => void;
}

const serviceHours = [
  { period: "Morning", time: "08:30 - 12:00" },
  { period: "Afternoon", time: "13:00 - 16:00" },
  { period: "Evening", time: "16:01 - 20:00" },
];

const gymFees = [
  { category: "Category 1", oneMonth: "1,000", sixMonths: "3,300", twelveMonths: "4,500" },
  { category: "Category 2", oneMonth: "1,200", sixMonths: "4,200", twelveMonths: "6,000" },
  { category: "Category 3", oneMonth: "1,300", sixMonths: "4,200", twelveMonths: "7,000" },
  { category: "Category 4*", oneMonth: "1,500", sixMonths: "4,500", twelveMonths: "7,500" },
  { category: "Non-Member", oneMonth: "1,900", sixMonths: "6,000", twelveMonths: "10,000" },
];

const poolFees = [
  { category: "Category 1", morning: "30", afternoon: "50", evening: "80" },
  { category: "Category 2", morning: "40", afternoon: "60", evening: "90" },
  { category: "Category 3", morning: "40", afternoon: "60", evening: "90" },
  { category: "Category 4", morning: "60", afternoon: "80", evening: "110" },
  { category: "Non-Member", morning: "80", afternoon: "100", evening: "140" },
];

export function ExerciseCategory({ onBack }: ExerciseCategoryProps) {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-2 text-sm font-black text-[#0070f3] shadow-sm transition-all hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 shrink-0"
        >
          <ChevronLeft size={20} />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>
        <h2 className="text-xl md:text-2xl font-black text-gray-900">KM Wellness & Sports Center</h2>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-10 shadow-sm mb-8">
        <p className="text-gray-600 font-bold text-sm md:text-base">
          King Mongkut&apos;s Institute of Technology Ladkrabang (KMITL)
        </p>
      </div>

      <section className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-[#0070f3]" size={22} />
          <h3 className="text-lg md:text-xl font-black text-gray-900">Service Hours</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {serviceHours.map((slot) => (
            <div key={slot.period} className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-black mb-2">{slot.period}</p>
              <p className="text-base font-black text-gray-900">{slot.time}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-sm mb-8 overflow-x-auto">
        <div className="flex items-center gap-3 mb-6">
          <Dumbbell className="text-[#0070f3]" size={22} />
          <h3 className="text-lg md:text-xl font-black text-gray-900">Gym Membership Fees (THB / Person)</h3>
        </div>
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="text-left bg-blue-50 text-[#0070f3]">
              <th className="px-4 py-3 font-black rounded-l-xl">Category</th>
              <th className="px-4 py-3 font-black">1 Month</th>
              <th className="px-4 py-3 font-black">6 Months</th>
              <th className="px-4 py-3 font-black rounded-r-xl">12 Months</th>
            </tr>
          </thead>
          <tbody>
            {gymFees.map((row) => (
              <tr key={row.category} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-bold text-gray-900">{row.category}</td>
                <td className="px-4 py-3 font-semibold text-gray-600">{row.oneMonth}</td>
                <td className="px-4 py-3 font-semibold text-gray-600">{row.sixMonths}</td>
                <td className="px-4 py-3 font-semibold text-gray-600">{row.twelveMonths}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-sm mb-8 overflow-x-auto">
        <div className="flex items-center gap-3 mb-6">
          <Waves className="text-cyan-500" size={22} />
          <h3 className="text-lg md:text-xl font-black text-gray-900">Swimming Pool Fees (THB / Session)</h3>
        </div>
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="text-left bg-cyan-50 text-cyan-700">
              <th className="px-4 py-3 font-black rounded-l-xl">Category</th>
              <th className="px-4 py-3 font-black">Morning</th>
              <th className="px-4 py-3 font-black">Afternoon</th>
              <th className="px-4 py-3 font-black rounded-r-xl">Evening</th>
            </tr>
          </thead>
          <tbody>
            {poolFees.map((row) => (
              <tr key={row.category} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-bold text-gray-900">{row.category}</td>
                <td className="px-4 py-3 font-semibold text-gray-600">{row.morning}</td>
                <td className="px-4 py-3 font-semibold text-gray-600">{row.afternoon}</td>
                <td className="px-4 py-3 font-semibold text-gray-600">{row.evening}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <Info className="text-amber-500" size={22} />
          <h3 className="text-lg md:text-xl font-black text-gray-900">Notes</h3>
        </div>
        <div className="space-y-2 text-sm font-bold text-gray-600">
          <p>All prices are per person.</p>
          <p>Pool fees are charged per session.</p>
          <p>Longer memberships offer better value per month.</p>
          <p>*Category 4 = External individuals (registered members).</p>
        </div>
      </section>
    </div>
  );
}
