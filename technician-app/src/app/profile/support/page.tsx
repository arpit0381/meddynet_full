'use client';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { CircleHelp, MessageSquare, Phone, FileQuestion, ChevronRight, Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function SupportPage() {
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const startDiagnostics = () => {
    setIsDiagnosing(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 3000)),
      {
        loading: 'Running edge-telemery scan...',
        success: () => {
          setIsDiagnosing(false);
          return 'Tactical diagnostic complete. All hardware nominal.';
        },
        error: 'Hardware scan failed.'
      }
    );
  };

  const contactSupport = (type: string) => {
    toast.info(`Protocol Initiated`, {
      description: `Connecting to ${type} officers. High priority...`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <SubPageHeader title="Help & Support" description="Support Command Center" />
      
      <div className="max-w-4xl mx-auto p-5 space-y-8">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-white relative overflow-hidden">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">How can we help?</h2>
          <p className="text-gray-400 font-bold text-sm mb-6">Our tactical support team is active 24/7.</p>
          
          <div className="relative">
             <input 
               type="text" 
               placeholder="Search tactical protocols..." 
               className="w-full h-14 bg-gray-50 border-transparent rounded-2xl px-12 font-bold text-sm focus:bg-white focus:border-[#00A86B] focus:ring-4 focus:ring-[#00A86B]/10 transition-all outline-none"
             />
             <CircleHelp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Fleet Chat', desc: 'Real-time officer support', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
            { title: 'Emergency Call', desc: 'Direct protocol line', icon: Phone, color: 'text-red-500', bg: 'bg-red-50' },
          ].map((item) => (
            <button 
              key={item.title} 
              onClick={() => contactSupport(item.title)}
              className="bg-white p-6 rounded-[2rem] shadow-lg shadow-black/2 border border-white flex items-start gap-4 hover:shadow-xl transition-all active:scale-95 text-left"
            >
               <div className={`p-4 rounded-2xl ${item.bg}`}>
                  <item.icon className={`${item.color} w-6 h-6`} />
               </div>
               <div className="pt-1">
                 <h4 className="font-black text-gray-900 leading-none">{item.title}</h4>
                 <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">{item.desc}</p>
               </div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-white overflow-hidden p-2">
          <button 
            onClick={() => toast('Loading FAQ content...')}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-all border-b border-gray-50 rounded-2xl bg-white"
          >
             <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <FileQuestion className="text-gray-400 w-5 h-5" />
                </div>
                <span className="font-black text-gray-800 tracking-tight">Tactical FAQ</span>
             </div>
             <ChevronRight className="text-gray-200 w-6 h-6" />
          </button>

          <button 
            onClick={startDiagnostics}
            disabled={isDiagnosing}
            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-all rounded-2xl bg-white disabled:opacity-50"
          >
             <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  {isDiagnosing ? <Loader2 className="text-blue-500 w-5 h-5 animate-spin" /> : <Activity className="text-gray-400 w-5 h-5" />}
                </div>
                <span className="font-black text-gray-800 tracking-tight">System Diagnostics</span>
             </div>
             <ChevronRight className="text-gray-200 w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
