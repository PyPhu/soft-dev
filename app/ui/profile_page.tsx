"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Camera, 
  Calendar, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  Save, 
  X,
  Loader2 
} from "lucide-react";

/**
 * 1. InfoRow Component 
 */
    
    const InfoRow = ({ icon: Icon, label, name, value, isEditing, formData, setFormData }: any) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
        <Icon size={20} />
        </div>
        <div className="flex-1">
        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{label}</p>
        {isEditing ? (
            name === "gender" ? (
            <select 
                className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            ) : (
            <input 
                type={name === "dob" ? "date" : "text"}
                className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none border-b border-blue-200 focus:border-blue-500 transition-colors"
                // Ensure date input gets YYYY-MM-DD format
                value={name === "dob" && formData[name] 
                ? new Date(formData[name]).toISOString().split('T')[0] 
                : (formData[name] || "")
                }
                onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            />
            )
        ) : (
            <p className="text-sm font-bold text-gray-700">
            {/* Format the date for display mode */}
            {name === "dob" && value 
                ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) 
                : (value || "Not Provided")}
            </p>
        )}
        </div>
    </div>
    );

/**
 * 2. Main ProfilePage Component
 */
export function ProfilePage({ user, reservationCount, onBack, onUpdateUser }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for the form
  const [formData, setFormData] = useState({
    name: user.name || "",
    dob: user.dob || "",
    address: user.address || "",
    phoneNumber: user.phoneNumber || "",
    gender: user.gender || "male",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: user.email, // Required to find the user in DB
          ...formData 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdateUser(data.user); // Notify parent component/Context of the new data
        setIsEditing(false);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Update failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data and close editing
    setFormData({
      name: user.name || "",
      dob: user.dob || "",
      address: user.address || "",
      phoneNumber: user.phoneNumber || "",
      gender: user.gender || "male",
    });
    setIsEditing(false);
  };

  return (
    <main className="min-h-screen bg-[#f1f5f9] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-bold text-sm uppercase tracking-wide"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Theme */}
          <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-400" />
          
          <div className="px-8 pb-10">
            {/* Avatar Section */}
            <div className="relative -mt-12 mb-6 flex justify-center">
              <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-3xl border-4 border-white bg-white overflow-hidden shadow-xl">
                  <img 
                    src={user.image || "/default_profile.png"} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                   <Camera className="text-white" size={24} />
                </div>
              </div>
            </div>

            {/* Name & Email */}
            <div className="text-center mb-8">
              {isEditing ? (
                <input 
                  className="text-2xl font-extrabold text-gray-900 text-center border-b-2 border-blue-100 focus:border-blue-500 outline-none bg-transparent px-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter Name"
                />
              ) : (
                <h2 className="text-2xl font-extrabold text-gray-900">{user.name}</h2>
              )}
              <p className="text-gray-400 font-medium mt-1">{user.email}</p>
            </div>

            {/* Statistics */}
            <div className="flex justify-center mb-8">
              <div className="bg-blue-50 px-8 py-4 rounded-2xl border border-blue-100 text-center">
                <p className="text-[10px] uppercase font-black text-blue-400 mb-1 tracking-widest">Total Bookings</p>
                <p className="text-3xl font-black text-[#0070f3]">{reservationCount}</p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <InfoRow 
                icon={Calendar} label="Date of Birth" name="dob" value={user.dob} 
                isEditing={isEditing} formData={formData} setFormData={setFormData} 
              />
              <InfoRow 
                icon={UserIcon} label="Gender" name="gender" value={user.gender} 
                isEditing={isEditing} formData={formData} setFormData={setFormData} 
              />
              <InfoRow 
                icon={Phone} label="Phone Number" name="phoneNumber" value={user.phoneNumber} 
                isEditing={isEditing} formData={formData} setFormData={setFormData} 
              />
              <InfoRow 
                icon={MapPin} label="Address" name="address" value={user.address} 
                isEditing={isEditing} formData={formData} setFormData={setFormData} 
              />
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:bg-green-700 transition-all disabled:opacity-70"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button 
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full py-4 bg-[#0070f3] text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  Update Profile Info
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}