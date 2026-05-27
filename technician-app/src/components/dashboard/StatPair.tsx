'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, IndianRupee, TrendingUp, ArrowUpRight } from 'lucide-react';

interface StatPairProps {
  pendingCount: number;
  earnings: number;
}

export const StatPair = ({ pendingCount, earnings }: StatPairProps) => {
  return (
    <>
      <div 
        className="h-full animate-in slide-in-from-bottom-4 fade-in duration-500"
      >
        <Card className="border-0 shadow-2xl shadow-black/3 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden relative group h-full bg-white transition-all hover:shadow-black/6">
          <div className="absolute -right-6 -top-6 w-24 h-24 sm:w-32 sm:h-32 bg-blue-50/50 rounded-full z-0 transition-transform group-hover:scale-150 duration-700"></div>
          <CardContent className="p-4 sm:p-8 flex flex-col items-start justify-between h-full border-none relative z-10">
            <div className="flex justify-between items-start w-full mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm border border-blue-100/50 group-hover:rotate-6 transition-transform shrink-0">
                <CheckCircle2 className="text-blue-600 w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div className="p-1 sm:p-1.5 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                <ArrowUpRight size={12} className="sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            <div>
              <span className="text-3xl sm:text-5xl font-black text-gray-900 leading-none tracking-tighter">{pendingCount}</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                <span className="text-[8px] sm:text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Pending Tasks</span>
                <span className="w-fit px-1.5 sm:px-2 py-0.5 bg-blue-50 text-blue-600 text-[7px] sm:text-[9px] font-black rounded-full uppercase">Duty</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div 
        className="h-full animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100"
      >
        <Card className="border-0 shadow-2xl shadow-black/3 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden relative group h-full bg-white transition-all hover:shadow-black/6">
          <div className="absolute -right-6 -top-6 w-24 h-24 sm:w-32 sm:h-32 bg-[#00A86B]/5 rounded-full z-0 transition-transform group-hover:scale-150 duration-700"></div>
          <CardContent className="p-4 sm:p-8 flex flex-col items-start justify-between h-full border-none relative z-10">
            <div className="flex justify-between items-start w-full mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-linear-to-br from-green-50 to-[#00A86B]/10 flex items-center justify-center shadow-sm border border-green-100/50 group-hover:rotate-6 transition-transform shrink-0">
                <IndianRupee className="text-[#00A86B] w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div className="p-1 sm:p-1.5 bg-green-50 rounded-lg text-[#00A86B] shrink-0">
                <TrendingUp size={12} className="sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            <div>
              <span className="text-2xl xs:text-3xl sm:text-5xl font-black text-gray-900 leading-none tracking-tighter truncate w-full block">₹{earnings}</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                <span className="text-[8px] sm:text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Daily Earnings</span>
                <span className="w-fit px-1.5 sm:px-2 py-0.5 bg-green-50 text-[#00A86B] text-[7px] sm:text-[9px] font-black rounded-full uppercase">Payout</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
