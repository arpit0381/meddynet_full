'use client';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { Zap, Target, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [fleetUpdates, setFleetUpdates] = useState(false);

  const handleToggle = (title: string, current: boolean, setter: (val: boolean) => void) => {
    setter(!current);
    toast.success(`Protocol Updated`, {
      description: `${title} is now ${!current ? 'active' : 'inactive'}.`,
    });
  };

  const menuItems = [
    { title: 'New Assignments', desc: 'Instant alerts for live tactical tasks.', icon: Target, state: assignmentAlerts, setter: setAssignmentAlerts, bg: 'bg-purple-50', color: 'text-purple-500' },
    { title: 'Fleet Ops Updates', desc: 'Critical protocol and hub changes.', icon: Zap, state: fleetUpdates, setter: setFleetUpdates, bg: 'bg-yellow-50', color: 'text-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <SubPageHeader title="Notifications" description="Protocol Communication" />
      
      <div className="max-w-4xl mx-auto p-5 space-y-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-white overflow-hidden p-2">
          {menuItems.map((item) => (
            <div key={item.title} className="flex items-center justify-between p-6 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center border border-black/5`}>
                  <item.icon className={`${item.color} w-5 h-5`} />
                </div>
                <div>
                  <h3 className="font-black text-gray-800 tracking-tight">{item.title}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.desc}</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle(item.title, item.state, item.setter)}
                className={`w-14 h-8 rounded-full relative transition-all duration-300 active:scale-95 ${item.state ? 'bg-[#00A86B]' : 'bg-gray-200 shadow-inner'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${item.state ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-red-500/20 rounded-2xl">
              <AlertTriangle className="text-red-400 w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight mb-1">Emergency Protocols</h3>
              <p className="text-white/50 text-xs font-bold leading-relaxed">High-priority emergency alerts bypass all silence modes for your safety.</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-4 px-6 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-xs font-black uppercase tracking-widest text-white/80">Always Locked</span>
            <div className="w-14 h-8 bg-[#00A86B] rounded-full flex items-center px-1">
              <div className="w-6 h-6 bg-white rounded-full shadow-md ml-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
