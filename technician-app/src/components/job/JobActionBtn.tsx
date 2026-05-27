import { Button } from '@/components/ui/button';
import { JobStatus } from '@/store/jobStore';
import { CheckCircle2, Navigation, MapPin, LucideIcon } from 'lucide-react';

export const STATUS_CONFIG: Record<JobStatus, { label: string, color: string, next: JobStatus | null, icon: LucideIcon }> = {
  pending: { label: 'Pending', color: 'bg-gray-300', next: 'confirmed', icon: CheckCircle2 },
  confirmed: { label: 'Confirm Job', color: 'bg-emerald-500', next: 'assigned', icon: CheckCircle2 },
  assigned: { label: 'Start Journey', color: 'bg-blue-600', next: 'on_the_way', icon: Navigation },
  on_the_way: { label: 'Mark Arrived', color: 'bg-orange-500', next: 'arrived', icon: MapPin },
  arrived: { label: 'Collect Sample', color: 'bg-purple-600', next: 'sample_collected', icon: CheckCircle2 },
  sample_collected: { label: 'Submit Report', color: 'bg-gray-900', next: 'report_ready', icon: CheckCircle2 },
  report_ready: { label: 'Completed', color: 'bg-emerald-500', next: 'completed', icon: CheckCircle2 },
  completed: { label: 'Success', color: 'bg-gray-400', next: null, icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', next: null, icon: CheckCircle2 }
};

interface JobActionBtnProps {
  status: JobStatus;
  onClick: (nextStatus: JobStatus) => void;
}

export const JobActionBtn = ({ status, onClick }: JobActionBtnProps) => {
  const currentConfig = STATUS_CONFIG[status];
  
  if (!currentConfig || !currentConfig.next) return null;

  const ActionIcon = currentConfig.icon;

  return (
    <div
      className="w-full mt-2 transition-transform duration-300 hover:scale-105 active:scale-95"
    >
      <Button 
        className={`w-full h-16 ${currentConfig.color} text-white rounded-2xl font-black text-xl shadow-xl flex items-center justify-center gap-3 border-none relative overflow-hidden group`}
        onClick={() => onClick(currentConfig.next!)}
      >
        <span className="relative z-10 flex items-center gap-2">
          {currentConfig.label}
          <ActionIcon size={24} className={status === 'assigned' ? 'animate-pulse' : ''} strokeWidth={2.5} />
        </span>
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-[0%] transition-transform duration-300 ease-out z-0"></div>
      </Button>
    </div>
  );
};
