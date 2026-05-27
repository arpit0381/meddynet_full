import { Job } from '@/store/jobStore';
import { Phone } from 'lucide-react';

interface JobHeaderProps {
  job: Job;
}

export const JobHeader = ({ job }: JobHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="text-xl font-black text-main-text tracking-tight">{job.patient_name}</h2>
        <div className="flex items-center text-sm font-medium text-gray-500 mt-1">
          Status: <span className="ml-1 text-[#00A86B] font-bold">{job.status.replace(/_/g, ' ')}</span>
        </div>
      </div>
      <a href={`tel:${job.patient_phone || '+91 98765 43210'}`} className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-green-100/50 hover:bg-green-200 transition-colors">
        <span className="font-medium">{job.patient_phone || '+91 98765 43210'}</span>
      </a>
    </div>
  );
};
