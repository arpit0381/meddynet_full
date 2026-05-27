'use client';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { CreditCard, Plus, ShieldCheck, ArrowUpRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdrawal = () => {
    setIsWithdrawing(true);
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2500)),
      {
        loading: 'Processing tactical payout...',
        success: () => {
          setIsWithdrawing(false);
          return 'Funds transferred to primary settlement account.';
        },
        error: 'Network connectivity lost during transfer.'
      }
    );
  };

  const handleAddAccount = () => {
    toast.info('Secure Link Active', {
      description: 'Redirecting to verified banking portal...',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <SubPageHeader title="Payment Methods" description="Fleet Wallet" />
      
      <div className="max-w-4xl mx-auto p-5 space-y-6">
        
        {/* Wallet Balance */}
        <div className="bg-[#00A86B] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-[#00A86B]/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">Available Payout</p>
          <h2 className="text-5xl font-black tracking-tighter mb-8">₹14,250.00</h2>
          
          <div className="flex gap-3 relative z-10">
            <button 
              onClick={handleWithdrawal}
              disabled={isWithdrawing}
              className="flex-1 py-4 bg-white text-[#00A86B] rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Withdraw Funds <ArrowUpRight className="w-4 h-4" />
                </>
              )}
            </button>
            <button 
              onClick={handleAddAccount}
              className="p-4 bg-black/10 hover:bg-black/20 rounded-2xl transition-all border border-white/10"
            >
              <Plus className="text-white w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Saved Cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Verified Sources</h3>
          
          <div 
            onClick={() => toast.success('Primary account active')}
            className="bg-white rounded-[2rem] p-6 shadow-xl shadow-black/5 border border-white flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-10 bg-gray-900 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden relative">
                 <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent"></div>
                 <CreditCard className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-gray-900 leading-tight">•••• 4412</p>
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1">Primary Settlement</p>
              </div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
               <ShieldCheck className="text-[#00A86B] w-4 h-4" />
            </div>
          </div>

          <button 
            onClick={handleAddAccount}
            className="w-full py-6 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-white hover:border-[#00A86B]/30 hover:text-[#00A86B] transition-all group group font-black text-xs text-gray-400 uppercase tracking-widest active:scale-[0.99]"
          >
             <Plus className="w-6 h-6 mb-1 text-gray-300 group-hover:text-[#00A86B]" />
             Add New Account
          </button>
        </div>
      </div>
    </div>
  );
}
