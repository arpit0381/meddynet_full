"use client";

import { validateEmail, isValidEmail, isEmailRegistered } from "@/utils/validation";
import { Loader2 } from "lucide-react";

import { motion } from "framer-motion";
import { Building2, ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/Toast";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

export default function LabLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
   const [emailRegistered, setEmailRegistered] = useState<boolean | null>(null);
  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEmailChange = (val: string) => {
    const sanitizedEmail = validateEmail(val);
    setEmail(sanitizedEmail);
    setEmailRegistered(null); // Reset during typing

    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current);
    }
    
     if (isValidEmail(sanitizedEmail)) {
      setIsVerifyingEmail(true);
      verificationTimeoutRef.current = setTimeout(async () => {
        const isRegistered = await isEmailRegistered(sanitizedEmail);
        setIsVerifyingEmail(false);
        setEmailRegistered(isRegistered);
      }, 600);
    }
  };

  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post("/auth/login", {
        email,
        password
      });

      const { access_token, user } = response.data;
      
      // Store token and user info via global store (fixes flicker/redirect loop)
      setAuth(user, access_token);
      
      setToast({ message: "Login Successful! Redirecting...", type: "success" });
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { detail?: string } } };
      const errorMsg = axiosErr.response?.data?.detail || "Invalid credentials or server error";
      setToast({ message: errorMsg, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh sm:min-h-screen bg-surface flex flex-col items-center justify-center p-0 sm:p-4">
      {/* Header */}
      <div className="w-full max-w-5xl flex items-center justify-between p-6 sm:p-0 sm:mb-12 sm:px-4 bg-surface">
        <Link href="/" className="flex items-center gap-4 group">
           <div className="w-14 h-14 relative">
             <Image src="/icon.png" alt="MeddyNet" width={56} height={56} className="w-full h-full object-contain" />
           </div>
           <span className="text-3xl font-black text-dark-light tracking-tight">Meddy<span className="text-primary">Net</span></span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-black text-text-muted uppercase tracking-widest">
           <span className="hidden sm:inline">New to MeddyNet?</span>
           <Link href="/register" className="text-primary hover:underline">Register Lab</Link>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-white rounded-[3.5rem] shadow-2xl shadow-black/5 sm:border border-border-dark/20 overflow-hidden flex flex-col lg:flex-row flex-1 sm:flex-initial min-h-0 sm:min-h-[650px] m-4 sm:m-0 animate-in fade-in zoom-in-95 duration-1000">
        {/* Visual Sidebar */}
        <div className="lg:w-2/5 bg-dark p-12 text-white relative hidden lg:flex flex-col justify-between">
          <div className="absolute inset-0 bg-linear-to-b from-primary/20 to-transparent opacity-50" />
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tight mb-6 leading-tight">Welcome back to MeddyNet Dashboard.</h2>
            <p className="text-white/60 font-bold leading-relaxed text-sm mb-12">Manage your lab operations, appointments, inventory, and reports all in one secure platform.</p>
            
            <div className="space-y-6">
              {[
                { icon: Building2, title: "Manage Multiple Centers", desc: "Easily switch between your lab branches and view real-time operations." },
                { icon: ShieldCheck, title: "Secure & Compliant", desc: "HIPAA compliant data processing keeping patient data safe and sound." }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-white mb-1.5">{item.title}</h4>
                    <p className="text-xs font-bold text-white/50 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 p-10 sm:p-16 relative flex flex-col justify-center bg-white">
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md mx-auto"
          >
            <div className="mb-10 text-center sm:text-left">
              <h3 className="text-3xl font-black text-dark-light tracking-tight mb-3">Sign In</h3>
              <p className="text-text-muted font-bold text-sm">Enter your lab portal credentials to continue.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-1 group-focus-within:text-primary transition-colors">Email Address / Lab ID</label>
                 <div className="relative">
                   <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${email && emailRegistered === false ? 'text-red-500' : 'text-text-muted group-focus-within:text-primary'}`} />
                  <input 
                    type="text" 
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="lab@example.com" 
                    className={`w-full bg-surface border-2 rounded-2xl pl-14 pr-12 py-4 text-sm font-bold outline-none transition-all shadow-sm ${email && emailRegistered === false ? 'border-red-500/50 focus:border-red-500' : 'border-border-dark focus:border-primary focus:bg-white'}`} 
                    required 
                  />
                  {isVerifyingEmail && (
                    <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                  )}
                </div>
                {email && !isValidEmail(email) && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-2 px-2">Invalid email format</p>}
                 {email && isValidEmail(email) && emailRegistered === false && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-2 px-2">This account does not exist</p>}
              </div>

              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1 group-focus-within:text-primary transition-colors">Password</label>
                  <Link href="/forgot-password" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-surface border-2 border-border-dark rounded-2xl pl-14 pr-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                    required 
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button 
                  type="submit"
                  disabled={!email || !password || isLoading}
                  className={`w-full flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-sm font-black shadow-xl transition-all ${
                    email && password && !isLoading
                      ? 'bg-dark text-white shadow-dark/20 hover:-translate-y-1 hover:bg-dark-light cursor-pointer' 
                      : 'bg-border-dark text-text-muted cursor-not-allowed opacity-70'
                  }`}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="mt-8 text-center sm:hidden">
              <p className="text-xs font-bold text-text-muted block">
                New to MeddyNet? <Link href="/register" className="text-primary hover:underline ml-1">Register Lab</Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
