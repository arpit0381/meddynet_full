"use client";

import { use, useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Paperclip,
    Smile,
    MoreVertical,
    ChevronLeft,
    User,
    CheckCheck,
    Zap,
    Clock,
    TestTube2,
    CalendarCheck,
    ShieldCheck,
    Info,
    Image as ImageIcon,
    FileText
} from "lucide-react";
import Link from "next/link";
import { recentBookings } from "@/data/dashboard";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

interface Message {
    id: number;
    text: string;
    sender: "user" | "lab";
    time: string;
    status: "sent" | "delivered" | "read";
}

const quickReplies = [
    { icon: <TestTube2 className="w-4 h-4" />, text: "When will my report be ready?", color: "bg-blue-50 text-blue-600" },
    { icon: <Clock className="w-4 h-4" />, text: "Is my technician on the way?", color: "bg-amber-50 text-amber-600" },
    { icon: <ShieldCheck className="w-4 h-4" />, text: "Is this test fasting required?", color: "bg-emerald-50 text-emerald-600" },
];

export default function LabChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuthStore();
    const booking = recentBookings.find((b) => b.id === id);

    const initialMessage = useMemo(() => {
        if (!booking) return [];
        return [{
            id: 1,
            text: `Hello! This is MeddyNet Support for ${booking.labName}. How can we assist you with your booking ${id} today?`,
            sender: "lab" as const,
            time: "Just now",
            status: "read" as const,
        }];
    }, [booking, id]);

    const [messages, setMessages] = useState<Message[]>(initialMessage);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!user) return;
        
        // Connect to generalized support channel for this booking
        const wsHost = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000';
        const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = new WebSocket(`${wsProtocol}://${wsHost}/ws/patient/${user.id}`);
        wsRef.current = ws;

        ws.onopen = () => {
             // Connection established
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "support_message" || data.type === "message") {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now(),
                        text: data.text || data.message,
                        sender: data.sender === "admin" || data.sender === "lab" ? "lab" : "user",
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: "read",
                    }
                ]);
                if (data.sender !== "user") {
                    setIsTyping(false);
                    toast.info(`New message from ${booking?.labName || 'Support'}`);
                }
            }
        };

        ws.onclose = () => { /* disconnected */ };

        return () => {
            ws.close();
        };
    }, [user, id, booking?.labName]);




    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    if (!booking) {
        return (
            <div className="max-w-[700px] mx-auto py-24 text-center px-6">
                <div className="w-24 h-24 bg-surface rounded-[40px] flex items-center justify-center mx-auto mb-6 border border-border">
                    <User className="w-10 h-10 text-text-light" />
                </div>
                <h2 className="text-3xl font-black text-dark-light tracking-tight">Booking Record Not Found</h2>
                <p className="text-text-secondary font-medium max-w-xs mx-auto mb-8">The requested identifier {id} could not be synchronized.</p>
                <Link href="/dashboard/bookings" className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-primary/20">
                    <ChevronLeft className="w-4 h-4" /> Return to Hub
                </Link>
            </div>
        );
    }

    const handleSendMessage = (text: string = inputText) => {
        const messageText = typeof text === 'string' ? text : inputText;
        if (!messageText.trim() || !wsRef.current) return;

        const payload = {
            type: "support_message",
            ticket_id: id,
            text: messageText,
            sender: "user"
        };

        wsRef.current.send(JSON.stringify(payload));

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                text: messageText,
                sender: "user",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: "sent",
            }
        ]);
        setInputText("");
        setIsTyping(true);
    };

    return (
        <div className="max-w-[1000px] mx-auto h-[calc(100vh-100px)] md:h-[calc(100vh-140px)] flex flex-col bg-white md:rounded-[40px] border-x border-b md:border border-border shadow-2xl shadow-primary/5 relative">
            
            {/* ─── Header ─── */}
            <header className="p-4 md:p-6 border-b border-border bg-white/80 backdrop-blur-md z-30 flex items-center justify-between sticky top-0 md:rounded-t-[40px]">
                <div className="flex items-center gap-3 md:gap-5">
                    <button 
                        onClick={() => router.back()}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-surface border border-border rounded-xl md:rounded-2xl text-text-muted hover:text-primary transition-all active:scale-95 shadow-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2.5 md:gap-4">
                        <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-linear-to-br ${booking.labColor} text-white flex items-center justify-center font-black text-sm md:text-lg shadow-xl shrink-0`}>
                            {booking.labInitials}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 md:gap-2">
                                <h2 className="text-sm md:text-xl font-black text-dark-light tracking-tight truncate max-w-[120px] sm:max-w-none">{booking.labName}</h2>
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                            </div>
                            <p className="text-[8px] md:text-[10px] font-black text-text-muted uppercase tracking-widest">{id} • SECURE CHANNEL</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border rounded-xl md:rounded-2xl transition-all active:scale-95 ${isMenuOpen ? "bg-primary/10 border-primary text-primary" : "bg-surface border-border text-text-muted"}`}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-60" />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-4 md:right-6 top-16 md:top-24 w-60 sm:w-64 bg-white rounded-[24px] md:rounded-[32px] border border-border shadow-2xl p-2 md:p-3 z-70"
                            >
                                <div className="p-3 md:p-4 border-b border-border/50 mb-1 md:mb-2">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Booking Context</p>
                                    <h4 className="font-bold text-dark-light mt-1 text-xs md:text-sm truncate">{booking.tests[0]}</h4>
                                </div>
                                {[
                                    { label: "View Booking Details", icon: <CalendarCheck className="w-4 h-4" />, color: "text-blue-600", href: `/dashboard/bookings/${id}` },
                                    { label: "Report Issue", icon: <Info className="w-4 h-4" />, color: "text-amber-600" },
                                    { label: "Clear History", icon: <Zap className="w-4 h-4" />, color: "text-rose-500", onClick: () => setMessages([messages[0]]) },
                                ].map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (item.href) router.push(item.href);
                                            if (item.onClick) item.onClick();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-surface transition-all text-[11px] md:text-sm font-bold text-dark-light group"
                                    >
                                        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-white border border-border flex items-center justify-center group-hover:scale-110 transition-transform ${item.color}`}>
                                            {item.icon}
                                        </div>
                                        {item.label}
                                    </button>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </header>

            {/* ─── Messages ─── */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scroll-smooth bg-slate-50/50"
            >
                <div className="flex justify-center mb-6 md:mb-8">
                    <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-border-dark rounded-full shadow-sm">
                        <p className="text-[8px] md:text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Today • Encryption Enabled</p>
                    </div>
                </div>

                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex items-end gap-2 md:gap-3 max-w-[90%] sm:max-w-[80%] md:max-w-[70%]`}>
                                {msg.sender === "lab" && (
                                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-linear-to-br ${booking.labColor} shrink-0 shadow-lg flex items-center justify-center text-white text-[8px] md:text-[10px] font-black`}>
                                        {booking.labInitials}
                                    </div>
                                )}
                                <div className="space-y-1 md:space-y-1.5">
                                    <div className={`
                                        px-4 md:px-6 py-2.5 md:py-4 rounded-[18px] md:rounded-[28px] text-[13px] md:text-sm font-medium leading-relaxed shadow-sm
                                        ${msg.sender === "user" 
                                            ? "bg-dark text-white rounded-br-none shadow-dark/5" 
                                            : "bg-white border border-border text-dark-light rounded-bl-none"}
                                    `}>
                                        {msg.text}
                                    </div>
                                    <div className={`flex items-center gap-1.5 md:gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                        <span className="text-[8px] md:text-[10px] font-black text-text-muted uppercase tracking-tighter">{msg.time}</span>
                                        {msg.sender === "user" && (
                                            <div className="flex items-center -space-x-1">
                                                <CheckCheck className={`w-3 h-3 md:w-3.5 md:h-3.5 ${msg.status === "read" ? "text-primary" : "text-text-muted opacity-40"}`} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-end gap-2 md:gap-3">
                         <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-linear-to-br ${booking.labColor} shrink-0 shadow-lg flex items-center justify-center text-white text-[8px] md:text-[10px] font-black`}>
                            {booking.labInitials}
                        </div>
                        <div className="bg-white border border-border px-4 md:px-6 py-3 md:py-4 rounded-[20px] md:rounded-[28px] rounded-bl-none flex items-center gap-1.5 shadow-sm">
                            <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ─── Footer with Input ─── */}
            <footer className="p-4 md:p-8 bg-white border-t border-border relative z-20 md:rounded-b-[40px]">
                {/* Status Notice */}
                <div className="mb-4 md:mb-6 flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-3 bg-blue-50/50 border border-blue-100 rounded-xl md:rounded-2xl">
                    <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500 fill-current shrink-0" />
                    <p className="text-[9px] md:text-[11px] font-bold text-blue-700">Lab representative usually responds within 2 minutes.</p>
                </div>

                {/* Quick Replies */}
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-4 md:pb-6 no-scrollbar">
                    {quickReplies.map((reply, i) => (
                        <button 
                            key={i}
                            onClick={() => handleSendMessage(reply.text)}
                            className="flex-none flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2.5 md:py-3 bg-white border border-border shadow-sm rounded-xl md:rounded-2xl hover:border-primary/30 hover:scale-105 active:scale-95 transition-all group"
                        >
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl ${reply.color} flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform`}>
                                {reply.icon}
                            </div>
                            <span className="text-[9px] md:text-[11px] font-black text-dark-light uppercase tracking-tight">{reply.text}</span>
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 md:gap-4 bg-surface/50 border-2 border-transparent focus-within:border-primary/20 focus-within:bg-white rounded-[24px] md:rounded-[32px] p-1.5 md:p-2 transition-all shadow-inner">
                        <div className="flex items-center gap-0.5 md:gap-1 pl-1 md:pl-2">
                             <button className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                                <Paperclip className="w-4.5 h-4.5 md:w-5 md:h-5" />
                            </button>
                             <button className="w-10 h-10 md:w-12 md:h-12 rounded-full hidden sm:flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/5 transition-all">
                                <Smile className="w-4.5 h-4.5 md:w-5 md:h-5" />
                            </button>
                        </div>
                        
                        <input 
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none outline-none text-dark-light font-bold placeholder:text-text-muted/50 text-sm py-3 md:py-4"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        />

                        <div className="flex items-center gap-1 md:gap-2 pr-1 md:pr-2">
                            <button 
                                onClick={() => handleSendMessage()}
                                disabled={!inputText.trim()}
                                className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${inputText.trim() ? "bg-primary text-white shadow-primary/30" : "bg-border text-white pointer-events-none"}`}
                            >
                                <Send className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 md:gap-6">
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <ShieldCheck className="w-3 md:w-3.5 h-3 md:h-3.5 text-emerald-500 shrink-0" />
                            <span className="text-[8px] md:text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 text-text-muted hover:text-dark transition-colors cursor-help">
                            <ImageIcon className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0" />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">Image</span>
                        </div>
                        <div className="flex items-center gap-1.5 md:gap-2 text-text-muted hover:text-dark transition-colors cursor-help">
                            <FileText className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0" />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">Report</span>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
