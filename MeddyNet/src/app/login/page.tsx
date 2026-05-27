"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, KeyRound, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { haptics } from "@/lib/haptics";
import apiClient from "@/lib/api";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const { setUser } = useUser();
  
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [step, setStep] = useState<"phone" | "otp" | "2fa">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [twoFATempToken, setTwoFATempToken] = useState("");
  const [twoFALoginOtp, setTwoFALoginOtp] = useState("");
  const [twoFADevOtp, setTwoFADevOtp] = useState("");
  const [twoFAPhoneHint, setTwoFAPhoneHint] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.light();
    setErrorMsg("");
    setLoading(true);

    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      
      // 2FA Challenge
      if (data.requires_2fa) {
        setTwoFATempToken(data.temp_token);
        setTwoFAPhoneHint(data.phone_hint || "");
        setTwoFADevOtp(data.dev_otp || "");
        setTwoFALoginOtp(data.dev_otp || ""); // pre-fill for dev
        setStep("2fa");
        haptics.light();
        return;
      }

      const { access_token, refresh_token, user } = data;
      _completeLogin(access_token, refresh_token, user);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setErrorMsg(axiosErr.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFALoginVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.light();
    setErrorMsg("");
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/2fa/login-verify", {
        temp_token: twoFATempToken,
        otp: twoFALoginOtp,
      });
      const { access_token, refresh_token, user } = data;
      _completeLogin(access_token, refresh_token, user);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setErrorMsg(axiosErr.response?.data?.detail || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const _completeLogin = (access_token: string, refresh_token: string, user: Record<string, string | null>) => {
    Cookies.set("meddynet_access_token", access_token, { secure: true, sameSite: 'strict', path: '/' });
    Cookies.set("meddynet_refresh_token", refresh_token, { secure: true, sameSite: 'strict', path: '/' });
    if (user) {
      setUser({
        id: user.id || "", name: user.name || "User", email: user.email || "", phone: user.phone || "",
        avatar: (user.name || "UN").slice(0, 2).toUpperCase(),
        age: user.dob ? (new Date().getFullYear() - new Date(user.dob).getFullYear()) : 0,
        gender: "Male", bloodGroup: "N/A",
        memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Jan 2024",
        wallet_balance: 0
      });
    }
    haptics.success();
    setAuth({
      id: user.id || "", name: user.name || "User", email: user.email || "", phone: user.phone || "",
      role: (user.role === 'technician' ? 'tech' : user.role as 'user' | 'lab_admin' | 'lab_staff' | 'tech' | 'superadmin') || 'user'
    }, access_token);
    router.push(redirect);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.light();
    setErrorMsg("");
    
    if (phone.length < 10) {
      setErrorMsg("Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      // Add country code if missing
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      await apiClient.post("/auth/send-otp", { phone: formattedPhone });
      setStep("otp");
      haptics.success();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setErrorMsg(axiosErr.response?.data?.detail || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    haptics.light();
    setErrorMsg("");
    setLoading(true);
    
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const { data } = await apiClient.post("/auth/verify-otp", { 
        phone: formattedPhone, 
        otp 
      });
      
      const { access_token, refresh_token, user } = data;

      // Store session
      Cookies.set("meddynet_access_token", access_token, { secure: true, sameSite: 'strict', path: '/' });
      Cookies.set("meddynet_refresh_token", refresh_token, { secure: true, sameSite: 'strict', path: '/' });
      
      // Update context
      if (user) {
        setUser({
          id: user.id || "",
          name: user.name || "User",
          email: user.email || "",
          phone: user.phone || "",
          avatar: (user.name || "UN").slice(0, 2).toUpperCase(),
          age: user.dob ? (new Date().getFullYear() - new Date(user.dob).getFullYear()) : 0,
          gender: "Male",
          bloodGroup: "N/A",
          memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Jan 2024",
          wallet_balance: 0
        });
      }

      haptics.success();
      setAuth({
        id: user.id || "",
        name: user.name || "User",
        email: user.email || "",
        phone: user.phone || "",
        role: (user.role === 'technician' ? 'tech' : user.role as 'user' | 'lab_admin' | 'lab_staff' | 'tech' | 'superadmin') || 'user'
      }, access_token);

      router.push(redirect);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setErrorMsg(axiosErr.response?.data?.detail || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
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
        <span className="hidden sm:block">{t("login.backHome")}</span>
      </Link>

      <div className="w-full max-w-[1100px] px-2 sm:px-0">
        <div className="w-full flex flex-col lg:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[500px] lg:min-h-[600px] mt-16 mb-8 sm:mt-24 sm:mb-12">
          
          {/* Left Side */}
          <div className="relative hidden lg:flex flex-col justify-between w-[45%] bg-linear-to-b from-primary via-primary-dark to-accent p-12 overflow-hidden">
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
                  {t("login.title")}
                </h1>
                <p className="text-[20px] font-medium text-white/90 leading-[1.3] mt-3 tracking-wide">
                  {t("login.subtitle")}
                </p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4 max-w-[350px]">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t("login.hipaaTitle")}</p>
                  <p className="text-[11px] text-white/70">{t("login.hipaaDesc")}</p>
                </div>
              </div>
            </div>
            
            <div className="relative z-10 text-xs text-white/70 font-medium pt-8">
              {t("login.trust")}
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
                <div className="flex items-center gap-4 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
                    <button 
                        onClick={() => setLoginMethod("phone")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${loginMethod === 'phone' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Phone OTP
                    </button>
                    <button 
                        onClick={() => setLoginMethod("email")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${loginMethod === 'email' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Email & Password
                    </button>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-2">
                  {loginMethod === 'email' ? 'Welcome Back' : (step === "phone" ? t("login.login") : "Verify OTP")}
                </h2>
                <p className="text-sm sm:text-[15px] text-slate-600">
                  {loginMethod === 'email' ? 'Login with your registered email and password.' : (step === "phone" ? "Enter your phone number to receive a one-time password." : `Enter the OTP sent to ${phone}`)}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 text-[13px] font-medium rounded-lg border border-red-100 flex items-center">
                   {errorMsg}
                </div>
              )}

              {loginMethod === 'email' ? (
                step === '2fa' ? (
                  // 2FA Verification Step
                  <form className="space-y-5" onSubmit={handleTwoFALoginVerify}>
                    <div className="text-center mb-2">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm text-slate-600">Enter the OTP sent to your phone ending in <strong>••••{twoFAPhoneHint}</strong></p>
                    </div>
                    {/* DEV MODE box */}
                    {twoFADevOtp && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">🛠 Dev Mode OTP</p>
                        <p className="text-2xl font-black tracking-[0.3em] text-blue-700">{twoFADevOtp}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 mb-1.5 block">Enter 6-digit OTP</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={twoFALoginOtp}
                        onChange={(e) => setTwoFALoginOtp(e.target.value.replace(/\D/g, ''))}
                        autoFocus
                        placeholder="• • • • • •"
                        className="w-full bg-slate-100 rounded-xl px-4 h-14 text-2xl font-black tracking-[0.4em] text-center outline-none focus:ring-2 focus:ring-primary border-2 border-transparent focus:border-primary focus:bg-white transition-all"
                        required
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading || twoFALoginOtp.length < 4}
                        className="w-full min-h-[48px] rounded-xl bg-linear-to-r flex justify-center items-center from-primary to-primary-light text-white font-semibold text-[15px] transition-all shadow-lg shadow-primary/25 hover:shadow-xl disabled:opacity-70 disabled:pointer-events-none"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setStep('phone'); setEmail(''); setPassword(''); setLoginMethod('email'); }}
                      className="w-full text-center text-xs text-slate-500 hover:text-primary transition-colors font-medium"
                    >
                      ← Back to Login
                    </button>
                  </form>
                ) : (
                 <form className="space-y-5" onSubmit={handleEmailLogin}>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 mb-1.5 block">Email Address</label>
                      <div className="flex items-center bg-slate-100 rounded-lg px-4 h-12 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all border border-transparent focus-within:border-primary">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. name@example.com"
                          className="flex-1 bg-transparent outline-none text-base text-dark placeholder:text-slate-400"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 mb-1.5 block">Password</label>
                      <div className="flex items-center bg-slate-100 rounded-lg px-4 h-12 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all border border-transparent focus-within:border-primary">
                        <KeyRound className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="flex-1 bg-transparent outline-none text-base text-dark placeholder:text-slate-400"
                          required
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full min-h-[48px] rounded-xl bg-linear-to-r flex justify-center items-center from-primary to-primary-light text-white font-semibold text-[15px] transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:scale-[0.97] duration-200 disabled:opacity-70 disabled:pointer-events-none"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                      </button>
                    </div>
                 </form>
                )

              ) : (
                step === "phone" ? (
                  <form className="space-y-5" onSubmit={handleSendOtp}>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 mb-1.5 block">Phone Number</label>
                      <div className="flex items-center bg-slate-100 rounded-lg px-4 h-12 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all border border-transparent focus-within:border-primary">
                        <Phone className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="flex-1 bg-transparent outline-none text-base text-dark placeholder:text-slate-400"
                          suppressHydrationWarning
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full min-h-[48px] rounded-xl bg-linear-to-r flex justify-center items-center from-primary to-primary-light text-white font-semibold text-[15px] transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:scale-[0.97] duration-200 disabled:opacity-70 disabled:pointer-events-none"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form className="space-y-5" onSubmit={handleVerifyOtp}>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 mb-1.5 block">Enter OTP</label>
                      <div className="flex items-center bg-slate-100 rounded-lg px-4 h-12 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all border border-transparent focus-within:border-primary">
                        <KeyRound className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="6-digit code"
                          className="flex-1 bg-transparent outline-none text-base tracking-widest text-dark placeholder:text-slate-400 placeholder:tracking-normal"
                          suppressHydrationWarning
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading || otp.length < 6}
                        className="w-full min-h-[48px] flex justify-center items-center rounded-xl bg-linear-to-r from-primary to-primary-light text-white font-semibold text-[15px] transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 active:scale-[0.97] duration-200 disabled:opacity-70 disabled:pointer-events-none"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                      </button>
                    </div>
                    
                    <div className="text-center mt-4">
                      <button 
                        type="button" 
                        onClick={() => setStep("phone")}
                        className="text-[13px] text-primary font-semibold hover:underline"
                      >
                        Change Phone Number
                      </button>
                    </div>
                  </form>
                )
              )}

              <div className="text-center mt-8">
                <p className="text-[13px] text-slate-500">
                  {t("login.noAccount")}{" "}
                  <Link href="/register" onClick={() => haptics.light()} className="text-primary font-bold hover:underline ml-1">{t("login.registerBtn")}</Link>
                </p>
              </div>

              <div className="mt-12 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <Link href="/privacy" className="text-[11px] font-medium text-slate-400 hover:text-primary transition-colors py-2">{t("login.privacyPolicy")}</Link>
                <Link href="/terms" className="text-[11px] font-medium text-slate-400 hover:text-primary transition-colors py-2">{t("login.termsService")}</Link>
                <Link href="/help-center" className="text-[11px] font-medium text-slate-400 hover:text-primary transition-colors py-2">{t("login.support")}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
