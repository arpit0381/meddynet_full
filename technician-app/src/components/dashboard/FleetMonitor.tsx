'use client';


import { Users, Wifi, Navigation2, Radar } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const TEAM_MEMBERS = [
  { name: 'Rahul S.', status: 'online', distance: '1.2 km' },
  { name: 'Anita K.', status: 'online', distance: '3.5 km' },
];

export const FleetMonitor = () => {
  const [isScanning, setIsScanning] = useState(false);

  const handleTrackMember = (member: typeof TEAM_MEMBERS[0]) => {
    toast.info(`Tracking ${member.name}`, {
      description: `Target is ${member.distance} away. Opening tactical map...`,
      icon: <Navigation2 className="w-4 h-4 text-blue-500" />,
    });
  };

  const handleGlobalMap = () => {
    setIsScanning(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Interacting with Fleet Ops Hub...',
        success: () => {
          setIsScanning(false);
          return 'Fleet Synchronized! All units visible.';
        },
        error: 'Connection Lost',
      }
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-7 shadow-2xl shadow-black/2 border border-gray-50 group hover:shadow-[#00A86B]/5 transition-all flex flex-col justify-between h-full min-h-[340px] relative overflow-hidden">
      
      {/* Background Pulse for "Live" feel */}
      {isScanning && (
        <div className="absolute inset-0 bg-[#00A86B]/5 z-0 pointer-events-none animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-[#00A86B] rounded-full filter blur-3xl opacity-10 animate-pulse" />
        </div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isScanning ? 'bg-[#00A86B] text-white' : 'bg-green-50 text-[#00A86B]'}`}>
               <Users className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-black tracking-tight text-gray-900 leading-none">Nearby Team</h3>
              <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{TEAM_MEMBERS.length} Active Technicians</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-100/50">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
             <span className="text-[8px] font-black text-[#00A86B] uppercase tracking-widest">Live</span>
          </div>
        </div>

        <div className="space-y-3">
          {TEAM_MEMBERS.map((member, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between group/item p-4 bg-gray-50/50 rounded-2xl hover:bg-white transition-all duration-300 hover:translate-x-1 border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-black/2 animate-in slide-in-from-bottom-2 fade-in"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center font-black text-gray-800 text-[10px] group-hover/item:border-[#00A86B]/30 transition-colors">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1 animate-bounce">
                    <Wifi className="w-4 h-4 text-[#00A86B] bg-white rounded-full p-0.5 shadow-md border border-gray-50" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xs">{member.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></span>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{member.distance}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleTrackMember(member)}
                className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-[#00A86B] hover:border-[#00A86B] group/btn transition-all shadow-sm active:scale-90"
              >
                 <Radar size={14} className="text-gray-400 group-hover/btn:text-white transition-colors" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={handleGlobalMap}
        disabled={isScanning}
        className={`w-full mt-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
          isScanning 
          ? 'bg-gray-100 text-gray-400 shadow-none' 
          : 'bg-gray-900 hover:bg-black text-white hover:shadow-black/20'
        }`}
      >
        {isScanning ? (
          <>
            <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
            Syncing Hub...
          </>
        ) : (
          <>
            <Navigation2 size={12} className="group-hover:translate-x-0.5 transition-transform" />
            Team Map
          </>
        )}
      </button>
    </div>
  );
};
