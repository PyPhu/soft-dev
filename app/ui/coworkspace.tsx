"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  DoorOpen,
  Gamepad2,
  LayoutGrid,
  MapPin,
  Mic2,
  Users,
} from "lucide-react";

type HubId = "hm" | "kllc";

interface User {
  name: string;
  email: string;
  id?: string;
  _id?: string;
}

interface MembershipCategoryProps {
  user: User;
  onAddReservation: (reservation: unknown) => void;
  onBack?: () => void;
}

interface CoworkingSpace {
  id: string;
  hub: HubId;
  name: string;
  location: string;
  totalUnits: number;
  unitLabel: string;
  icon: "room" | "table" | "meeting" | "karaoke" | "game";
}

const hubs: Record<HubId, { name: string; location: string }> = {
  hm: { name: "HM", location: "HM Building" },
  kllc: { name: "KLLC", location: "KLLC Building" },
};

const coworkingSpaces: CoworkingSpace[] = [
  {
    id: "hm-private-room",
    hub: "hm",
    name: "Private Room",
    location: "HM-605",
    totalUnits: 2,
    unitLabel: "Room",
    icon: "room",
  },
  {
    id: "hm-605-table",
    hub: "hm",
    name: "Open Tables",
    location: "HM-605",
    totalUnits: 12,
    unitLabel: "Table",
    icon: "table",
  },
  {
    id: "hm-7f-table",
    hub: "hm",
    name: "Open Tables",
    location: "HM 7th Floor",
    totalUnits: 6,
    unitLabel: "Table",
    icon: "table",
  },
  {
    id: "kllc-meeting-room",
    hub: "kllc",
    name: "Meeting Room",
    location: "KLLC",
    totalUnits: 2,
    unitLabel: "Room",
    icon: "meeting",
  },
  {
    id: "kllc-karaoke",
    hub: "kllc",
    name: "Karaoke Room",
    location: "KLLC",
    totalUnits: 1,
    unitLabel: "Room",
    icon: "karaoke",
  },
  {
    id: "kllc-game-room",
    hub: "kllc",
    name: "Game Room",
    location: "KLLC",
    totalUnits: 1,
    unitLabel: "Room",
    icon: "game",
  },
];

function SpaceIcon({ type }: { type: CoworkingSpace["icon"] }) {
  if (type === "table") return <LayoutGrid size={24} />;
  if (type === "meeting") return <Users size={24} />;
  if (type === "karaoke") return <Mic2 size={24} />;
  if (type === "game") return <Gamepad2 size={24} />;
  return <DoorOpen size={24} />;
}

export function MembershipCategory({ user, onAddReservation }: MembershipCategoryProps) {
  const [selectedHub, setSelectedHub] = useState<HubId | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "",
  });

  const spacesInHub = useMemo(
    () => coworkingSpaces.filter((space) => space.hub === selectedHub),
    [selectedHub],
  );

  const selectedSpace = useMemo(
    () => coworkingSpaces.find((space) => space.id === selectedSpaceId) || null,
    [selectedSpaceId],
  );

  const handleConfirmBooking = async () => {
    if (!selectedHub || !selectedSpace || !selectedUnit || !formData.time) {
      alert("Please choose space, unit, date and time before confirming.");
      return;
    }

    const reservationData = {
      type: "coworking",
      hostName: user.name,
      userName: user.name,
      hub: hubs[selectedHub].name,
      spaceId: selectedSpace.id,
      unitNumber: selectedUnit,
      facility: `${selectedSpace.name} (${selectedSpace.location})`,
      unit: `${selectedSpace.unitLabel} ${selectedUnit}`,
      date: formData.date,
      time: formData.time,
      // Backward-compatible fields so existing reservation summary still renders this item.
      canteen: `${hubs[selectedHub].name} - ${selectedSpace.name}`,
      totalSeats: 1,
      reservations: [{ table: selectedUnit, seats: [1] }],
    };

    try {
      const response = await fetch("/api/coworkspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create reservation");
      }

      const saved = await response.json();
      onAddReservation(saved);
      alert(`Reservation confirmed for ${selectedSpace.unitLabel} ${selectedUnit}.`);

      setSelectedUnit(null);
      setSelectedSpaceId(null);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        time: "",
      });
    } catch (error) {
      console.error(error);
      alert("Could not save reservation. Please try again.");
    }
  };

  if (!selectedHub) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Co-Working Space Reservation</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {(Object.keys(hubs) as HubId[]).map((hubId) => {
            const hub = hubs[hubId];
            const hubSpaces = coworkingSpaces.filter((space) => space.hub === hubId);
            const totalUnits = hubSpaces.reduce((sum, space) => sum + space.totalUnits, 0);

            return (
              <button
                key={hubId}
                onClick={() => setSelectedHub(hubId)}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all text-left group"
              >
                <div className="bg-orange-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform">
                  <Users size={30} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{hub.name}</h3>
                <p className="text-sm text-gray-400 font-bold mb-5 flex items-center gap-2">
                  <MapPin size={16} className="text-orange-500" /> {hub.location}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {hubSpaces.map((space) => (
                    <span
                      key={space.id}
                      className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase"
                    >
                      {space.name} ({space.totalUnits})
                    </span>
                  ))}
                </div>
                <span className="text-xs font-black text-gray-500 uppercase tracking-wide">
                  {totalUnits} total bookable units
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <button
        onClick={() => {
          setSelectedHub(null);
          setSelectedSpaceId(null);
          setSelectedUnit(null);
        }}
        className="mb-4 inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-2 text-sm font-black text-[#0070f3] shadow-sm transition-all hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
      >
        <ChevronLeft size={18} /> Back to Locations
      </button>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {hubs[selectedHub].name} Co-Working Spaces
            </h2>
          </div>

          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                <Calendar size={12} /> Date
              </label>
              <input
                type="date"
                value={formData.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 font-bold text-sm w-40 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1">
                <Clock size={12} /> Booking Time
              </label>
              <select
                value={formData.time}
                onChange={(event) => setFormData({ ...formData, time: event.target.value })}
                className="bg-blue-50 border border-blue-100 text-[#0070f3] rounded-xl px-4 py-2 font-black text-sm outline-none"
              >
                <option value="">Select Time</option>
                {Array.from({ length: 14 }, (_, index) => index + 6).map((hour) => (
                  <option key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                    {hour.toString().padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleConfirmBooking}
              className={`px-8 py-3 rounded-2xl font-black shadow-lg transition-all flex items-center gap-2 active:scale-95 ${
                selectedSpace && selectedUnit && formData.time
                  ? "bg-[#0070f3] text-white shadow-blue-100 hover:bg-blue-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <CheckCircle2 size={18} /> Confirm Booking
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {spacesInHub.map((space) => {
          const isSelected = selectedSpaceId === space.id;

          return (
            <button
              key={space.id}
              onClick={() => {
                setSelectedSpaceId(space.id);
                setSelectedUnit(null);
              }}
              className={`rounded-[2rem] p-7 border text-left transition-all ${
                isSelected
                  ? "bg-blue-50 border-blue-200 shadow-md"
                  : "bg-white border-gray-100 hover:shadow-lg"
              }`}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-[#0070f3]">
                  <SpaceIcon type={space.icon} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{space.name}</h3>
                  <p className="text-sm text-gray-500 font-bold">{space.location}</p>
                </div>
              </div>
              <p className="text-xs font-black uppercase text-blue-600 bg-blue-100 inline-flex px-3 py-1 rounded-full">
                {space.totalUnits} {space.unitLabel}{space.totalUnits > 1 ? "s" : ""} Available
              </p>
            </button>
          );
        })}
      </div>

      {selectedSpace && (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-2xl font-black text-gray-900 mb-2">Select {selectedSpace.unitLabel}</h3>
          <p className="text-sm font-bold text-gray-500 mb-6">
            {selectedSpace.name} • {selectedSpace.location}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: selectedSpace.totalUnits }, (_, index) => index + 1).map((unitNo) => (
              <button
                key={unitNo}
                onClick={() => setSelectedUnit(unitNo)}
                className={`px-4 py-4 rounded-2xl border font-black text-sm transition-all ${
                  selectedUnit === unitNo
                    ? "bg-[#0070f3] border-[#0070f3] text-white shadow-lg"
                    : "bg-gray-50 border-gray-100 text-gray-600 hover:border-blue-300"
                }`}
              >
                {selectedSpace.unitLabel} {unitNo}
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-bold text-gray-600">
            {selectedUnit
              ? `Selected: ${selectedSpace.unitLabel} ${selectedUnit}`
              : `Choose one ${selectedSpace.unitLabel.toLowerCase()} to continue.`}
          </div>
        </div>
      )}
    </div>
  );
}
