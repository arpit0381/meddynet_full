'use client';

import { Job } from '@/store/jobStore';
import { Card, CardContent } from '@/components/ui/card';
import { MapPinned, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const ActiveJobBanner = ({ job }: { job: Job }) => {
  return (
    <Card className="border-0 shadow-2xl shadow-[#00A86B]/10 rounded-[2.5rem] overflow-hidden bg-white mb-2 group">
      <div className="bg-linear-to-r from-[#00A86B] to-[#01c680] text-white px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
          Ongoing Mission
        </span>
        <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
          {job.status.replace(/_/g, ' ')}
        </span>
      </div>
      <CardContent className="p-8 border-none relative">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-16 h-16 rounded-[1.5rem] bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center shrink-0 border border-green-100/50 shadow-inner group-hover:scale-110 transition-transform">
            <MapPinned className="text-[#00A86B] w-8 h-8" />
          </div>
          <div className="pt-1">
            <h3 className="font-black text-2xl text-gray-900 leading-tight tracking-tighter">{job.patient_name}</h3>
            <div className="flex items-center gap-1.5 text-gray-400 mt-2">
              <User size={14} className="text-[#00A86B]" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Job ID: {job.id}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50/50 rounded-3xl p-5 mb-8 border border-gray-100">
           <p className="text-xs text-gray-500 font-bold leading-relaxed line-clamp-2">{job.address}</p>
        </div>

        <Link href={`/job/${job.id}`} className="block w-full">
          <Button className="w-full bg-gray-900 hover:bg-black text-white h-16 rounded-[1.5rem] font-black text-lg shadow-xl shadow-black/10 flex gap-3 items-center justify-center transition-all active:scale-[0.98] group-hover:shadow-[#00A86B]/20">
            Open Map Controls
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
