'use client';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { Shield, Eye, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <SubPageHeader title="Privacy Policy" description="Security Protocols" />
      
      <div className="max-w-4xl mx-auto p-5 space-y-6">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100">
               <Shield className="text-[#00A86B] w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Data Integrity</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Updated: March 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-gray-600">
            <section>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                Transparency
              </h3>
              <p className="text-sm leading-relaxed font-medium">We collect real-time location and telemetry data strictly for fleet synchronization and task allocation purposes.</p>
            </section>

            <section>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-500" />
                Encryption
              </h3>
              <p className="text-sm leading-relaxed font-medium">All technician communications and PII are secured using military-grade AES-256 encryption at rest and in transit.</p>
            </section>

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">You maintain control</h4>
              <ul className="space-y-3">
                {['Opt-out of data telemetry anytime', 'Request full data deletion', 'Access tactical history logs'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            toast.success('Terms Accepted', { description: 'Security protocols have been synchronized.' });
            router.back();
          }}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all"
        >
          Accept & Continue
        </button>
      </div>
    </div>
  );
}
