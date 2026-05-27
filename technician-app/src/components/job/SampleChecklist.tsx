'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, ClipboardCheck, Sparkles } from 'lucide-react';

const CHECKLIST_ITEMS = [
  'Verify Patient ID',
  'Check Sample Vials Sealing',
  'Sanitize Collection Kit',
  'Pack in Temperature Control Bag'
];

export const SampleChecklist = ({ onComplete }: { onComplete: () => void }) => {
  const [checked, setChecked] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    const newChecked = checked.includes(index) 
      ? checked.filter(i => i !== index)
      : [...checked, index];
    
    setChecked(newChecked);
    
    if (newChecked.length === CHECKLIST_ITEMS.length) {
      setTimeout(onComplete, 500);
    }
  };

  return (
    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
      
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <ClipboardCheck className="text-[#00A86B] w-6 h-6" />
        <h3 className="text-xl font-black tracking-tight">Presampling Checklist</h3>
      </div>

      <div className="space-y-4 relative z-10">
        {CHECKLIST_ITEMS.map((item, i) => {
          const isChecked = checked.includes(i);
          return (
            <button 
              key={i} 
              onClick={() => toggleItem(i)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border ${
                isChecked ? 'bg-[#00A86B]/20 border-[#00A86B] text-white' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {isChecked ? <CheckSquare className="text-[#00A86B] w-6 h-6" /> : <Square className="w-6 h-6" />}
              <span className={`text-sm font-bold ${isChecked ? 'line-through opacity-60' : ''}`}>{item}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {checked.length === CHECKLIST_ITEMS.length && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 bg-[#00A86B] rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#00A86B]/20"
          >
            <Sparkles size={20} />
            <span className="font-black text-sm uppercase tracking-widest">Verification Complete</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
