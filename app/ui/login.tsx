"use client";

import { useState } from "react";
import { 
  GraduationCap, Mail, Lock, User, Chrome, 
  ShieldCheck, CheckCircle2, XCircle, Eye, EyeOff, ArrowLeft 
} from "lucide-react";
import { signIn } from "next-auth/react";

interface LoginProps {
  onLogin: (user: { name: string; email: string }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Added for toggle
  const [showPassword, setShowPassword] = useState(false); // Controls both boxes
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
  });

  const getStrength = (pw: string) => {
    if (!pw) return { label: "", color: "bg-gray-200", width: "0%" };
    if (pw.length < 6) return { label: "Weak", color: "bg-red-500", width: "30%" };
    if (pw.length < 10) return { label: "Medium", color: "bg-yellow-500", width: "60%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };

  const strength = getStrength(formData.password);
  const passwordsMatch = formData.confirmPassword !== "" && formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const endpoint = isSignUp ? "/api/register" : "/api/login";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Something went wrong");
        return;
      }
      alert(data.message);
      onLogin(data.user);
    } catch (error) {
      console.error(error);
      alert("Connection failed!");
    }
  };

  // Added handler for your forgot-password API
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      alert(data.message);
      if (response.ok) setIsForgotPassword(false);
    } catch (error) {
      alert("Error sending request");
    }
  };

  // NEW VIEW: Forgot Password Form
  if (isForgotPassword) {
    return (
      <div className="min-h-screen w-full bg-[#FF9900] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <button 
            onClick={() => setIsForgotPassword(false)}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Sign In
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your email and we'll generate a reset link in the terminal.</p>
          
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:border-blue-500 text-sm" 
                  placeholder="Email" 
                />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md">
              Send Reset Request
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FF9900] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <GraduationCap className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">KMITL</h1>
          <p className="text-blue-50/90 font-medium text-lg">Facility Reservation System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:border-blue-500 text-sm" placeholder="Full name" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:border-blue-500 text-sm text-gray-700" placeholder="Email" />
              </div>
            </div>

            {/* Password Box */}
            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                {!isSignUp && (
                  <button 
                    type="button" 
                    onClick={() => setIsForgotPassword(true)} 
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  className="w-full pl-10 pr-10 py-2.5 border rounded-lg outline-none focus:border-blue-500 text-sm text-gray-700" 
                  placeholder="Password" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {isSignUp && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: strength.width }}></div>
                  </div>
                  <p className="text-[10px] mt-1 text-gray-400 uppercase font-bold">Strength: {strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password Box (Identical Design) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={formData.confirmPassword} 
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
                    className={`w-full pl-10 pr-12 py-2.5 border rounded-lg outline-none transition-all text-sm ${formData.confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'}`} 
                    placeholder="Repeat password" 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {/* Identical Eye Toggle for Confirm Box */}
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {formData.confirmPassword && (
                      passwordsMatch ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />
                    )}
                  </div>
                </div>
                
                {/* Strength Meter in Confirm Field */}
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: strength.width }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Strength: {strength.label}</p>
                    {formData.confirmPassword && !passwordsMatch && (
                       <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Mismatch</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors mt-2 shadow-md">
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>

            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-700 text-xs uppercase font-medium">Or</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button type="button" onClick={() => signIn("google")} className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <Chrome className="w-5 h-5 text-red-500" /> 
              {isSignUp ? "Sign up with Google" : "Sign in with Google"}
            </button>
            
            {/* Added Note for Google Users */}
            {isSignUp && (
              <p className="mt-4 text-[11px] text-gray-400 text-center leading-relaxed">
                Using Google? You can later set a manual password via 
                <button 
                  type="button" 
                  onClick={() => setIsForgotPassword(true)} 
                  className="text-blue-500 hover:underline ml-1 font-semibold"
                >
                  Forgot Password
                </button> to log in without Google.
              </p>
            )}
          </form>

          <div className="mt-6 text-center">
            <button className="text-blue-600 font-bold hover:underline" onClick={() => {
              setIsSignUp(!isSignUp);
              setFormData({ name: "", email: "", password: "", confirmPassword: "", studentId: "" });
            }}>
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}