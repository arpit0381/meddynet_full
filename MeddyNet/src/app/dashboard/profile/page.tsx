"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Bell, 
  LogOut, 
  Camera,
  CheckCircle,
  Plus,
  Trash2,
  Edit3,
  X,
  Zap,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Lock,
  Smartphone,
  CreditCard,
  Cloud,
  Headphones,
  Info,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Address } from "@/data/user";
import { useUser } from "@/context/UserContext";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";
import { haptics } from "@/lib/haptics";

function ProfileContent() {
  const { user, updateUser, addresses, setAddresses, notifications, setNotifications, isLoadingProfile } = useUser();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam && ["personal", "addresses", "security", "notifications"].includes(tabParam) ? tabParam : "personal");

  useEffect(() => {
    if (tabParam && ["personal", "addresses", "security", "notifications"].includes(tabParam)) {
      Promise.resolve().then(() => {
        setActiveTab(tabParam);
      });
    }
  }, [tabParam, setActiveTab]);
  // Navigation & Auth
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout(); // Clear Zustand state and token
    localStorage.removeItem("meddynet_user"); // Clear any cached profile
    router.push("/login"); // Redirect securely
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for forms
  const [personalInfo, setPersonalInfo] = useState({
    name: user.name,
    phone: user.phone,
    age: user.age,
    bloodGroup: user.bloodGroup,
    panCard: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isBloodDropdownOpen, setIsBloodDropdownOpen] = useState(false);

  // Security Form State
  const [passwordData, setPasswordData] = useState({ old: "", new: "", repeat: "" });
  const [passwordVis, setPasswordVis] = useState({ old: false, new: false, repeat: false });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [oldPasswordStatus, setOldPasswordStatus] = useState<boolean | null | "checking">(null);

  // 2FA State
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAModal, setTwoFAModal] = useState<"idle" | "otp" | "success" | "disabling">("idle");
  const [twoFAOtp, setTwoFAOtp] = useState("");
  const [twoFAPhone, setTwoFAPhone] = useState("");
  const [twoFADevOtp, setTwoFADevOtp] = useState(""); // DEV only - remove in production
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState("");

  // Sync 2FA status from backend preferences
  useEffect(() => {
    if (notifications && typeof (notifications as Record<string, unknown>).two_fa_enabled === 'boolean') {
      setTwoFAEnabled((notifications as Record<string, unknown>).two_fa_enabled as boolean);
    }
  }, [notifications]);

  const handle2FAEnable = async () => {
    setTwoFALoading(true);
    setTwoFAError("");
    try {
      const res = await apiClient.post("/auth/2fa/enable");
      setTwoFAPhone(res.data.phone || "");
      setTwoFADevOtp(res.data.dev_otp || ""); // DEV: auto-fill OTP for testing
      setTwoFAOtp(res.data.dev_otp || "");   // DEV: pre-fill so user can just click verify
      setTwoFAModal("otp");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setTwoFAError(axiosErr?.response?.data?.detail || "Failed to send OTP.");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FAVerify = async () => {
    if (!twoFAOtp || twoFAOtp.length < 4) { setTwoFAError("Enter the full OTP."); return; }
    setTwoFALoading(true);
    setTwoFAError("");
    try {
      await apiClient.post("/auth/2fa/verify", { otp: twoFAOtp });
      setTwoFAEnabled(true);
      setTwoFAModal("success");
      setTimeout(() => setTwoFAModal("idle"), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setTwoFAError(axiosErr?.response?.data?.detail || "Invalid OTP. Try again.");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handle2FADisable = async () => {
    setTwoFALoading(true);
    setTwoFAError("");
    try {
      await apiClient.post("/auth/2fa/disable");
      setTwoFAEnabled(false);
      setTwoFAModal("idle");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setTwoFAError(axiosErr?.response?.data?.detail || "Failed to disable 2FA.");
    } finally {
      setTwoFALoading(false);
    }
  };

  useEffect(() => {
    if (!passwordData.old) {
      setOldPasswordStatus(null);
      return;
    }
    
    let active = true;
    setOldPasswordStatus("checking");
    
    apiClient.post("/auth/verify-password", { password: passwordData.old })
      .then(res => {
        if (active) setOldPasswordStatus(res.data.is_correct);
      })
      .catch(() => {
        if (active) setOldPasswordStatus(false);
      });
      
    return () => { active = false; };
  }, [passwordData.old]);

  // Sync Local State with Context user when it changes
  useEffect(() => {
    Promise.resolve().then(() => {
      setPersonalInfo({
        name: user.name,
        phone: user.phone,
        age: user.age,
        bloodGroup: user.bloodGroup,
        panCard: user.pan_card || ''
      });
    });
  }, [user]);

  const handleSavePersonal = async () => {
    setIsSaving(true);
    try {
      // Map camelCase form fields to snake_case backend fields
      await updateUser({
        name: personalInfo.name,
        phone: personalInfo.phone,
        age: personalInfo.age,
        bloodGroup: personalInfo.bloodGroup,
        pan_card: personalInfo.panCard,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAddress = (id: string) => {
    const newAddresses = addresses.filter(a => a.id !== id);
    setAddresses(newAddresses);
    apiClient.patch("/users/me", { addresses: newAddresses }).catch(console.error);
  };

  const handleSaveAddress = (addr: Address) => {
    let newAddresses;
    if (addresses.find(a => a.id === addr.id)) {
      newAddresses = addresses.map(a => a.id === addr.id ? addr : a);
    } else {
      newAddresses = [addr, ...addresses];
    }
    setAddresses(newAddresses);
    setEditingAddress(null);
    setIsAddingAddress(false);
    apiClient.patch("/users/me", { addresses: newAddresses }).catch(console.error);
  };

  const addAddress = () => {
    setEditingAddress({
      id: `ADDR-${Date.now()}`,
      label: "",
      fullAddress: "",
      isDefault: false
    });
    setIsAddingAddress(true);
  };

  const toggleNotification = (key: string) => {
    const newPrefs = {
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications]
    };
    setNotifications(newPrefs);
    apiClient.patch("/users/me", { preferences: newPrefs }).catch(console.error);
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    if (!passwordData.old || !passwordData.new || !passwordData.repeat) {
      setPasswordError("All fields are required.");
      return;
    }
    if (passwordData.new !== passwordData.repeat) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordData.new.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    setPasswordLoading(true);
    try {
      await apiClient.post("/auth/change-password", {
        old_password: passwordData.old,
        new_password: passwordData.new
      });
      setPasswordSuccess("Password updated successfully!");
      setPasswordData({ old: "", new: "", repeat: "" });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setPasswordError(axiosErr.response?.data?.detail || "Failed to update password. Check your old password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Profile", icon: User, desc: "About Me" },
    { id: "addresses", label: "Addresses", icon: MapPin, desc: "My Addresses" },
    { id: "security", label: "Security", icon: ShieldCheck, desc: "Safe Login" },
    { id: "notifications", label: "Settings", icon: Bell, desc: "My Choices" },
  ];

  return (
    <div className="max-w-[1240px] mx-auto space-y-10 pb-20">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-4 sm:px-0">
        <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Member Account</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-dark-light tracking-tight">Settings</h1>
            <p className="text-sm text-text-secondary font-medium max-w-sm mx-auto lg:mx-0 italic">Update your personal details, address and app preferences.</p>
        </div>

        <div className="flex items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
            <Link href="/help-center" className="w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 hover:shadow-2xl transition-all cursor-pointer group active:scale-95 shrink-0">
                <Headphones className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </Link>
            <button 
                onClick={handleLogout}
                className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 h-14 bg-dark text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-dark/20 hover:bg-dark-light transition-all active:scale-95"
            >
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-10">
        {/* Navigation Sidebar */}
        <div className="w-full xl:w-80 shrink-0 space-y-6">
            <div className="bg-white border border-border rounded-[32px] sm:rounded-[40px] p-2 sm:p-3 shadow-sm flex flex-row xl:flex-col gap-2 overflow-x-auto xl:overflow-visible no-scrollbar">
                {tabs.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-4 p-3 sm:p-5 rounded-[24px] sm:rounded-[30px] transition-all group relative overflow-hidden shrink-0 xl:shrink xl:w-full ${
                                isActive 
                                ? "bg-dark text-white shadow-xl shadow-dark/10" 
                                : "hover:bg-surface text-text-muted hover:text-dark-light"
                            }`}
                        >
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                                isActive ? "bg-white/10" : "bg-surface group-hover:bg-white border border-border-dark group-hover:border-primary/20"
                            }`}>
                                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${ isActive ? "text-white" : "text-text-light group-hover:text-primary" }`} />
                            </div>
                            <div className="text-left">
                                <p className="text-xs sm:text-sm font-black tracking-tight whitespace-nowrap">{tab.label}</p>
                                <p className={`hidden sm:block text-[10px] font-bold mt-0.5 ${isActive ? "text-white/50" : "text-text-muted"}`}>{tab.desc}</p>
                            </div>
                            {isActive && (
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none hidden xl:block">
                                    <ChevronRight className="w-5 h-5 text-white/30" />
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

        </div>

        {/* Content Portal */}
        <div className="flex-1 bg-white border border-border rounded-[48px] shadow-sm min-h-[700px] relative">
            
            <AnimatePresence mode="wait">
                {isLoadingProfile ? (
                    <motion.div 
                        key="skeleton"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="p-10 md:p-14 space-y-12"
                    >
                        {/* Skeleton Header */}
                        <div className="flex flex-col md:flex-row items-center gap-10 pb-12 border-b border-dashed border-border">
                            <Skeleton className="w-40 h-40 md:w-44 md:h-44 rounded-[48px]" />
                            <div className="flex-1 space-y-4">
                                <Skeleton className="h-10 w-64 rounded-xl" />
                                <Skeleton className="h-6 w-40 rounded-lg" />
                                <div className="flex gap-3">
                                    <Skeleton className="h-8 w-24 rounded-2xl" />
                                    <Skeleton className="h-8 w-24 rounded-2xl" />
                                </div>
                            </div>
                        </div>

                        {/* Skeleton Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="space-y-3">
                                    <Skeleton className="h-4 w-20 rounded" />
                                    <Skeleton className="h-16 w-full rounded-3xl" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ) : activeTab === "personal" && (
                    <motion.div 
                        key="personal"
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                        className="p-10 md:p-14 space-y-12"
                    >
                        {/* Profile Header */}
                        <div className="flex flex-col md:flex-row items-center gap-10 pb-12 border-b border-dashed border-border">
                            <div className="relative group">
                                <div className="w-40 h-40 md:w-44 md:h-44 rounded-[48px] bg-linear-to-br from-primary to-accent text-white flex items-center justify-center text-5xl font-black shadow-2xl relative overflow-hidden group-hover:scale-105 group-hover:rotate-2 transition-all duration-700">
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {user.profile_image_url ? (
                                        <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.avatar
                                    )}
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 w-14 h-14 bg-white rounded-[24px] text-dark-light border-4 border-surface shadow-2xl hover:text-primary transition-all flex items-center justify-center group/cam active:scale-90"
                                >
                                    <Camera className="w-6 h-6 group-hover/cam:scale-110 transition-transform" />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            try {
                                                const form = new FormData();
                                                form.append('file', file);
                                                const res = await apiClient.post('/users/me/avatar', form, {
                                                    headers: { 'Content-Type': 'multipart/form-data' },
                                                });
                                                if (res.data.url) {
                                                   updateUser({ profile_image_url: res.data.url });
                                                }
                                                setSaveSuccess(true);
                                                setTimeout(() => setSaveSuccess(false), 3000);
                                            } catch (err) {
                                                console.error('Avatar upload failed:', err);
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div className="text-center md:text-left space-y-4">
                                <div>
                                    <h3 className="text-3xl font-black text-dark-light tracking-tight">{user.name}</h3>
                                    <p className="text-sm text-text-secondary font-bold tracking-tight">Joined on {user.memberSince}</p>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <CheckCircle className="w-3.5 h-3.5" /> Verified
                                    </span>
                                    <span className="px-4 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5" /> MeddyNet Plus
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {[
                                { label: "My Name", value: personalInfo.name, type: "text", icon: User, key: "name", placeholder: "Your Name" },
                                { label: "Phone", value: personalInfo.phone, type: "tel", icon: Phone, key: "phone", placeholder: "+91-XXXXXXXXXX", maxLength: 10 },
                            ].map(field => (
                                <div key={field.key} className="space-y-3">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2">{field.label}</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                            <field.icon className="w-5 h-5 text-text-light group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input 
                                            type={field.type}
                                            value={field.value}
                                            maxLength={field.maxLength}
                                            onChange={(e) => {
                                                let val = e.target.value;
                                                if (field.key === "name") val = val.replace(/[^a-zA-Z\s.-]/g, '').replace(/\s{2,}/g, ' ').trimStart();
                                                if (field.key === "phone") val = val.replace(/\D/g, '');
                                                setPersonalInfo({...personalInfo, [field.key]: val});
                                            }}
                                            className="w-full bg-surface border-none rounded-3xl py-5 pl-16 pr-6 text-sm font-black text-dark-light focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                            placeholder={field.placeholder}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2">Email</label>
                                <div className="relative group opacity-60">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                        <Mail className="w-5 h-5 text-text-light" />
                                    </div>
                                    <input 
                                        type="email"
                                        readOnly
                                        value={user.email || ''}
                                        className="w-full bg-surface/50 border-none rounded-3xl py-5 pl-16 pr-6 text-sm font-black text-text-muted cursor-not-allowed"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                        <Lock className="w-4 h-4 text-text-light" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2">Age</label>
                                    <input 
                                        type="tel"
                                        value={personalInfo.age || ''}
                                        maxLength={3}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            let parsed = val ? parseInt(val) : 0;
                                            if (parsed > 150) parsed = 150;
                                            setPersonalInfo({...personalInfo, age: parsed});
                                        }}
                                        className="w-full bg-surface border-none rounded-3xl py-5 px-6 text-sm font-black text-dark-light focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2">Blood</label>
                                    <div className="relative">
                                        <div 
                                            onClick={() => setIsBloodDropdownOpen(!isBloodDropdownOpen)}
                                            className="w-full bg-surface border-none rounded-3xl py-5 px-6 text-sm font-black text-dark-light hover:bg-white border-2 border-transparent hover:border-primary/20 transition-all outline-none flex items-center justify-between cursor-pointer group/select shadow-inner"
                                        >
                                            <span className="group-hover/select:scale-105 transition-transform origin-left">{personalInfo.bloodGroup}</span>
                                            <ChevronRight className={`w-5 h-5 transition-transform duration-500 ease-out text-text-light group-hover/select:text-primary ${isBloodDropdownOpen ? "-rotate-90" : "rotate-90"}`} />
                                        </div>
                                        
                                        <AnimatePresence>
                                            {isBloodDropdownOpen && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }} 
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    className="absolute left-0 right-0 top-full mt-3 bg-white/95 backdrop-blur-xl border border-border-dark/30 rounded-[32px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.2)] z-50 p-3 overflow-hidden"
                                                >
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                                                            <button 
                                                                key={bg}
                                                                type="button"
                                                                onClick={() => {
                                                                    setPersonalInfo({...personalInfo, bloodGroup: bg});
                                                                    setIsBloodDropdownOpen(false);
                                                                }}
                                                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all scale-100 active:scale-95 ${
                                                                    personalInfo.bloodGroup === bg 
                                                                    ? "bg-dark text-white shadow-xl shadow-dark/20" 
                                                                    : "text-text-muted hover:bg-surface hover:text-dark-light"
                                                                }`}
                                                            >
                                                                {bg}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* PAN Card Field */}
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2">PAN Card</label>
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                        <CreditCard className="w-5 h-5 text-text-light group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={10}
                                        placeholder="ABCDE1234F"
                                        value={personalInfo.panCard}
                                        onChange={(e) => {
                                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'');
                                            setPersonalInfo({...personalInfo, panCard: val});
                                        }}
                                        className="w-full bg-surface border-none rounded-3xl py-5 pl-16 pr-6 text-sm font-black text-dark-light focus:ring-4 focus:ring-primary/10 transition-all outline-none tracking-[0.2em]"
                                    />
                                    {personalInfo.panCard.length === 10 && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                                            {/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(personalInfo.panCard)
                                                ? <span className="text-emerald-500 text-[10px] font-black bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Valid</span>
                                                : <span className="text-rose-500 text-[10px] font-black bg-rose-50 px-3 py-1 rounded-full border border-rose-100 uppercase tracking-widest">Invalid</span>
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Save Changes */}
                        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-dashed border-border lg:absolute lg:bottom-14 lg:left-14 lg:right-14 lg:pt-0 lg:border-none">
                            <div className="flex items-center gap-3">
                                <AnimatePresence>
                                    {saveSuccess && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/5"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Saved!
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button 
                                onClick={handleSavePersonal}
                                disabled={isSaving}
                                className="w-full sm:w-auto min-w-[200px] h-16 bg-dark-light text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-dark/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                            >
                                {isSaving ? (
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <> Save <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === "addresses" && (
                    <motion.div 
                        key="addresses"
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                        className="p-10 md:p-14 space-y-12"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h2 className="text-3xl font-black text-dark-light tracking-tight">My Addresses</h2>
                            <button 
                                onClick={addAddress}
                                className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-[28px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 transition-all group"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Add Address
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {addresses.map((addr: Address, i: number) => (
                                <motion.div 
                                    key={addr.id} layout
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                    className="bg-white border border-border rounded-[40px] p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 group transition-all duration-500 relative flex flex-col h-full"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-16 h-16 rounded-3xl bg-surface border border-border-dark flex items-center justify-center text-text-light group-hover:text-primary group-hover:border-primary/20 transition-all duration-500">
                                            <MapPin className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                        </div>
                                        {addr.isDefault && (
                                            <span className="px-3 py-1 bg-dark text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Default</span>
                                        )}
                                    </div>
                                    <div className="flex-2 space-y-8 text-black mb-8">
                                        <h4 className="text-xl font-black text-dark-light tracking-tight">{addr.label}</h4>
                                        <p className="text-sm text-text-secondary font-medium leading-relaxed">{addr.fullAddress}</p>
                                    </div>
                                    <div className="flex items-center gap-2 pt-6 border-t border-dashed border-border mt-auto">
                                        <button 
                                            onClick={() => { setEditingAddress(addr); setIsAddingAddress(false); }}
                                            className="flex-1 h-12 bg-surface text-text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all border border-transparent hover:border-primary/10 flex items-center justify-center gap-2"
                                        >
                                            <Edit3 className="w-4 h-4" /> Edit
                                        </button>
                                        <button 
                                            onClick={() => deleteAddress(addr.id)}
                                            className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-100 transition-all border border-rose-100/50"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {addresses.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-surface/50 rounded-[4rem] border-4 border-dashed border-border-dark flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-[32px] bg-white flex items-center justify-center mb-6 shadow-sm">
                                        <MapPin className="w-12 h-12 text-border-dark" />
                                    </div>
                                    <h3 className="text-2xl font-black text-dark-light mb-2">No Addresses Found</h3>
                                    <p className="text-sm font-bold text-text-muted max-w-xs leading-relaxed">Add an address so we can collect your samples from home.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === "security" && (
                     <motion.div 
                        key="security"
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                        className="p-10 md:p-14 space-y-12"
                    >
                        <h2 className="text-3xl font-black text-dark-light tracking-tight">Safe Login</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Password</p>
                                    <form onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }} className="space-y-4 pt-1">
                                    {/* Hidden username field for password managers to prevent them from putting emails in the top search bar! */}
                                    <input type="text" name="secure-username" id="secure-username" autoComplete="username" defaultValue={user.email || ""} className="hidden" aria-hidden="true" readOnly />
                                    {[
                                        { key: "old", label: "Old Password", hint: "••••••••" },
                                        { key: "new", label: "New Password", hint: "Enter new password" },
                                        { key: "repeat", label: "Repeat New Password", hint: "Repeat password" },
                                    ].map(f => {
                                        const isRepeat = f.key === "repeat";
                                        const isOld = f.key === "old";
                                        
                                        const hasValues = passwordData.new.length > 0 && passwordData.repeat.length > 0;
                                        const isMatch = hasValues && passwordData.new === passwordData.repeat;
                                        const isMismatch = hasValues && passwordData.new !== passwordData.repeat;
                                        
                                        const oldMatch = isOld && oldPasswordStatus === true;
                                        const oldMismatch = isOld && oldPasswordStatus === false;
                                        const oldChecking = isOld && oldPasswordStatus === "checking";

                                        return (
                                            <div key={f.key} className="space-y-2">
                                                <div className="flex items-center justify-between px-2">
                                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">{f.label}</label>
                                                    <AnimatePresence>
                                                        {isRepeat && isMatch && (
                                                            <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[9px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3"/> matched
                                                            </motion.span>
                                                        )}
                                                        {isRepeat && isMismatch && (
                                                            <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[9px] font-black uppercase text-rose-500 tracking-widest">
                                                                mismatch
                                                            </motion.span>
                                                        )}
                                                        {isOld && oldChecking && (
                                                            <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[9px] font-black uppercase text-amber-500 tracking-widest flex items-center gap-1">
                                                                <div className="w-3 h-3 rounded-full border-[1.5px] border-amber-500/30 border-t-amber-500 animate-spin" /> checking
                                                            </motion.span>
                                                        )}
                                                        {isOld && oldMatch && (
                                                            <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[9px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3"/> correct
                                                            </motion.span>
                                                        )}
                                                        {isOld && oldMismatch && (
                                                            <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[9px] font-black uppercase text-rose-500 tracking-widest">
                                                                incorrect
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                <div className="relative">
                                                    <input 
                                                        type={passwordVis[f.key as keyof typeof passwordVis] ? "text" : "password"}
                                                        name={`password-${f.key}`}
                                                        id={`password-${f.key}`}
                                                        autoComplete={isOld ? "current-password" : "new-password"}
                                                        value={passwordData[f.key as keyof typeof passwordData]}
                                                        placeholder={f.hint}
                                                        onChange={(e) => {
                                                            setPasswordData({...passwordData, [f.key]: e.target.value.replace(/\s/g, '')});
                                                            setPasswordError("");
                                                            setPasswordSuccess("");
                                                        }}
                                                        className={`w-full bg-surface border-2 rounded-3xl py-4 pl-6 pr-12 text-sm font-black focus:ring-4 transition-all outline-none ${
                                                            oldChecking ? 'border-amber-500/50 focus:ring-amber-500/10 text-amber-700 bg-amber-50/50' :
                                                            oldMatch ? 'border-emerald-500/50 focus:ring-emerald-500/10 text-emerald-700' :
                                                            oldMismatch ? 'border-rose-500/50 focus:ring-rose-500/10 text-rose-700' :
                                                            isRepeat && isMatch ? 'border-emerald-500/50 focus:ring-emerald-500/10 text-emerald-700' :
                                                            isRepeat && isMismatch ? 'border-rose-500/50 focus:ring-rose-500/10 text-rose-700' :
                                                            'border-transparent focus:ring-primary/10'
                                                        }`}
                                                    />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setPasswordVis({...passwordVis, [f.key]: !passwordVis[f.key as keyof typeof passwordVis]})}
                                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-dark-light transition-colors"
                                                    >
                                                        {passwordVis[f.key as keyof typeof passwordVis] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {passwordError && <p className="text-xs font-black text-rose-500 px-2 mt-2">{passwordError}</p>}
                                    {passwordSuccess && <p className="text-xs font-black text-emerald-500 px-2 mt-2">{passwordSuccess}</p>}
                                    
                                    <button 
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="w-full h-16 bg-dark text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-dark-light transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                                    >
                                        {passwordLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                        ) : "Save Password"}
                                    </button>
                                    </form>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Dynamic 2FA Card */}
                                <div className={`p-10 rounded-[44px] relative overflow-hidden shadow-2xl group transition-all duration-700 ${
                                    twoFAEnabled 
                                        ? "bg-linear-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20" 
                                        : "bg-linear-to-br from-blue-600 to-indigo-800 shadow-blue-500/20"
                                } text-white`}>
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl rounded-full -mr-24 -mt-24" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="w-14 h-14 rounded-[24px] bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                {twoFAEnabled ? <ShieldCheck className="w-7 h-7" /> : <Smartphone className="w-7 h-7" />}
                                            </div>
                                            <span className={`px-3 py-1 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                twoFAEnabled ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-300"
                                            }`}>
                                                {twoFAEnabled ? "✓ Active" : "Login"}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black tracking-tight mb-2">Two-Factor (2FA)</h4>
                                            <p className="text-white/70 text-sm font-medium leading-relaxed italic">
                                                {twoFAEnabled 
                                                    ? "Your account is protected with an extra security layer." 
                                                    : "Add an extra layer of security using your phone."}
                                            </p>
                                        </div>
                                        {twoFAError && <p className="text-rose-300 text-xs font-black">{twoFAError}</p>}
                                        {twoFAEnabled ? (
                                            <button 
                                                onClick={handle2FADisable}
                                                disabled={twoFALoading}
                                                className="w-full py-4 bg-white/20 border border-white/30 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {twoFALoading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Disable 2FA"}
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={handle2FAEnable}
                                                disabled={twoFALoading}
                                                className="w-full py-4 bg-white text-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {twoFALoading ? <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /> : "Enable 2FA"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="p-8 rounded-[40px] border border-border bg-surface flex items-start gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-white border border-border-dark flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-6 h-6 text-primary" />
                                     </div>
                                     <div className="space-y-1">
                                        <h4 className="text-sm font-black text-dark-light uppercase tracking-tight">Safety Check</h4>
                                        <p className="text-xs text-text-secondary font-medium italic">We are keeping your account safe.</p>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "notifications" && (
                    <motion.div 
                        key="notifications"
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                        className="p-10 md:p-14 space-y-12"
                    >
                        <h2 className="text-3xl font-black text-dark-light tracking-tight">My Choices</h2>
                        
                        <div className="space-y-6">
                            {[
                                { id: "bookingUpdates", title: "Booking Updates", desc: "Get updates on your tests and reports." },
                                { id: "medicalReminders", title: "Health Reminders", desc: "Reminders for your tests and medicines." },
                                { id: "offers", title: "Special Offers", desc: "Get news about deals and offers." },
                                { id: "securityAlerts", title: "Security Alerts", desc: "Updates on your account safety." },
                            ].map((item) => (
                                <div key={item.id} className="group bg-surface/30 border border-transparent hover:border-border hover:bg-white rounded-[40px] p-8 flex items-center justify-between gap-10 transition-all duration-500">
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-dark-light tracking-tight group-hover:text-primary transition-colors">{item.title}</h4>
                                        <p className="text-sm text-text-secondary font-medium max-w-sm">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={!!notifications[item.id as keyof typeof notifications]} 
                                            onChange={() => toggleNotification(item.id)}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-16 h-9 bg-slate-200 peer-focus:outline-none rounded-full peer-checked:bg-primary shadow-inner peer-checked:shadow-primary/20 transition-all duration-500 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:after:translate-x-full after:shadow-lg" />
                                    </label>
                                </div>
                            ))}

                            <div className={`mt-12 p-10 rounded-[50px] text-white relative overflow-hidden shadow-2xl transition-all duration-700 ${notifications.whatsapp ? 'bg-linear-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20 scale-[1.02]' : 'bg-linear-to-br from-dark to-slate-800'}`}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                    <div className="flex items-center gap-8 text-center md:text-left">
                                        <div className={`w-20 h-20 rounded-[30px] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all ${notifications.whatsapp ? 'rotate-12 bg-white text-emerald-600' : 'text-white/50'}`}>
                                            <Zap className="w-10 h-10 fill-current" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-2xl font-black tracking-tight">Reports on WhatsApp</h4>
                                            <p className="text-sm text-white/70 font-medium italic">Get your health reports on WhatsApp automatically.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => toggleNotification('whatsapp')}
                                        className={`shrink-0 px-10 py-5 bg-white rounded-3xl text-xs font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all ${notifications.whatsapp ? 'text-emerald-700' : 'text-dark'}`}
                                    >
                                        {notifications.whatsapp ? "Stop" : "Start"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
      </div>

      {/* Security Info */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="bg-surface border border-border-dark rounded-[48px] p-12 flex flex-col items-center text-center gap-6 relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
         <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg text-primary mb-2">
            <Info className="w-8 h-8" />
         </div>
         <div className="space-y-2">
            <h3 className="text-2xl font-black text-dark-light tracking-tight">Your Privacy</h3>
            <p className="text-text-secondary font-medium max-w-2xl italic">We use safe systems to protect your data. All your papers are private and safe.</p>
         </div>
         <div className="flex items-center gap-6 pt-4">
            <div className="flex flex-col items-center">
                <Cloud className="w-6 h-6 text-text-light mb-1" />
                <span className="text-[9px] font-black uppercase tracking-widest">Cloud</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center">
                <Lock className="w-6 h-6 text-text-light mb-1" />
                <span className="text-[9px] font-black uppercase tracking-widest">Login</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center">
                <CreditCard className="w-6 h-6 text-text-light mb-1" />
                <span className="text-[9px] font-black uppercase tracking-widest">Payments</span>
            </div>
         </div>
      </motion.div>

      {/* Address Modal */}
      <AnimatePresence>
        {editingAddress && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-100">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingAddress(null)}
              className="absolute inset-0 bg-dark/80 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative bg-white rounded-[50px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-12 md:p-14">
                <div className="flex items-center justify-between mb-10">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-dark-light tracking-tight">
                        {isAddingAddress ? "Add Address" : "Edit Address"}
                        </h2>
                        <p className="text-sm text-text-secondary font-medium italic">Save where you want your health tests done.</p>
                    </div>
                  <button onClick={() => setEditingAddress(null)} className="p-4 bg-surface hover:bg-border rounded-[24px] transition-all">
                    <X className="w-8 h-8 text-dark-light" />
                  </button>
                </div>

                <form className="space-y-8" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSaveAddress({
                    ...editingAddress,
                    label: formData.get("label") as string,
                    fullAddress: formData.get("address") as string,
                  });
                }}>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2">Address Name</label>
                    <input 
                      name="label"
                      defaultValue={editingAddress.label}
                      onChange={(e) => e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s.-]/g, '').replace(/\s{2,}/g, ' ').trimStart()}
                      className="w-full bg-surface border-none rounded-3xl py-5 px-6 text-sm font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                      placeholder="Home, Office, etc."
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2">Full Address</label>
                    <textarea 
                      name="address"
                      defaultValue={editingAddress.fullAddress}
                      rows={3}
                      onChange={(e) => e.target.value = e.target.value.replace(/\s{2,}/g, ' ').trimStart()}
                      className="w-full bg-surface border-none rounded-3xl py-5 px-6 text-sm font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                      placeholder="House No, Street, Landmark, City..."
                      required
                    />
                  </div>

                  <div className="pt-6 flex items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => setEditingAddress(null)}
                      className="flex-1 py-5 rounded-3xl text-xs font-black uppercase tracking-widest text-text-secondary bg-surface hover:bg-border transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-2 py-5 bg-dark-light text-white rounded-3xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-dark/20 hover:scale-105 transition-all active:scale-95"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 2FA OTP Modal ─── */}
      <AnimatePresence>
        {twoFAModal === "otp" && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-200">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setTwoFAModal("idle"); setTwoFAOtp(""); setTwoFAError(""); }}
              className="absolute inset-0 bg-dark/80 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative bg-white rounded-[50px] w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-[24px] bg-blue-100 flex items-center justify-center">
                    <Smartphone className="w-7 h-7 text-blue-600" />
                  </div>
                  <button onClick={() => { setTwoFAModal("idle"); setTwoFAOtp(""); setTwoFAError(""); }} className="p-3 bg-surface hover:bg-border rounded-2xl transition-all">
                    <X className="w-5 h-5 text-dark-light" />
                  </button>
                </div>
                <h2 className="text-2xl font-black text-dark-light tracking-tight mb-2">Verify Your Phone</h2>
                <p className="text-sm text-text-secondary font-medium mb-4">
                  We&apos;ve sent a 6-digit OTP to your phone ending in <span className="font-black text-dark-light">••••{twoFAPhone}</span>
                </p>
                {/* DEV MODE: Show OTP directly since SMS is not integrated */}
                {twoFADevOtp && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-4 text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 mb-1">🛠 Dev Mode — Your OTP</p>
                    <p className="text-3xl font-black tracking-[0.3em] text-blue-700">{twoFADevOtp}</p>
                    <p className="text-[9px] text-blue-400 mt-1">Auto-filled below. Just click Verify.</p>
                  </div>
                )}
                <div className="space-y-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFAOtp}
                    onChange={(e) => { setTwoFAOtp(e.target.value.replace(/\D/g, '')); setTwoFAError(""); }}
                    autoFocus
                    placeholder="• • • • • •"
                    className="w-full bg-surface border-2 border-transparent focus:border-primary/30 rounded-3xl py-5 px-6 text-2xl font-black tracking-[0.5em] text-center focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  />
                  {twoFAError && <p className="text-rose-500 text-xs font-black text-center">{twoFAError}</p>}
                  <button
                    onClick={handle2FAVerify}
                    disabled={twoFALoading || twoFAOtp.length < 4}
                    className="w-full py-5 bg-dark text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-dark-light transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {twoFALoading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : "Verify & Enable 2FA"}
                  </button>
                  <button
                    onClick={handle2FAEnable}
                    disabled={twoFALoading}
                    className="w-full py-3 text-xs font-black text-text-muted uppercase tracking-widest hover:text-primary transition-colors"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {twoFAModal === "success" && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-200">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-dark/80 backdrop-blur-xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="relative bg-white rounded-[50px] w-full max-w-sm p-12 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-dark-light mb-2">2FA Enabled!</h2>
              <p className="text-sm text-text-secondary font-medium">Your account is now protected with two-factor authentication.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
        <div className="max-w-[1240px] mx-auto space-y-10 pb-20 animate-pulse">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-4 sm:px-0 opacity-50">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-32 rounded-full" />
                    <Skeleton className="h-12 w-64 rounded-2xl" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="w-14 h-14 rounded-2xl" />
                    <Skeleton className="w-40 h-14 rounded-2xl" />
                </div>
            </div>
            <div className="flex flex-col xl:flex-row gap-10 opacity-30">
                <div className="w-full xl:w-80 space-y-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-[30px]" />)}
                </div>
                <Skeleton className="flex-1 h-[700px] rounded-[48px]" />
            </div>
        </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
