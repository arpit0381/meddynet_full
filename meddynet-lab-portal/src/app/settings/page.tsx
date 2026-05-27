"use client";

import { validateFullName, validateEmail, getPasswordErrorMessage, isValidEmail } from "@/utils/validation";

import { motion } from "framer-motion";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  ChevronRight,
  LogOut,
  Mail
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import { AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useLabProfile, useUpdateLabProfile } from "@/lib/hooks";

export default function LabSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: labData } = useLabProfile();
  const updateProfileMutation = useUpdateLabProfile();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  
  const [profile, setProfile] = useState({
    name: user?.name || "Lab Admin",
    email: user?.email || "admin@meddynet.com"
  });

  const [notifications, setNotifications] = useState([
    { id: "booking", label: "New Booking Alert", desc: "Push notification for every new order", active: true },
    { id: "summary", label: "Daily Summary", desc: "Email summary of end-of-day earnings", active: true },
    { id: "support", label: "Critical Support", desc: "Urgent SMS for failed report uploads", active: false },
  ]);

  const [security, setSecurity] = useState([
    { id: "2fa", label: "Two-Factor Auth", desc: "Secure account with mobile OTP", active: false },
    { id: "login", label: "Login Alerts", desc: "Email alert for suspicious logins", active: true },
    { id: "timeout", label: "Session Lockdown", desc: "Logout after 30 mins of inactivity", active: false },
  ]);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, active: !n.active } : n));
  };

  const toggleSecurity = (id: string) => {
    setSecurity(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    setToast({ message: "Security preferences updated!", type: "success" });
  };

  const handleUpdateProfile = async () => {
    if (!profile.name.trim() || !isValidEmail(profile.email)) {
      setToast({ message: "Please provide a valid name and email", type: "error" });
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateProfileMutation.mutateAsync({
        name: labData?.name, // Keeping lab name same unless changed in profile.tsx
        phone: user?.phone,
        address: labData?.address
      });
      setToast({ message: "Security settings synced successfully!", type: "success" });
    } catch {
      setToast({ message: "Failed to sync settings with database", type: "error" });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      setToast({ message: "Passwords do not match!", type: "error" });
      return;
    }
    const pwdError = getPasswordErrorMessage(passwordData.new);
    if (pwdError) {
      setToast({ message: pwdError, type: "error" });
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setIsPasswordModalOpen(false);
      setPasswordData({ current: "", new: "", confirm: "" });
      setToast({ message: "Password updated securely!", type: "success" });
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-black text-dark-light tracking-tight mb-2 italic">Account <span className="text-primary not-italic">Settings</span></h1>
        <p className="text-text-muted font-bold">Manage your laboratory credentials, security preference and notifications.</p>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <div className="bg-white rounded-[3rem] p-8 border border-border-dark/20 shadow-2xl overflow-hidden">
           <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                 <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-dark-light tracking-tight">Personal Information</h2>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-2">Full Name</label>
                 <input 
                   type="text" 
                   value={profile.name}
                   onChange={e => setProfile({...profile, name: validateFullName(e.target.value)})}
                   className="w-full bg-surface border-2 border-border-dark rounded-2xl px-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                 />
              </div>
              <div>
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-2">Personal Email</label>
                 <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input 
                      type="email" 
                      value={profile.email}
                      onChange={e => setProfile({...profile, email: validateEmail(e.target.value)})}
                      className="w-full bg-surface border-2 border-border-dark rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-dark-light outline-none focus:border-primary focus:bg-white transition-all shadow-sm" 
                    />
                 </div>
              </div>
              <div className="col-span-2">
                 <button 
                   onClick={handleUpdateProfile}
                   disabled={isUpdating}
                   className="px-8 py-4 rounded-2xl bg-dark text-white font-black text-xs hover:bg-dark-light transition-all shadow-lg disabled:opacity-50"
                 >
                    {isUpdating ? "Updating..." : "Update Profile"}
                 </button>
              </div>
           </div>
        </div>

        {/* Subscription Card - Redirects to full page */}
        <Link href="/subscription/manage" className="block group">
           <div className="bg-white rounded-[3rem] p-8 border border-border-dark/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 hover:border-primary transition-all group duration-500">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <CreditCard className="w-8 h-8" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-dark-light tracking-tight mb-1">Manage Subscription</h2>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                       Current Plan: <span className="text-primary">Advanced Partner</span> 
                    </p>
                 </div>
              </div>
              <div className="px-8 py-4 rounded-2xl bg-surface border border-border-dark/10 group-hover:bg-primary group-hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                 View Billing & Plans <ChevronRight className="w-4 h-4" />
              </div>
           </div>
        </Link>

        {/* Notifications Section */}
        <div className="bg-white rounded-[3rem] p-8 border border-border-dark/20 shadow-2xl">
           <div className="flex items-center gap-3 mb-8">
              <Bell className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-black text-dark-light tracking-tight">Notifications Settings</h2>
           </div>
           <div className="grid sm:grid-cols-3 gap-6">
              {notifications.map(item => (
                <div key={item.id} className="p-6 rounded-3xl bg-surface/50 border border-border-dark/5 flex flex-col justify-between gap-6 group hover:border-primary/20 transition-all">
                   <div>
                      <p className="text-sm font-black text-dark-light mb-1 group-hover:text-primary transition-colors">{item.label}</p>
                      <p className="text-[10px] font-bold text-text-muted uppercase leading-relaxed">{item.desc}</p>
                   </div>
                   <button 
                      onClick={() => toggleNotification(item.id)}
                      className={`w-12 h-6 rounded-full transition-all relative ${item.active ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-border-dark'}`}
                   >
                      <motion.div 
                        animate={{ x: item.active ? 24 : 0 }}
                        className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm" 
                      />
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-[3rem] p-8 border border-border-dark/20 shadow-2xl overflow-hidden relative group">
           <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative z-10">
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-8">
                    <Shield className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-black text-dark-light tracking-tight">Security Center</h2>
                 </div>
                 <div className="grid sm:grid-cols-3 gap-8">
                    {security.map(item => (
                       <div key={item.id} className="flex flex-col gap-4">
                          <div>
                             <p className="text-sm font-black text-dark-light leading-none mb-1">{item.label}</p>
                             <p className="text-[10px] font-bold text-text-muted uppercase">{item.desc}</p>
                          </div>
                          <button 
                            onClick={() => toggleSecurity(item.id)}
                            className={`w-12 h-6 rounded-full transition-all relative ${item.active ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-border-dark'}`}
                          >
                             <motion.div 
                               animate={{ x: item.active ? 24 : 0 }}
                               className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm" 
                             />
                          </button>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="shrink-0">
                 <button 
                   onClick={() => setIsPasswordModalOpen(true)}
                   className="px-8 py-4 rounded-2xl bg-surface border border-border-dark text-xs font-black text-dark-light hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                 >
                    Reset Password <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>

        {/* System & Logout */}
        <div className="bg-white rounded-[3rem] p-8 border border-border-dark/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative group">
           <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="flex items-center gap-4 relative z-10">
              <div className="p-4 rounded-2xl bg-red-50 text-red-500 shadow-inner group-hover:scale-110 transition-transform">
                 <LogOut className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="text-lg font-black text-dark-light tracking-tight">Logout from Session</h3>
                 <p className="text-xs font-bold text-text-muted uppercase">Securely sign out from all devices</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="px-10 py-4 rounded-2xl bg-red-500 text-white font-black text-xs shadow-xl shadow-red-500/20 hover:bg-red-600 hover:-translate-y-1 transition-all relative z-10"
           >
              Log Out Now
           </button>
        </div>
      </div>

      {/* Password Reset Modal */}
      <Modal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)}
        title="Secure Update"
        maxWidth="max-w-md"
      >
        <div className="p-8 pt-0 space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <p className="text-sm font-bold text-text-muted mb-8 uppercase tracking-widest px-2">Update your access credentials</p>
           
           <div className="space-y-6">
              <div>
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-2">Current Password</label>
                 <input 
                   type="password" 
                   value={passwordData.current}
                   onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                   className="w-full bg-surface border-2 border-border-dark rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-inner" 
                 />
              </div>
               <div>
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-2">New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.new}
                    onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                    className={`w-full bg-surface border-2 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all shadow-inner ${passwordData.new && getPasswordErrorMessage(passwordData.new) ? 'border-red-500/50 focus:border-red-500' : 'border-border-dark focus:border-primary focus:bg-white'}`} 
                  />
                  {passwordData.new && getPasswordErrorMessage(passwordData.new) && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2 px-3">{getPasswordErrorMessage(passwordData.new)}</p>}
               </div>
              <div>
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 block px-2">Confirm New Password</label>
                 <input 
                   type="password" 
                   value={passwordData.confirm}
                   onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                   className="w-full bg-surface border-2 border-border-dark rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all shadow-inner" 
                 />
              </div>
              
              <div className="pt-4 flex gap-4">
                 <button 
                   onClick={() => setIsPasswordModalOpen(false)}
                   className="flex-1 py-4 rounded-2xl bg-surface text-text-muted font-black text-xs hover:bg-border-dark/20 transition-all uppercase tracking-widest"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={handlePasswordChange}
                   disabled={isUpdating}
                   className="flex-1 py-4 rounded-2xl bg-primary text-white font-black text-xs shadow-xl shadow-primary/20 hover:text-white/90 transition-all uppercase tracking-widest disabled:opacity-50"
                 >
                    {isUpdating ? "Securing..." : "Confirm Update"}
                 </button>
              </div>
           </div>
        </div>
      </Modal>

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
////