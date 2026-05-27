"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  User,
  Activity,
  Check
} from "lucide-react";
import { useState, useMemo } from "react";
import BookingActions from "@/components/dashboard/BookingActions";
import Toast from "@/components/ui/Toast";
import Modal from "@/components/ui/Modal";
import { useLabBookings, useUpdateBookingStatus, useLabStats, useQuickSchedule } from "@/lib/hooks";
import { Loader2 } from "lucide-react";

const timeSlots = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
];

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AppointmentCalendarPage() {
  const { data: bookingsArray, isLoading } = useLabBookings();
  const { data: statsData } = useLabStats();
  const updateStatusMutation = useUpdateBookingStatus();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"Day" | "Week">("Day");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: "success" | "error"} | null>(null);
  
  const appointments = useMemo(() => {
    if (!bookingsArray) return [];
    return bookingsArray.map((b: any) => {
        const d = new Date(b.scheduled_at);
        return {
            id: b.id,
            time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            patient: b.patient_name || "Unknown Patient",
            type: b.type === "home_collection" ? "Home" : "Lab",
            status: String(b.status).replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
            duration: "30m",
            date: d.toDateString()
        };
    });
  }, [bookingsArray]);
  
  // New Appointment Form State
  const [newAppt, setNewAppt] = useState({
    patient: "",
    type: "Home",
    time: "09:00 AM",
    test: "General Checkup"
  });

  // Generate dates for the top slider (current week)
  const weekDates = useMemo(() => {
    const dates = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push({
        day: days[d.getDay()],
        date: d.getDate(),
        fullDate: d.toDateString(),
        isCurrent: d.toDateString() === selectedDate.toDateString(),
        isToday: d.toDateString() === new Date().toDateString()
      });
    }
    return dates;
  }, [selectedDate]);

  const filteredAppointments = appointments.filter((appt: any) => appt.date === selectedDate.toDateString());

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ bookingId, status: newStatus.toLowerCase().replace(/ /g, '_') });
      setToast({ message: "Status updated successfully", type: "success" });
    } catch {
      setToast({ message: "Failed to update status", type: "error" });
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      await updateStatusMutation.mutateAsync({ bookingId, status: "cancelled" });
      setToast({ message: "Appointment cancelled", type: "success" });
    } catch {
      setToast({ message: "Failed to cancel", type: "error" });
    }
  };

  const quickScheduleMutation = useQuickSchedule();

  const handleAddAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse time and selected date
    try {
      const [time, period] = newAppt.time.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const apptDate = new Date(selectedDate);
      apptDate.setHours(hours, minutes, 0, 0);
      
      await quickScheduleMutation.mutateAsync({
        patient_name: newAppt.patient,
        type: newAppt.type === 'Home' ? 'home_collection' : 'lab_visit',
        scheduled_at: apptDate.toISOString(),
        notes: newAppt.test
      });
      
      setToast({ message: "Appointment scheduled successfully!", type: "success" });
      setIsAddModalOpen(false);
      setNewAppt({
        patient: "",
        type: "Home",
        time: "09:00 AM",
        test: "General Checkup"
      });
    } catch {
      setToast({ message: "Failed to schedule appointment", type: "error" });
    }
  };

  const changeMonth = (offset: number) => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + offset);
    setSelectedDate(d);
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-black text-text-muted uppercase tracking-widest animate-pulse">Syncing Lab Schedule...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-dark-light tracking-tight mb-2">Appointment Calendar</h1>
          <p className="text-text-muted font-bold">Synchronize your laboratory visits and technician schedules.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex p-1 bg-white border border-border-dark rounded-full shadow-sm">
              <button 
                onClick={() => setViewMode("Day")}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  viewMode === 'Day' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-dark-light'
                }`}
              >
                Day
              </button>
              <button 
                onClick={() => setViewMode("Week")}
                className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  viewMode === 'Week' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-dark-light'
                }`}
              >
                Week
              </button>
           </div>
           <button 
            onClick={() => setIsAddModalOpen(true)}
            className="p-4 rounded-full bg-dark text-white hover:bg-dark-light hover:scale-110 active:scale-95 transition-all shadow-xl shadow-dark/20"
           >
              <Plus className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 h-full">
        {/* Left - Mini Calendar & Filters */}
        <div className="space-y-8">
           <div className="bg-white rounded-5xl p-8 border border-border-dark/20 shadow-xl shadow-black/2 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="font-black text-dark-light uppercase text-[10px] tracking-widest">
                    {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                 </h3>
                 <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-surface rounded-lg text-text-muted transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-surface rounded-lg text-text-muted transition-colors"><ChevronRight className="w-4 h-4" /></button>
                 </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                 {days.map(d => <span key={d} className="text-[10px] font-black text-text-muted uppercase tracking-widest">{d[0]}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                 {/* Empty padding for days before the 1st of the month */}
                 {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`pad-${i}`} className="w-8 h-8" />
                 ))}
                 
                 {/* Actual days of the month */}
                 {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                    const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    const isToday = d.toDateString() === new Date().toDateString();
                    return (
                      <button 
                        key={i} 
                        onClick={() => setSelectedDate(d)}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                          isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' :
                          isToday ? 'bg-primary/10 text-primary border border-primary/20' :
                          'text-dark-light hover:bg-surface hover:scale-105'
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                 })}
              </div>
           </div>

           <div className="bg-dark rounded-5xl p-8 text-white shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
              <h3 className="text-sm font-black tracking-tight mb-4 relative z-10 flex items-center gap-2">
                 <Activity className="w-4 h-4 text-primary" /> Today&apos;s Capacity
              </h3>
              <div className="space-y-5 relative z-10">
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2.5">
                       <span>Visit Slots</span>
                       <span className="text-primary text-glow-primary">
                         {statsData?.fleet ? Math.round((statsData.fleet.active / (statsData.fleet.total || 1)) * 100) : 0}%
                       </span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: statsData?.fleet ? `${Math.round((statsData.fleet.active / (statsData.fleet.total || 1)) * 100)}%` : "0%" }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(0,168,107,0.5)]" 
                       />
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                       <span>Staff Field Intensity</span>
                       <span className="text-primary">{statsData?.fleet?.active > 0 ? "Active" : "Idle"}</span>
                    </div>
                    <p className="text-[11px] font-bold text-white/50 leading-relaxed">
                       {statsData?.fleet?.active || 0} of {statsData?.fleet?.total || 0} phlebotomists are active on field today. Coverage: {statsData?.fleet?.active > 0 ? "Optimal" : "No active staff"}.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* Right - Main Timeline View */}
        <div className="lg:col-span-3 bg-white rounded-[3rem] border border-border-dark/20 shadow-2xl overflow-hidden flex flex-col min-h-[700px]">
           {/* Timeline Header */}
           <div className="border-b border-border-dark/20 bg-surface/30 px-4 sm:px-8 py-6">
              <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-10 px-4 -mx-4 sm:-mx-8">
                {weekDates.map((d) => (
                  <button 
                    key={d.fullDate} 
                    onClick={() => setSelectedDate(new Date(d.fullDate))}
                    className={`flex-1 min-w-[90px] sm:min-w-[120px] flex flex-col items-center gap-3 p-5 sm:p-6 rounded-4xl transition-all duration-300 ${
                    d.isCurrent ? 'bg-white shadow-2xl shadow-primary/20 scale-110 border-2 border-primary ring-8 ring-primary/5' : 'hover:bg-white/60 hover:-translate-y-1'
                  }`}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${d.isCurrent ? 'text-primary' : 'text-text-muted'}`}>{d.day}</span>
                    <span className={`text-2xl font-black tabular-nums ${d.isCurrent ? 'text-dark-light' : 'text-text-muted/40'}`}>{d.date}</span>
                    <AnimatePresence>
                      {d.isCurrent && (
                        <motion.div 
                          layoutId="active-dot"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,168,107,0.5)]" 
                        />
                      )}
                    </AnimatePresence>
                  </button>
                ))}
              </div>
           </div>

           {/* Timeline Grid */}
           <div className="flex-1 overflow-y-auto p-4 sm:p-10 relative">
              <div className="space-y-0 relative">
                 {/* Current Time Indicator */}
                 <div className="absolute left-16 sm:left-24 right-0 top-[140px] border-t-2 border-dashed border-primary/30 z-0 pointer-events-none">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse" />
                 </div>

                  {timeSlots.map((time) => {
                    const dayAppointments = filteredAppointments.filter((a: any) => a.time === time);
                    return (
                      <div key={time} className="group flex min-h-[120px] border-b border-border-dark/5 last:border-0 relative">
                         <div className="w-16 sm:w-24 pt-4 shrink-0">
                            <span className="text-[11px] sm:text-sm font-black text-text-muted/60 tabular-nums group-hover:text-primary transition-colors">{time}</span>
                         </div>
                         <div className="flex-1 pl-4 sm:pl-10 relative border-l border-border-dark/10 group-hover:border-primary/20 transition-all">
                            {dayAppointments.map((appt: any) => (
                              <motion.div
                                key={appt.id}
                                layoutId={appt.id}
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                className={`p-6 rounded-4xl border-2 shadow-xl shadow-black/2 flex items-center justify-between group/appt hover:shadow-2xl hover:translate-x-1 transition-all cursor-pointer relative z-10 focus-within:z-50 mb-4 last:mb-0 ${
                                  appt.type === 'Home' ? 'bg-orange-50/50 border-orange-200' : 'bg-blue-50/50 border-blue-200'
                                }`}
                              >
                                 <div className="flex items-center gap-5">
                                     <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-white shadow-xl group-hover/appt:scale-110 transition-transform ${
                                      appt.type === 'Home' ? 'bg-orange-500' : 'bg-blue-600'
                                    }`}>
                                       <User className="w-7 h-7" />
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-3 mb-1.5">
                                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg ${
                                            appt.type === 'Home' ? 'bg-orange-500/10 text-orange-600' : 'bg-blue-600/10 text-blue-600'
                                          }`}>
                                             {appt.type} Visit 
                                          </span>
                                          <span className="text-[10px] font-black text-text-muted tracking-widest opacity-40">/ {appt.duration}</span>
                                       </div>
                                       <h4 className="text-lg font-black text-dark-light tracking-tight">{appt.patient}</h4>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-10">
                                    <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                      appt.status === 'Arrived' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' :
                                      appt.status === 'On Route' ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm' :
                                      appt.status === 'Confirmed' ? 'bg-amber-50 text-amber-600 border border-amber-200 shadow-sm' :
                                      'bg-white text-text-muted border border-border-dark'
                                    }`}>
                                       <span className="flex items-center gap-2">
                                         {appt.status === 'Arrived' && <Check className="w-3 h-3" />}
                                         {appt.status}
                                       </span>
                                    </div>
                                    <BookingActions 
                                      bookingId={appt.id} 
                                      patientName={appt.patient}
                                      onStatusUpdate={handleStatusUpdate}
                                      onCancel={handleCancel}
                                    />
                                 </div>
                              </motion.div>
                            ))}
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>

      {/* Add Appointment Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Quick Schedule"
      >
        <form onSubmit={handleAddAppt} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Patient Identity</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input 
                required
                type="text" 
                placeholder="Ex. Rahul Sharma"
                value={newAppt.patient}
                onChange={e => setNewAppt({...newAppt, patient: e.target.value})}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-surface border border-border-dark focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-bold text-dark-light transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Time Slot</label>
              <select 
                value={newAppt.time}
                onChange={e => setNewAppt({...newAppt, time: e.target.value})}
                className="w-full px-4 py-4 rounded-2xl bg-surface border border-border-dark focus:border-primary outline-none font-bold text-dark-light appearance-none transition-all"
              >
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Visit Type</label>
              <div className="flex p-1 bg-surface border border-border-dark rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setNewAppt({...newAppt, type: 'Home'})}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newAppt.type === 'Home' ? 'bg-primary text-white shadow-lg' : 'text-text-muted'}`}
                >Home</button>
                <button 
                  type="button"
                  onClick={() => setNewAppt({...newAppt, type: 'Lab'})}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newAppt.type === 'Lab' ? 'bg-primary text-white shadow-lg' : 'text-text-muted'}`}
                >Lab</button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              disabled={quickScheduleMutation.isPending}
              type="submit"
               className="w-full py-5 rounded-full bg-dark text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-dark/20 hover:bg-dark-light hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {quickScheduleMutation.isPending ? (
                <>Syncing Schedule... <Loader2 className="w-4 h-4 animate-spin" /></>
              ) : (
                <>Confirm Appointment <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> </>
              )}
            </button>
          </div>
        </form>
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
