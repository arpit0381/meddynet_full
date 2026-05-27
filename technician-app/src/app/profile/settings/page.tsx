'use client';

import { SubPageHeader } from '@/components/layout/SubPageHeader';
import { Moon, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [language, setLanguage] = useState('English (US)');

  const handleToggle = (setting: { title: string, value: boolean, setter: (val: boolean) => void }) => {
    setting.setter(!setting.value);
    toast.success(`${setting.title} Updated`, {
      description: `${setting.title} is now ${!setting.value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    toast.info('Language Updated', {
      description: `Tactical interface switched to ${lang}.`,
      icon: <Globe className="w-4 h-4 text-blue-500" />
    });
  };

  const settingsItems = [
    { title: 'Dark Mode', description: 'Switch to a darker tactical interface.', icon: Moon, value: darkMode, setter: setDarkMode },
    { title: 'Biometric Access', description: 'Enable fingerprint or face unlock.', icon: ShieldCheck, value: biometric, setter: setBiometric },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <SubPageHeader title="App Settings" description="System Preferences" />
      
      <div className="max-w-4xl mx-auto p-5 space-y-6">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-white overflow-hidden p-2">
          {settingsItems.map((item) => (
            <div key={item.title} className="flex items-center justify-between p-6 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100/50 shadow-sm">
                  <item.icon className="text-blue-500 w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-gray-800 tracking-tight">{item.title}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.description}</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle(item)}
                className={`w-14 h-8 rounded-full relative transition-all duration-300 active:scale-95 ${item.value ? 'bg-[#00A86B]' : 'bg-gray-200 shadow-inner'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${item.value ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-white p-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">App Language</h3>
          <div className="grid grid-cols-2 gap-3">
            {['English (US)', 'Hindi (Beta)'].map((lang) => (
              <button 
                key={lang} 
                onClick={() => handleLanguageChange(lang)}
                className={`p-4 rounded-2xl border-2 font-black text-sm transition-all relative overflow-hidden group/lang active:scale-95 ${language === lang ? 'border-[#00A86B] bg-green-50 text-[#00A86B]' : 'border-gray-100 text-gray-400 hover:border-gray-200 bg-white'}`}
              >
                {language === lang && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
                  </motion.div>
                )}
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
