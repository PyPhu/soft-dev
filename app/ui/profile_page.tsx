"use client";

import {ArrowLeft, Camera } from "lucide-react";

interface ProfilePageProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  reservationCount: number;
  onBack: () => void;
}

export function ProfilePage({ user, reservationCount, onBack }: ProfilePageProps) {
  // Use local default if no user image exists
  const profileImg = user.image || "/default_profile.png";

  return (
    <main className="min-h-screen bg-[#f1f5f9] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold text-sm uppercase tracking-wide"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Banner */}
          <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-400" />
          
          <div className="px-8 pb-10">
            {/* Avatar Section */}
            <div className="relative -mt-12 mb-6 flex justify-center">
              <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-3xl border-4 border-white bg-white overflow-hidden shadow-xl">
                  <img 
                    src={profileImg} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                {/* Visual indicator that photo can be changed */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                   <Camera className="text-white" size={24} />
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900">{user.name}</h2>
              <p className="text-gray-400 font-medium">{user.email}</p>
            </div>

            {/* Centered Stat Box */}
            <div className="flex justify-center mb-10">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center min-w-[200px]">
                <p className="text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Total Bookings</p>
                <p className="text-3xl font-black text-[#0070f3]">{reservationCount}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
               <button className="w-full py-4 bg-[#0070f3] text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.99]">
                 Update Profile Info
               </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}