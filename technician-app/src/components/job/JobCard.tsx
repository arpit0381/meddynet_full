import { Job } from '@/store/jobStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, IndianRupee, Clock } from 'lucide-react';
import Link from 'next/link';

interface JobCardProps {
  job: Job;
  onAccept: (job: Job) => void;
  index?: number;
}

export const JobCard = ({ job, onAccept, index = 0 }: JobCardProps) => {
  const isAvailable = job.status === 'confirmed';

  return (
    <div 
      className="h-full animate-in zoom-in-95 fade-in duration-500"
      style={{ animationDelay: `${0.1 * index}s`, animationFillMode: 'both' }}
    >
      <Card className="border-0 shadow-2xl shadow-black/3 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden transition-all hover:shadow-[#00A86B]/10 hover:-translate-y-1 bg-white flex flex-col h-full group">
        <CardContent className="p-5 sm:p-8 flex flex-col gap-4 sm:gap-6 border-none flex-1">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                 <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isAvailable ? 'bg-blue-500' : 'bg-[#00A86B]'} animate-pulse`}></span>
                 <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                   {isAvailable ? 'Available for Collection' : 'Security Clearance Priority'}
                 </span>
              </div>
              <h3 className="font-black text-xl sm:text-2xl text-gray-900 tracking-tighter leading-none group-hover:text-[#00A86B] transition-colors">{job.patient_name}</h3>
            </div>
            <div className="flex flex-col items-end shrink-0 bg-green-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-green-100/50 shadow-inner group-hover:bg-[#00A86B] group-hover:text-white transition-colors duration-300">
              <div className="flex items-center gap-1 font-black text-base sm:text-xl leading-none">
                <IndianRupee size={14} className="sm:w-4 sm:h-4" />
                <span>{job.total_amount / 100}</span>
              </div>
              <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest mt-0.5 sm:mt-1 opacity-60">Est. Reward</span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 flex-1">
            <div className="flex items-start text-xs sm:text-sm text-gray-500 font-medium bg-gray-50/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100/30 group-hover:bg-white group-hover:border-gray-100 transition-all">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2.5 sm:mr-3 text-[#00A86B] shrink-0 mt-0.5" />
              <span className="leading-snug pr-2 text-gray-600 font-bold">{job.address}</span>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 px-1">
               <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Clock size={12} className="text-blue-500 sm:w-3.5 sm:h-3.5" />
                  <span>{new Date(job.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
               </div>
               <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gray-300"></div>
               <div className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                  <span>{job.type.replace('_', ' ')}</span>
               </div>
            </div>
          </div>

          {isAvailable ? (
            <Button 
                onClick={(e) => { e.preventDefault(); onAccept(job); }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black shadow-lg shadow-blue-600/10 flex justify-center items-center gap-2 sm:gap-3 group transition-all active:scale-95"
            >
                <span className="text-sm sm:text-base">Self Assign Job</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          ) : (
            <Link href={`/job/${job.id}`} className="block w-full mt-auto">
                <Button 
                className="w-full bg-gray-900 hover:bg-black text-white h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black shadow-lg shadow-black/10 flex justify-center items-center gap-2 sm:gap-3 group transition-all active:scale-95"
                >
                <span className="text-sm sm:text-base">Review Assignment</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform" />
                </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
