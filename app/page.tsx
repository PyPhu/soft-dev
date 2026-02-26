"use client";

import { useState, useEffect } from "react";
import { Login } from "./ui/login";
import { SportsCategory } from "./ui/sport";
import { MembershipCategory } from "./ui/membership";
import { ExerciseCategory } from "./ui/exercise"; 
import { ReservationSummary } from "./ui/reservation_summary"; 
import { LogOut, FileText } from "lucide-react"; 
import { useSession, signOut } from "next-auth/react"; // ADDED

export default function Home() {
  const { data: session } = useSession(); // ADDED: Watch for Google Session
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; id?: string; _id?: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  // ADDED: Logic to handle Google Login Success automatically
  useEffect(() => {
    if (session?.user) {
      setCurrentUser({
        name: session.user.name || "",
        email: session.user.email || "",
      });
      setIsLoggedIn(true);
    }
  }, [session]);

  const fetchUserReservations = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/reservation?email=${encodeURIComponent(currentUser.email)}`);
      const contentType = res.headers.get("content-type");
      
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        console.error("Fetch failed or non-JSON response");
        return;
      }

      const data = await res.json();
      const combined = [
        ...(data.owned || []).map((r: any) => ({ ...r, role: 'host' })),
        ...(data.received || []).map((r: any) => ({ ...r, role: 'invitee' }))
      ];
      setReservations(combined);
    } catch (err) {
      console.error("Sync failed:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserReservations();
      const interval = setInterval(fetchUserReservations, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentUser]);

  const handleLogin = (userData: any) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  // ADDED: Combined logout for both Manual and Google accounts
  const handleLogout = () => {
    if (session) {
      signOut(); // Clear Google Session
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const handleCancelReservation = async (id: string) => {
    if (!id) {
      console.error("No ID provided for cancellation");
      return;
    }

    if (!confirm("Cancel this booking?")) return;
    
    try {
        const res = await fetch(`/api/reservation?id=${id}`, { 
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
          setReservations(prev =>
  prev.map(r =>
    (r._id || r.id) === id
      ? { ...r, status: "cancelled", cancelledAt: new Date().toISOString() }
      : r
  )
);
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error("Server error:", errorData.message || res.statusText);
          alert("Could not cancel: " + (errorData.message || "Server Error"));
        }
    } catch (e) {
        console.error("Network error during delete:", e);
    }
  };

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  if (showSummary) {
    return (
      <ReservationSummary 
        user={currentUser!} 
        reservations={reservations} 
        onBack={() => setShowSummary(false)} 
        onCancelReservation={handleCancelReservation}
        refreshData={fetchUserReservations}
      />
    );
  }

  if (!activeCategory) {
    return (
      <main className="min-h-screen bg-[#f1f5f9] py-12 px-6">
        <div className="max-w-6xl mx-auto flex justify-end gap-4 mb-6">
           <button 
             onClick={() => setShowSummary(true)}
             className="bg-[#0070f3] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-md hover:bg-blue-700 transition-all active:scale-95"
           >
             <FileText size={18} /> My Reservations ({reservations.length})
           </button>
           <button onClick={handleLogout} className="text-red-500 flex items-center gap-1 text-sm font-bold hover:text-red-700 transition-colors">
             <LogOut size={18} /> Logout
           </button>
        </div>

        <header className="max-w-6xl mx-auto mb-12 bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KMITL Facility Reservation System</h1>
          <p className="text-gray-500 font-medium">King Mongkut's Institute of Technology Ladkrabang</p>
          <div className="mt-4 inline-block bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
            <p className="text-xs text-gray-400 font-medium">
              Logged in as: <span className="text-blue-600 font-semibold">{currentUser?.email}</span>
            </p>
          </div>
        </header>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <CategoryCard title="Exercise" desc="Fitness Center & Swimming Pool" icon="🏋️‍♂️" bgColor="bg-[#0070f3]" onClick={() => setActiveCategory('exercise')} />
          <CategoryCard title="Sports" desc="Football, Volleyball, Badminton" icon="🏆" bgColor="bg-[#22c55e]" onClick={() => setActiveCategory('sports')} />
          <CategoryCard title="Co-Working" desc="Canteen Table Booking" icon="👥" bgColor="bg-[#f97316]" onClick={() => setActiveCategory('membership')} />
        </div>

        <div className="max-w-6xl mx-auto bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100">
          <h2 className="text-center text-lg font-bold text-gray-900 mb-12 uppercase tracking-wide">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Step num="1" color="bg-blue-50 text-blue-500" title="Select Category" desc="Choose from Exercise, Sports, Co-Working" />
            <Step num="2" color="bg-green-50 text-green-500" title="Choose Facility" desc="Select the specific facility you want to reserve" />
            <Step num="3" color="bg-purple-50 text-purple-500" title="Fill Details" desc="Enter date, time, and other required information" />
            <Step num="4" color="bg-orange-50 text-orange-500" title="Confirm" desc="Review and confirm your reservation" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="p-4 bg-white border-b flex justify-between items-center px-8 shadow-sm">
        <button onClick={() => setActiveCategory(null)} className="text-[#0070f3] font-bold flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
          ← Back to Categories
        </button>
        <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">Facility Reservation</h1>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowSummary(true)}
            className="bg-[#0070f3] text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold shadow-md"
          >
            <FileText size={18} /> My Reservations ({reservations.length})
          </button>
          <button onClick={handleLogout} className="text-red-500 font-bold text-sm flex items-center gap-1 hover:text-red-700">
            <LogOut size={16}/> Logout
          </button>
        </div>
      </nav>

      <div className="p-8">
        {activeCategory === 'sports' && <SportsCategory user={currentUser!} onAddReservation={fetchUserReservations} onBack={() => setActiveCategory(null)} />}
        {activeCategory === 'membership' && <MembershipCategory user={currentUser!} onAddReservation={fetchUserReservations} onBack={() => setActiveCategory(null)} />}
        {activeCategory === 'exercise' && <ExerciseCategory user={currentUser!} onAddReservation={fetchUserReservations} onBack={() => setActiveCategory(null)} />}
      </div>
    </main>
  );
}

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