"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Server, Lock, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminStore } from "@/store/adminStore";

import api from "@/lib/api";
import { toast } from "sonner";

export default function AdminLogin() {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "2fa">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { setAuth } = useAdminStore();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await api.post("/auth/login", { 
        email, 
        password,
        role: "admin"
      });
      
      const { access_token, user } = response.data;
      
      if (user.role !== "admin" && user.role !== "superadmin") {
        throw new Error("Access denied. Admin role required.");
      }

      setAuth(user);
      localStorage.setItem("admin_token", access_token);
      
      toast.success("Login successful!");
      router.push("/admin/overview");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } }, message?: string };
      const msg = axiosErr.response?.data?.detail || axiosErr.message || "Invalid credentials";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock OTP verification
    setTimeout(() => {
      localStorage.setItem("adminSession", "true");
      router.push("/admin/overview");
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-surface font-sans text-main-text transition-colors">
      <div className="hidden lg:flex flex-col w-[40%] bg-dark text-white p-12 justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 font-bold text-2xl tracking-tight mb-16">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-lg">M</span>
            </div>
            <span className="flex items-center">
              MeddyNet
              <span className="text-primary text-[10px] uppercase tracking-widest ml-1 bg-primary/20 px-1 py-0.5 rounded">Admin</span>
            </span>
          </div>
          
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Platform Management & Operations
          </h1>
          <p className="text-white/70 text-lg mb-12">
            Secure, centralized control for the entire MeddyNet healthcare ecosystem.
          </p>

          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white">HIPAA Compliant</h3>
                <p className="text-sm text-white/50">End-to-end encrypted audit logs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-accent shrink-0">
                <Server size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Real-time Sync</h3>
                <p className="text-sm text-white/50">Live updates from partner labs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-green-400 shrink-0">
                <Lock size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Role-based Access</h3>
                <p className="text-sm text-white/50">Strict permission controls</p>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-white/30">
          © {new Date().getFullYear()} MeddyNet Tech. All rights reserved.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 relative overflow-hidden bg-surface">
        <div className="w-full max-w-[400px]">
          <AnimatePresence mode="wait">
            {step === "login" ? (
              <motion.div
                key="login-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-10 text-center lg:text-left transition-colors">
                  <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
                  <p className="text-muted font-medium">Sign in to the administrative portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-main-text/80 mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-input border border-border-dim rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-main-text placeholder:text-muted"
                      placeholder="admin@meddynet.com"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-bold text-main-text/80">Password</label>
                      <button type="button" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                        Forgot password?
                      </button>
                    </div>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-input border border-border-dim rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-main-text placeholder:text-muted"
                      placeholder="••••••••"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                  >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    Sign in to Admin Portal
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="2fa-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button 
                  onClick={() => setStep("login")}
                  className="flex items-center gap-2 text-sm text-muted font-bold hover:text-primary transition-colors mb-8 group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Login
                </button>

                <div className="mb-10 text-center lg:text-left">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 mx-auto lg:mx-0">
                    <KeyRound size={24} />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Two-Factor Auth</h2>
                  <p className="text-muted font-medium">Enter the 6-digit code sent to your device</p>
                </div>

                <form onSubmit={verifyOtp} className="space-y-8">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-border-dim bg-input text-main-text rounded-xl focus:border-primary focus:ring-0 outline-none transition-all"
                      />
                    ))}
                  </div>

                  <div className="space-y-4">
                    <button 
                      type="submit" 
                      disabled={isLoading || otp.some(d => !d)}
                      className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-3.5 rounded-xl font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading && <Loader2 size={18} className="animate-spin" />}
                      Verify & Continue
                    </button>
                    
                    <button 
                      type="button"
                      className="w-full text-center text-sm font-bold text-muted hover:text-primary transition-colors"
                    >
                      Didn&apos;t receive a code? <span className="text-primary hover:underline underline-offset-4 decoration-primary/30">Resend</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
