'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      try {
        await api.post("/auth/send-otp", { email });
        setOtpSent(true);
        setErrorMsg('');
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { detail?: string | any[] } } };
        const detail = axiosErr.response?.data?.detail;
        const apiError = Array.isArray(detail) ? detail[0]?.msg : detail;
        setErrorMsg(typeof apiError === 'string' ? apiError : "Failed to send OTP. Try again.");
      }
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      try {
        const response = await api.post("/auth/verify-otp", { email, otp });
        const { access_token, user } = response.data;
        
        localStorage.setItem("tech_token", access_token);
        localStorage.setItem("tech_user", JSON.stringify(user));
        
        useAuthStore.getState().login(user, email);
        
        router.push('/dashboard');
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { detail?: string | any[] } } };
        const detail = axiosErr.response?.data?.detail;
        const apiError = Array.isArray(detail) ? detail[0]?.msg : detail;
        setErrorMsg(typeof apiError === 'string' ? apiError : "Invalid OTP. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB] items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00A86B]/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 transition-all">
        <div className="text-center mb-10 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-32 h-32 md:w-40 md:h-40 mb-8 bg-white rounded-[2.5rem] shadow-2xl shadow-[#00A86B]/10 flex items-center justify-center border border-gray-50 group hover:rotate-3 transition-transform"
          >
            <Image 
              src="/MeddyNetlogo.png" 
              alt="MeddyNet Logo" 
              width={100}
              height={100}
              sizes="(max-width: 768px) 100px, 120px"
              className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
              priority
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter leading-none mb-3">Meddy <span className="text-[#00A86B]">Dispatch</span></h1>
            <div className="inline-block px-4 py-1.5 bg-gray-900 rounded-full">
              <p className="text-[10px] md:text-xs text-white font-black uppercase tracking-[0.3em]">Technician Ground Control</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-2xl shadow-black/5 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white group transition-all hover:shadow-black/7">
            <CardHeader className="pb-4 pt-10 px-8 md:px-10 text-center md:text-left">
              <CardTitle className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">Welcome back</CardTitle>
              <CardDescription className="text-gray-500 font-bold text-sm md:text-base mt-2 leading-relaxed">
                Connect to fleet ops to access your assignments and duty terminal.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 md:px-10 pb-12">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-gray-400 font-black text-[10px] uppercase tracking-[0.25em] ml-1">Fleet ID (Email)</Label>
                    <div className="relative group/field">
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="tech@example.com" 
                        className="h-16 bg-gray-50/50 border-gray-100 hover:border-gray-200 focus:bg-white focus:border-[#008a58] focus:ring-4 focus:ring-[#00A86B]/10 rounded-[1.25rem] font-bold text-lg transition-all appearance-none outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-16 bg-[#00A86B] hover:bg-[#008a58] text-white rounded-[1.25rem] font-black text-lg shadow-xl shadow-[#00A86B]/25 transition-all active:scale-[0.97] hover:-translate-y-1 active:shadow-lg group"
                    disabled={!email.includes('@')}
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform inline-block">Receive Access Code</span>
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                  <div className="space-y-3">
                    <Label htmlFor="otp" className="text-gray-400 font-black text-[10px] uppercase tracking-[0.25em] ml-1">Terminal Verification OTP</Label>
                    <Input 
                      id="otp" 
                      type="text" 
                      placeholder="• • • • • •" 
                      className="h-16 text-center tracking-[0.6em] text-2xl font-black bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[#00A86B] focus:ring-4 focus:ring-[#00A86B]/10 rounded-[1.25rem] transition-all outline-none"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      autoFocus
                    />
                    <div className="flex justify-between items-center px-1 mt-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status: Pending Verification</p>
                      <button type="button" className="text-[10px] font-black text-[#00A86B] hover:text-[#008a58] uppercase tracking-widest underline decoration-2 underline-offset-4" onClick={() => setOtpSent(false)}>Edit Terminal ID</button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-16 bg-gray-900 hover:bg-black text-white rounded-[1.25rem] font-black text-lg shadow-xl shadow-black/20 transition-all active:scale-[0.97] hover:-translate-y-1 active:shadow-lg group flex items-center justify-center gap-3"
                    disabled={otp.length !== 6}
                  >
                    <span>Authorize Login</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 group-hover:animate-ping"></div>
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.6 }}
          className="text-center mt-10 text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]"
        >
          Secure Tactical Access &copy; Meddy Fleet Systems
        </motion.p>
      </div>
    </div>
  );
}
