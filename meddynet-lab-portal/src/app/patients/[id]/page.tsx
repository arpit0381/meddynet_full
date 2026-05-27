"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ChevronLeft, 
  TestTube2, 
  ArrowUpRight,
  ClipboardList,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import BookingActions from "@/components/dashboard/BookingActions";
import { useState } from "react";
import Modal from "@/components/ui/Modal";

export default function PatientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setShowUpdateModal(false);
      // Actual update logic would go here
    }, 1500);
  };

  // Mock patient data based on ID
  const patientData = {
    id: id || "PR-22045",
    name: "Raj Kumar",
    age: "42",
    gender: "Male",
    phone: "+91 98765 43210",
    email: "raj.kumar@example.com",
    address: "Block C, 4th Floor, Sector 62, Noida, UP - 201301",
    totalBookings: 3,
    completedTests: 5,
    lastVisit: "Yesterday",
    bloodGroup: "O+",
    bookings: [
      { id: 'BK-8821', date: 'Yesterday', test: 'Lipid Profile', status: 'Completed', amount: '₹1,250' },
      { id: 'BK-7642', date: '12 Feb 2026', test: 'Full Body Checkup', status: 'Completed', amount: '₹4,999' },
      { id: 'BK-6512', date: '05 Jan 2026', test: 'Thyroid Profile', status: 'Completed', amount: '₹850' }
    ]
  };

  return (
    <div className="p-4 sm:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full bg-white border border-border-dark flex items-center justify-center hover:bg-surface transition-all group"
          >
            <ChevronLeft className="w-5 h-5 text-text-muted group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-dark-light tracking-tight italic">Patient <span className="text-primary not-italic">Info</span></h1>
            <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
               Database <ArrowUpRight className="w-3 h-3" /> {patientData.id}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] border border-border-dark/30 p-8 shadow-2xl shadow-dark/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="relative space-y-8 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                 <div className="w-24 h-24 rounded-5xl bg-linear-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20 group-hover:rotate-6 transition-transform">
                    {patientData.name.charAt(0)}
                 </div>
                 <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-2xl font-black text-dark-light">{patientData.name}</h2>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                       <span className="px-3 py-1 rounded-full bg-surface text-[10px] font-black text-text-muted uppercase tracking-widest">{patientData.age} Years</span>
                       <span className="px-3 py-1 rounded-full bg-surface text-[10px] font-black text-text-muted uppercase tracking-widest">{patientData.gender}</span>
                    </div>
                 </div>
              </div>

              <div className="h-px bg-border-dark/10" />

              <div className="space-y-5">
                 <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center text-text-muted transition-colors group-hover/item:text-primary">
                       <Phone className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number</p>
                       <p className="text-sm font-bold text-dark-light">{patientData.phone}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 group/item">
                    <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center text-text-muted transition-colors group-hover/item:text-primary">
                       <Mail className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Email Address</p>
                       <p className="text-sm font-bold text-dark-light">{patientData.email}</p>
                    </div>
                 </div>

                 <div className="flex items-start gap-4 group/item">
                    <div className="w-10 h-10 rounded-2xl bg-surface flex items-center justify-center text-text-muted transition-colors group-hover/item:text-primary shrink-0">
                       <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Current Address</p>
                       <p className="text-sm font-bold text-dark-light leading-relaxed">{patientData.address}</p>
                    </div>
                 </div>
              </div>

              <div className="p-6 rounded-4xl bg-primary text-white space-y-4 shadow-xl shadow-primary/20">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Vital Stats</span>
                    <AlertCircle className="w-4 h-4 opacity-50" />
                 </div>
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-xs font-black opacity-80 mb-1">Blood Group</p>
                       <p className="text-xl font-black">{patientData.bloodGroup}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black opacity-80 mb-1">Last Sample</p>
                       <p className="text-xl font-black">{patientData.lastVisit}</p>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Booking History */}
        <div className="lg:col-span-2 space-y-8">
           {/* Progress Cards */}
           <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-5xl border border-border-dark/30 p-6 flex items-center gap-6 group hover:border-primary/30 transition-all">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                    <ClipboardList className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">Total Bookings</p>
                    <p className="text-2xl font-black text-dark-light">{patientData.totalBookings}</p>
                 </div>
              </div>
              <div className="bg-white rounded-5xl border border-border-dark/30 p-6 flex items-center gap-6 group hover:border-primary/30 transition-all">
                 <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                    <TestTube2 className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">Tests Completed</p>
                    <p className="text-2xl font-black text-dark-light">{patientData.completedTests}</p>
                 </div>
              </div>
           </div>

           {/* History Table */}
           <div className="bg-white rounded-[3rem] border border-border-dark/30 shadow-2xl shadow-dark/5 overflow-hidden">
              <div className="p-8 border-b border-border-dark/10 flex items-center justify-between px-10">
                 <h3 className="text-xl font-black text-dark-light tracking-tight">Booking <span className="text-primary italic">History</span></h3>
                 <span className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-surface px-4 py-2 rounded-full">Record Active</span>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead>
                       <tr className="bg-surface/50 border-b border-border-dark/10">
                          <th className="px-10 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Booking ID</th>
                          <th className="px-10 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Date</th>
                          <th className="px-10 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Test Summary</th>
                          <th className="px-10 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Status</th>
                          <th className="px-10 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark/10">
                       {patientData.bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-surface/30 transition-all group">
                             <td className="px-10 py-6">
                                <span className="text-sm font-black text-dark-light">#{booking.id}</span>
                             </td>
                             <td className="px-10 py-6">
                                <div className="flex items-center gap-3">
                                   <Calendar className="w-4 h-4 text-text-muted" />
                                   <span className="text-sm font-bold text-dark-light">{booking.date}</span>
                                </div>
                             </td>
                             <td className="px-10 py-6">
                                <span className="text-sm font-bold text-text-muted group-hover:text-primary transition-colors">{booking.test}</span>
                             </td>
                             <td className="px-10 py-6">
                                <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                   {booking.status}
                                </span>
                             </td>
                             <td className="px-10 py-6 text-right">
                                <div className="flex justify-end">
                                   <BookingActions bookingId={booking.id} patientName={patientData.name} />
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              <div className="p-8 bg-surface/30 border-t border-border-dark/10 text-center px-10">
                 <p className="text-xs font-bold text-text-muted">Showing all historical records for this patient at <span className="text-dark-light font-black">National Diagnostics</span></p>
              </div>
           </div>
        </div>
      </div>


      {/* Update Profile Modal */}
      <Modal 
        isOpen={showUpdateModal} 
        onClose={() => setShowUpdateModal(false)}
        title="Update Patient Profile"
      >
        <div className="space-y-6">
           <div className="p-4 rounded-3xl bg-surface border border-border-dark/20 text-xs font-bold text-text-muted leading-relaxed">
              Modifying patient demographic data requires administrative verification. Changes will log the current timestamp and admin ID.
           </div>
           
           <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
                    <input type="text" defaultValue={patientData.name} className="w-full px-5 py-3.5 rounded-2xl bg-surface border border-transparent focus:border-primary/20 text-sm font-bold text-dark-light outline-none" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone</label>
                    <input type="text" defaultValue={patientData.phone} className="w-full px-5 py-3.5 rounded-2xl bg-surface border border-transparent focus:border-primary/20 text-sm font-bold text-dark-light outline-none" />
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Address</label>
                 <textarea defaultValue={patientData.address} className="w-full px-5 py-3.5 rounded-2xl bg-surface border border-transparent focus:border-primary/20 text-sm font-bold text-dark-light outline-none h-24 resize-none" />
              </div>
           </div>

           <div className="flex items-center gap-3 pt-4">
              <button 
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 py-4 rounded-2xl bg-surface text-text font-black text-[10px] uppercase tracking-widest hover:bg-border-dark/10 transition-all"
              >
                 Cancel
              </button>
              <button 
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-3 py-4 rounded-2xl bg-dark text-white font-black text-[10px] uppercase tracking-widest hover:bg-dark-light transition-all shadow-xl shadow-dark/10 disabled:opacity-50"
              >
                 {isUpdating ? 'Saving...' : 'Confirm Changes'}
              </button>
           </div>
        </div>
      </Modal>
    </div>
  );
}
