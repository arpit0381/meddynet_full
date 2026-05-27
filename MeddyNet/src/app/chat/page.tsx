"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  ChevronLeft, 
  Search,
  User,
  CheckCheck,
  Zap,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Stethoscope,
  TestTube2,
  CalendarCheck
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface Message {
  id: number;
  text: string;
  sender: "user" | "support";
  time: string;
  status?: "sent" | "delivered" | "read";
}

const quickReplies = [
  { icon: <TestTube2 className="w-4 h-4" />, text: "Book a Blood Test", color: "bg-emerald-50 text-emerald-600" },
  { icon: <Clock className="w-4 h-4" />, text: "Check Report Status", color: "bg-blue-50 text-blue-600" },
  { icon: <MapPin className="w-4 h-4" />, text: "Find Phlebotomist", color: "bg-orange-50 text-orange-600" },
  { icon: <CalendarCheck className="w-4 h-4" />, text: "Reschedule Booking", color: "bg-purple-50 text-purple-600" },
];

export default function ChatNowPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! Welcome to MeddyNet Support. How can we assist you today?",
      sender: "support",
      time: "10:30 AM",
      status: "read",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (text: string = inputText) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: text,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setIsTyping(true);

    // Mock response
    setTimeout(() => {
      setIsTyping(false);
      const supportResponse: Message = {
        id: messages.length + 2,
        text: "Thanks for reaching out! One of our health experts will be with you in less than a minute. In the meantime, you can check our lab partners nearby.",
        sender: "support",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, supportResponse]);
    }, 2000);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pt-20 md:pt-[100px] pb-6 md:pb-10 flex flex-col items-center px-2 sm:px-4">
      {/* ─── Background Decorations ─── */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-4xl bg-white/70 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] border border-white shadow-2xl overflow-hidden flex flex-col md:flex-row h-[calc(100vh-140px)] min-h-[500px] md:h-[750px] relative z-10 transition-all duration-500">
        
        {/* ─── Sidebar (Desktop) ─── */}
        <div className="hidden md:flex w-80 border-r border-slate-100 flex-col bg-slate-50/50">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-black text-dark tracking-tight">{t("chat.sidebarTitle")}</h2>
            <div className="mt-4 flex flex-col gap-2">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full ring-2 ring-emerald-500/20" />
                </div>
                <div>
                  <h3 className="font-bold text-dark text-sm">{t("chat.healthAssistant")}</h3>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-wider">{t("chat.onlineNow")}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t("chat.quickLinks")}</h4>
            <div className="space-y-2">
              {[
                { label: t("chat.myBookings"), icon: <CalendarCheck className="w-4 h-4" />, href: "/dashboard/bookings" },
                { label: t("chat.healthVault"), icon: <Zap className="w-4 h-4" />, href: "/dashboard/vault" },
                { label: t("chat.labLocations"), icon: <MapPin className="w-4 h-4" />, href: "/map" },
                { label: t("chat.meddyNetFaq"), icon: <Search className="w-4 h-4" />, href: "/faq" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="block w-full">
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm hover:text-primary transition-all text-slate-600 font-bold text-sm text-left">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    {item.label}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto p-6">
            <div className="p-5 rounded-2xl bg-dark text-white relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-xs font-bold text-primary mb-1">{t("chat.premiumTitle")}</p>
                <h4 className="text-sm font-black mb-2 leading-tight">{t("chat.premiumDesc")}</h4>
                <Link href="/" className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors">
                  {t("chat.learnMore")} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <Sparkles className="absolute -bottom-2 -right-2 w-16 h-16 text-white/5 group-hover:scale-125 transition-transform duration-700" />
            </div>
          </div>
        </div>

        {/* ─── Main Chat Area ─── */}
        <div className="flex-1 flex flex-col bg-white/40">
          
          {/* Header */}
          <header className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between backdrop-blur-md bg-white/60 min-h-[72px] sm:min-h-[88px]">
            <div className="flex items-center gap-3 md:gap-4">
              <Link href="/help-center" className="md:hidden p-2.5 rounded-xl bg-slate-50 text-slate-500 border border-slate-100 active:scale-90 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary relative shrink-0">
                  <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6" />
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-black text-dark text-sm sm:text-lg leading-tight truncate">{t("chat.liveSupport")}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 whitespace-nowrap">{t("chat.waitTime")}: <span className="text-emerald-600">~1 min</span></span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 relative">
              <button className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-primary hover:bg-white transition-all active:scale-90 hidden xs:flex">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-2 sm:p-2.5 rounded-xl border transition-all active:scale-90 ${isMenuOpen ? "bg-primary/10 border-primary text-primary" : "bg-slate-50 border-slate-100 text-slate-400 hover:text-primary hover:bg-white"}`}
                >
                  <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMenuOpen(false)}
                        className="fixed inset-0 z-40"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/50 p-2 z-50 origin-top-right overflow-hidden"
                      >
                        {[
                          { label: t("chat.menu.info"), icon: <User className="w-4 h-4" />, color: "text-slate-600", href: "/help-center" },
                          { 
                            label: t("chat.menu.clear"), 
                            icon: <Zap className="w-4 h-4" />, 
                            color: "text-rose-500", 
                            onClick: () => {
                              if (window.confirm(t("chat.menu.clear_confirm") || "Are you sure you want to clear the chat history?")) {
                                setMessages([messages[0]]);
                              }
                            } 
                          },
                          { label: t("chat.menu.report"), icon: <Sparkles className="w-4 h-4" />, color: "text-slate-600", href: "/contact" },
                          { 
                            label: t("chat.menu.export"), 
                            icon: <Paperclip className="w-4 h-4" />, 
                            color: "text-slate-600", 
                            onClick: () => {
                              const content = messages.map(msg => `[${msg.time}] ${msg.sender.toUpperCase()}: ${msg.text}`).join('\n');
                              const blob = new Blob([content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `MeddyNet_Chat_${new Date().toISOString().split('T')[0]}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            } 
                          },
                        ].map((item, idx) => {
                          const content = (
                            <>
                              <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all ${item.color}`}>
                                {item.icon}
                              </div>
                              <span className={item.color}>{item.label}</span>
                            </>
                          );

                          if (item.href) {
                            return (
                              <Link
                                key={idx}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold group"
                              >
                                {content}
                              </Link>
                            );
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                item.onClick?.();
                                setIsMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold group"
                            >
                              {content}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Messages Container */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 scroll-smooth"
          >
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] sm:max-w-[70%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                    <div className={`
                      px-5 py-3 rounded-2xl sm:rounded-3xl text-sm sm:text-base font-medium shadow-sm leading-relaxed
                      ${msg.sender === "user" 
                        ? "bg-primary text-white rounded-br-none" 
                        : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"}
                    `}>
                      {msg.text}
                    </div>
                    <div className={`mt-1.5 flex items-center gap-1.5 ${msg.sender === "user" ? "flex-reverse justify-end" : ""}`}>
                      <span className="text-[10px] font-bold text-slate-400">{msg.time}</span>
                      {msg.sender === "user" && (
                        <CheckCheck className={`w-3 h-3 ${msg.status === "read" ? "text-primary" : "text-slate-300"}`} />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white border border-slate-100 px-5 py-3 rounded-3xl rounded-bl-none flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Replies */}
          <div className="px-4 sm:px-8 py-2 overflow-x-auto no-scrollbar flex items-center gap-3">
            {quickReplies.map((reply) => (
              <button 
                key={reply.text} 
                onClick={() => handleSendMessage(reply.text)}
                className={`flex-none flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-100 text-[11px] sm:text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-sm bg-white hover:border-primary/30`}
              >
                <div className={`w-6 h-6 rounded-lg ${reply.color} flex items-center justify-center shrink-0`}>
                  {reply.icon}
                </div>
                <span className="text-slate-700">{reply.text}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <footer className="p-4 sm:p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100">
            <div className="flex items-center gap-3 sm:gap-4 max-w-4xl mx-auto">
              <button className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-primary transition-all active:scale-90">
                <Paperclip className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <div className="flex-1 relative">
                <input 
                  type="text"
                  placeholder={t("chat.inputPlaceholder")}
                  className="w-full bg-slate-100 border-none rounded-2xl sm:rounded-3xl px-5 sm:px-6 py-3.5 sm:py-4 pr-14 sm:pr-16 outline-none text-dark font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  suppressHydrationWarning
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95">
                  <Smile className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <button 
                onClick={() => handleSendMessage()}
                className={`
                  p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl font-bold transition-all flex items-center justify-center active:scale-90 shadow-xl
                  ${inputText.trim() 
                    ? "bg-primary text-white shadow-primary/20 hover:bg-primary-dark" 
                    : "bg-slate-100 text-slate-300 pointer-events-none"}
                `}
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <p className="text-center text-[11px] sm:text-xs font-medium text-slate-400 mt-3 md:mt-4 leading-relaxed">
              {t("chat.termsAgreement")}
            </p>
          </footer>
        </div>
      </div>

      {/* ─── Footer Text ─── */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-slate-400 font-bold text-sm tracking-wide"
      >
        Proudly part of the <span className="text-dark">MeddyNet Health Ecosystem</span>
      </motion.p>
    </div>
  );
}
