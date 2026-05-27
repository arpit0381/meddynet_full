'use client';

import { Job } from '@/store/jobStore';
import { JobCard } from './JobCard';

interface HorizontalJobScrollerProps {
  jobs: Job[];
  onAccept: (job: Job) => void;
}

export const HorizontalJobScroller = ({ jobs, onAccept }: HorizontalJobScrollerProps) => {
  return (
    <div className="relative group">
      <div className="flex overflow-x-auto gap-6 pb-8 snap-x no-scrollbar scroll-smooth px-1">
        {jobs.map((job, index) => (
          <div key={job.id} className="min-w-[280px] xs:min-w-[320px] md:min-w-[400px] snap-center">
            <JobCard job={job} onAccept={onAccept} index={index} />
          </div>
        ))}
      </div>
      
      {/* Decorative fade edges */}
      <div className="absolute top-0 left-0 bottom-8 w-12 bg-linear-to-r from-gray-50/0 to-transparent pointer-events-none md:from-gray-50/50"></div>
      <div className="absolute top-0 right-0 bottom-8 w-12 bg-linear-to-l from-gray-50/0 to-transparent pointer-events-none md:from-gray-50/50"></div>
    </div>
  );
};
