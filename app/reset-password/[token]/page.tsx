"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reusing your strength logic
  const getStrength = (pw: string) => {
    if (!pw) return { label: "", color: "bg-gray-200", width: "0%" };
    if (pw.length < 6) return { label: "Weak", color: "bg-red-500", width: "30%" };
    if (pw.length < 10) return { label: "Medium", color: "bg-yellow-500", width: "60%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };

  const strength = getStrength(password);
  const passwordsMatch = confirmPassword !== "" && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) router.push("/");
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FF9900] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Reset Your Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-10 pr-10 py-2.5 border rounded-lg outline-none focus:border-blue-500 text-sm" 
                placeholder="New Password" 
              />
            </div>
            {/* Password Strength Bar */}
            <div className="mt-2">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: strength.width }}></div>
              </div>
              <p className="text-[10px] mt-1 text-gray-400 uppercase font-bold">Strength: {strength.label}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg outline-none text-sm transition-all ${confirmPassword && !passwordsMatch ? 'border-red-500' : 'focus:border-blue-500'}`} 
                placeholder="Confirm Password" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md disabled:bg-blue-300 mt-2">
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}