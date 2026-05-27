'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const SubPageHeader = ({ title, description }: { title: string; description?: string }) => {
  const router = useRouter();
  
  return (
    <div className="bg-white border-b border-gray-100 px-6 py-6 sticky top-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2.5 hover:bg-gray-50 rounded-xl transition-all active:scale-90 border border-transparent hover:border-gray-100 group"
        >
          <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">{title}</h1>
          {description && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5">{description}</p>}
        </div>
      </div>
    </div>
  );
};
