import { JobStatus } from '@/store/jobStore';
import { Check } from 'lucide-react';

const STATUS_ORDER: JobStatus[] = ['assigned', 'on_the_way', 'arrived', 'sample_collected', 'report_ready', 'completed'];
const STATUS_LABELS: Partial<Record<JobStatus, string>> = {
  assigned: 'Assigned',
  on_the_way: 'On Way',
  arrived: 'Arrived',
  sample_collected: 'Collected',
  report_ready: 'Reported',
  completed: 'Done'
};

export const JobProgressTracking = ({ currentStatus }: { currentStatus: JobStatus }) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="w-full mb-8 mt-2 px-1">
      <div className="relative flex justify-between items-center h-12">
        {/* Background Grey Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
        
        {/* Active Animated Green Line */}
        <div 
          className="absolute top-1/2 left-0 h-1.5 bg-linear-to-r from-[#00A86B] to-[#00d084] -translate-y-1/2 rounded-full z-10 shadow-[0_0_12px_rgba(0,168,107,0.4)] transition-all duration-700 ease-out"
          style={{ width: `${(currentIndex / Math.max(1, STATUS_ORDER.length - 1)) * 100}%` }}
        />
        
        {STATUS_ORDER.map((status, index) => {
          const isCompleted = index <= currentIndex;
          const isActive = index === currentIndex;
          
          return (
            <div key={status} className="relative z-20 flex flex-col items-center">
              <div 
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 relative ${
                  isActive ? 'scale-125 sm:scale-150 bg-white border-[#00d084] shadow-[0_0_15px_rgba(0,168,107,0.4)]' 
                  : isCompleted ? 'bg-[#00A86B] border-[#00A86B]' 
                  : 'bg-white border-gray-200'
                }`}
              >
                {isCompleted ? (
                  <div className="animate-in zoom-in fade-in duration-300">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={3.5} />
                  </div>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                )}
              </div>

              <div className="absolute top-10 whitespace-nowrap hidden sm:block">
                <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider transition-colors duration-500 ${
                  isActive ? 'text-[#00A86B]' : (isCompleted ? 'text-gray-800' : 'text-gray-400')
                }`}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
              <div className="absolute top-8 whitespace-nowrap block sm:hidden">
                <span className={`text-[8px] font-black uppercase tracking-widest transition-colors duration-500 ${
                  isActive ? 'text-[#00A86B]' : 'hidden'
                }`}>
                  {STATUS_LABELS[status]}
                </span>
              </div>

              {isActive && (
                <div 
                  className="absolute -inset-2 bg-[#00A86B]/10 rounded-full -z-10 blur-sm animate-pulse"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
