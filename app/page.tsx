"use client";

import { useState, useEffect } from "react";
import { Login } from "./ui/login";
import { SportsCategory } from "./ui/sport";
import { MembershipCategory } from "./ui/coworkspace";
import { ExerciseCategory } from "./ui/exercise"; 
import { ReservationSummary } from "./ui/reservation_summary"; 
import { LogOut, FileText, ChevronLeft } from "lucide-react"; 
import { useSession, signOut } from "next-auth/react"; 
import { ProfilePage } from "./ui/profile_page";

export default function Home() {
  const { data: session } = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // --- Logic & Effects (Kept exactly as you had them) ---
  useEffect(() => {
    if (session?.user) {
      setCurrentUser({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
      });
      setIsLoggedIn(true);
    }
  }, [session]);

  const fetchUserReservations = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/reservation?email=${encodeURIComponent(currentUser.email)}`);
      const data = await res.json();
      const combined = [
        ...(data.owned || []).map((r: any) => ({ ...r, role: 'host' })),
        ...(data.received || []).map((r: any) => ({ ...r, role: 'invitee' }))
      ];
      setReservations(combined);
    } catch (err) { console.error("Sync failed:", err); }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserReservations();
      const interval = setInterval(fetchUserReservations, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentUser]);

  const handleLogout = () => {
    if (session) signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleCancelReservation = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      const res = await fetch(`/api/reservation?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchUserReservations();
    } catch (e) { console.error(e); }
  };

  // --- 1. LOGIN GUARD (This is the only early return allowed) ---
  if (!isLoggedIn) return <Login onLogin={(data) => { setCurrentUser(data); setIsLoggedIn(true); }} />;

  // --- 2. THE UNIFIED RENDER ---
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* GLOBAL NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* LEFT SECTION: Back Button & Logo */}
          <div className="flex items-center relative min-w-[150px]">
            {(activeCategory || showSummary || showProfile) && (
              <button
                onClick={() => {
                  setActiveCategory(null);
                  setShowSummary(false);
                  setShowProfile(false);
                }}
                className="absolute left-0 inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-black text-[#0070f3] shadow-sm transition-all hover:bg-blue-100 hover:scale-105 active:scale-95 z-10"
              >
                <ChevronLeft size={16} /> <span>Back</span>
              </button>
            )}
            
            <h1 className={`text-xl font-black text-gray-900 tracking-tight transition-all duration-300 ${
              (activeCategory || showSummary || showProfile) ? 'opacity-0 md:opacity-100 md:ml-24' : 'ml-0'
            }`}>
              KMITL <span className="text-[#0070f3]">Reserve</span>
            </h1>
          </div>

          {/* RIGHT SECTION: Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* My Reservations Button */}
            <button 
              onClick={() => { setShowSummary(true); setShowProfile(false); setActiveCategory(null); }}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all border ${
                showSummary 
                  ? 'bg-[#0070f3] text-white border-[#0070f3] shadow-lg shadow-blue-200 scale-105' 
                  : 'bg-blue-50 text-[#0070f3] border-blue-100 hover:bg-blue-100 hover:border-blue-200 hover:shadow-sm'
              } active:scale-95`}
            >
              <FileText size={16} className={showSummary ? "text-white" : "text-[#0070f3]"} /> 
              <span className="hidden sm:inline">My Reservations</span> 
              <span className={`ml-1 px-1.5 py-0.5 rounded-md ${showSummary ? 'bg-white/20' : 'bg-blue-200/50'}`}>
                {reservations.length}
              </span>
            </button>
            
            {/* Profile Button */}
            <button 
              onClick={() => { setShowProfile(true); setShowSummary(false); setActiveCategory(null); }}
              className={`group flex items-center gap-2 p-1 pr-3 rounded-full border transition-all active:scale-95 ${
                showProfile 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' 
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300'
              }`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                <img 
                  src={currentUser?.image || "/default_profile.png"} 
                  alt="User" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="text-xs font-bold text-gray-700 hidden sm:inline">
                {currentUser?.name?.split(' ')[0]}
              </span>
            </button>

            {/* Logout Button */}
            <button 
              onClick={handleLogout} 
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* DYNAMIC CONTENT SWITCHER */}
      <main className="animate-in fade-in duration-500">
        {showProfile ? (
          <div className="py-8">
            <ProfilePage user={currentUser!} reservationCount={reservations.length} onBack={() => setShowProfile(false)} onUpdateUser={setCurrentUser} />
          </div>
        ) : showSummary ? (
          <ReservationSummary user={currentUser!} reservations={reservations} onBack={() => setShowSummary(false)} onCancelReservation={handleCancelReservation} refreshData={fetchUserReservations} />
        ) : activeCategory ? (
          <div className="max-w-6xl mx-auto p-6">
            {activeCategory === 'sports' && <SportsCategory user={currentUser!} onAddReservation={fetchUserReservations} onBack={() => setActiveCategory(null)} />}
            {activeCategory === 'membership' && <MembershipCategory user={currentUser!} onAddReservation={fetchUserReservations} onBack={() => setActiveCategory(null)} />}
            {activeCategory === 'exercise' && <ExerciseCategory user={currentUser!} onAddReservation={fetchUserReservations} onBack={() => setActiveCategory(null)} />}
          </div>
        ) : (
          /* DASHBOARD VIEW (Only shows if none of the above are active) */
          <div className="max-w-6xl mx-auto py-12 px-6">
            <header className="mb-12 bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">KMITL Facility Reservation System</h1>
              <p className="text-gray-500 font-medium">King Mongkut's Institute of Technology Ladkrabang</p>
              <div className="mt-4 inline-block bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 text-xs text-gray-400">
                Logged in as: <span className="text-blue-600 font-semibold">{currentUser?.email}</span>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <CategoryCard title="Exercise" desc="Fitness Center & Swimming Pool" icon="🏋️‍♂️" bgColor="bg-[#0070f3]" onClick={() => setActiveCategory('exercise')} />
              <CategoryCard title="Sports" desc="Football, Volleyball, Badminton" icon="🏆" bgColor="bg-[#22c55e]" onClick={() => setActiveCategory('sports')} />
              <CategoryCard title="Co-Working Space" desc="Canteen Table Booking" icon="👥" bgColor="bg-[#f97316]" onClick={() => setActiveCategory('membership')} />
            </div>

            <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100">
               <h2 className="text-center text-lg font-bold text-gray-900 mb-12 uppercase tracking-wide">How It Works</h2>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 <Step num="1" color="bg-blue-50 text-blue-500" title="Select Category" desc="Choose a category" />
                 <Step num="2" color="bg-green-50 text-green-500" title="Choose Facility" desc="Select the facility" />
                 <Step num="3" color="bg-purple-50 text-purple-500" title="Fill Details" desc="Enter details" />
                 <Step num="4" color="bg-orange-50 text-orange-500" title="Confirm" desc="Finalize booking" />
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Subcomponents (CategoryCard, Step) remain the same at the bottom of your file.

// Subcomponents stay the same...
function CategoryCard({ title, desc, icon, bgColor, onClick }: any) {
  return (
    <div onClick={onClick} className="bg-white p-8 rounded-[2rem] shadow-md hover:shadow-xl hover:translate-y-[-4px] transition-all cursor-pointer border border-gray-50 group">
      <div className={`${bgColor} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ num, color, title, desc }: any) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center font-bold mb-4 shadow-sm`}>
        {num}
      </div>
      <h4 className="font-bold text-gray-900 text-sm mb-1">{title}</h4>
      <p className="text-[11px] text-gray-400 leading-tight px-4 font-medium">{desc}</p>
    </div>
  );
}
