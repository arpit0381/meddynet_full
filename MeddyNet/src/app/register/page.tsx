"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, CheckCircle, ArrowRight } from "lucide-react";
import { haptics } from "@/lib/haptics";
import apiClient from "@/lib/api";
import Cookies from "js-cookie";
import { useUser } from "@/context/UserContext";
import { useSearchParams } from "next/navigation";
import { UserProfile } from "@/data/user";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    dob: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.light();
    setIsLoading(true);
    setError("");

    try {
      if (formData.phone_number.length !== 10) {
        throw new Error("Phone number must be 10 digits");
      }
      
      const res = await apiClient.post("/auth/register", formData);
      const { access_token, refresh_token, user } = res.data;
      
      haptics.success();
      
      Cookies.set("meddynet_access_token", access_token, { secure: true, sameSite: "strict", path: "/" });
      Cookies.set("meddynet_refresh_token", refresh_token, { secure: true, sameSite: "strict", path: "/" });
      
      // Update context with backend user
      if (user) {
        setUser({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.name.slice(0, 2).toUpperCase(),
          age: user.dob ? (new Date().getFullYear() - new Date(user.dob).getFullYear()) : 0,
          gender: "Male", // Default or extract if available
          bloodGroup: user.blood_group || "N/A",
          memberSince: new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          wallet_balance: 0
        });
      }
      
      router.push(redirect);
    } catch (err: unknown) {
      if (typeof haptics.light === 'function') haptics.light();
      const axiosErr = err as { response?: { data?: { detail?: string } }, message?: string };
      setError(axiosErr.response?.data?.detail || axiosErr.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Back Button */}
      <Link 
        href="/" 
        onClick={() => haptics.light()}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium z-50 group"
      >
        <div className="w-11 h-11 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="hidden sm:block">Back to Home</span>
      </Link>

      <div className="w-full max-w-[1100px] px-2 sm:px-0">
        {/* Main Card */}
        <div className="w-full flex flex-col lg:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[500px] lg:min-h-[600px] mt-16 mb-8 sm:mt-24 sm:mb-12">
          
          {/* Left Side */}
          <div className="relative hidden lg:flex flex-col justify-between w-[45%] bg-linear-to-b from-accent to-primary-dark p-12 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white opacity-10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="relative h-14 sm:h-16 lg:h-20 w-48 sm:w-56 lg:w-64">
                  <Image
                    src="/MeddyNetlogo.png"
                    alt="MeddyNet"
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </div>
              
              <div className="mb-16 max-w-[400px]">
                <h1 className="text-[32px] font-extrabold text-white leading-[1.15] tracking-tight">
                  Join India&apos;s Largest Diagnostics Network.
                </h1>
                <p className="text-[20px] font-medium text-white/90 leading-[1.3] mt-3 tracking-wide">
                  Your journey to better health starts here.
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  "Find & compare 500+ labs",
                  "Book home sample collection",
                  "Get digital reports on WhatsApp",
                  "Store history securely"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white/80 shrink-0" />
                    <span className="text-sm font-medium text-white/90">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative z-10 text-xs text-white/70 font-medium pt-8">
              Fast. Reliable. Accurate. Trusted by Millions.
            </div>
          </div>

          {/* Right Side */}
          <div className="w-full lg:w-[55%] p-6 sm:p-12 lg:p-16 flex flex-col justify-center">
            <div className="max-w-[420px] mx-auto w-full">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-10 flex justify-center">
                <div className="relative h-10 sm:h-12 w-40 sm:w-48 mx-auto">
                  <Image
                    src="/MeddyNetlogo.png"
                    alt="MeddyNet"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-2">Create Account</h2>
                <p className="text-sm sm:text-[15px] text-slate-600">Join our healthcare community.</p>
              </div>

              {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

              <form className="space-y-4" onSubmit={handleRegister}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                    <div className="flex items-center bg-slate-100 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all border border-transparent focus-within:border-primary">
                      <User className="w-5 h-5 text-slate-400 mr-3" />
                      <input type="text" name="full_name" placeholder="John Doe" value={formData.full_name} onChange={handleChange} className="flex-1 bg-transparent outline-none text-base text-dark placeholder:text-slate-400" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Phone Number</label>
                    <div className="flex items-center bg-slate-100 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all border border-transparent focus-within:border-primary">
                      <span className="text-slate-500 font-bold mr-2 text-[15px]">+91</span>
                      <input type="tel" name="phone_number" placeholder="00000 00000" maxLength={10} value={formData.phone_number} onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, ''); handleChange(e); }} className="flex-1 bg-transparent outline-none text-base text-dark placeholder:text-slate-400" required />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date of Birth</label>
                  <div className="flex items-center bg-slate-100 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all border border-transparent focus-within:border-primary">
                    <input
                      type="date"
                      name="dob"
                      min="1900-01-01"
                      max={new Date().toISOString().split('T')[0]}
                      value={formData.dob}
                      onChange={handleChange}
                      className="flex-1 bg-transparent outline-none text-base text-dark"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email Address</label>
                  <div className="flex items-center bg-slate-100 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all border border-transparent focus-within:border-primary">
                    <Mail className="w-5 h-5 text-slate-400 mr-3" />
                    <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={(e) => { e.target.value = e.target.value.replace(/\s/g, '').toLowerCase(); handleChange(e); }} className="flex-1 bg-transparent outline-none text-base text-dark placeholder:text-slate-400" required />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Set Password</label>
                  <div className="flex items-center bg-slate-100 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all border border-transparent focus-within:border-primary">
                    <Lock className="w-5 h-5 text-slate-400 mr-3" />
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" minLength={8} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" title="Must contain at least one number, one uppercase letter, and at least 8 characters" value={formData.password} onChange={(e) => { e.target.value = e.target.value.replace(/\s/g, ''); handleChange(e); }} className="flex-1 bg-transparent outline-none text-base text-dark placeholder:text-slate-400" required />
                    <button type="button" onClick={() => { haptics.light(); setShowPassword(!showPassword); }} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-primary ml-1">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-2">
                  <input type="checkbox" id="terms" className="mt-1.5 w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" required suppressHydrationWarning />
                  <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed">
                    I agree to the <Link href="#" className="text-primary font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary font-bold hover:underline">Privacy Policy</Link>.
                  </label>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={isLoading} className="w-full min-h-[48px] bg-linear-to-r from-primary to-primary-dark text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-px active:scale-[0.97] transition-all flex items-center justify-center gap-2 group disabled:opacity-70">
                    {isLoading ? "Creating Account..." : "Create Account"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link href="/login" onClick={() => haptics.light()} className="text-primary font-bold hover:underline ml-1">
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
