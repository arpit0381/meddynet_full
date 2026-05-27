"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Search, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Phone, 
  Paperclip,
  ChevronLeft,
  Circle,
  ShieldCheck,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { toast } from "sonner";

interface Message {
  id: string | number;
  sender: 'patient' | 'lab';
  text: string;
  time: string;
  isImage?: boolean;
}

interface Chat {
  id: string; 
  patientName: string;
  phone: string;
  bookingId: string;
  lastMessage: string;
  time: string;
  status: 'unread' | 'read' | 'resolved';
  unreadCount: number;
  avatar: string;
  messages: Message[];
  isMuted?: boolean;
  isBlocked?: boolean;
}

export default function LabQueriesPage() {
  const { user } = useAuthStore();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  interface IncomingMessageData {
    type: string;
    sender_id: string;
    sender_name?: string;
    sender_phone?: string;
    booking_id?: string;
    text: string;
  }

  const handleIncomingMessage = useCallback((data: IncomingMessageData) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setChats(prev => {
      const existingChat = prev.find(c => c.id === data.sender_id);
      if (existingChat) {
        return prev.map(chat => {
          if (chat.id === data.sender_id) {
            return {
              ...chat,
              messages: [...chat.messages, {
                id: Date.now(),
                sender: 'patient' as const,
                text: data.text,
                time: timestamp
              }],
              lastMessage: data.text,
              time: timestamp,
              status: selectedChatId === chat.id ? 'read' : 'unread',
              unreadCount: selectedChatId === chat.id ? 0 : chat.unreadCount + 1
            };
          }
          return chat;
        });
      } else {
        return [{
          id: data.sender_id,
          patientName: data.sender_name || "New Patient",
          phone: data.sender_phone || "N/A",
          bookingId: data.booking_id || "Query",
          lastMessage: data.text,
          time: timestamp,
          status: 'unread' as const,
          unreadCount: 1,
          avatar: data.sender_name?.[0] || "P",
          messages: [{
            id: Date.now(),
            sender: 'patient' as const,
            text: data.text,
            time: timestamp
          }]
        }, ...prev];
      }
    });

    if (selectedChatId !== data.sender_id) {
      toast.info(`New message from ${data.sender_name || "Patient"}`);
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (!user?.id) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    const ws = new WebSocket(`${wsUrl}/ws/lab/${user.lab_id || user.id}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsLoading(false);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        handleIncomingMessage(data);
      }
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [user, handleIncomingMessage]);

  useEffect(() => {
    if (selectedChatId) {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedChat?.messages, selectedChatId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatId || !wsRef.current) return;
    if (selectedChat?.isBlocked) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const payload = {
      type: 'message',
      receiver_id: selectedChatId,
      text: newMessage,
      sender_name: user?.name,
      timestamp: new Date().toISOString()
    };

    wsRef.current.send(JSON.stringify(payload));

    setChats(prev => prev.map(chat => {
      if (chat.id === selectedChatId) {
        return {
          ...chat,
          messages: [...chat.messages, {
            id: Date.now(),
            sender: 'lab' as const,
            text: newMessage,
            time: timestamp
          }],
          lastMessage: newMessage,
          time: timestamp
        };
      }
      return chat;
    }));

    setNewMessage("");
  };

  const filteredChats = chats.filter(c => 
    c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-5xl border border-border-dark overflow-hidden shadow-2xl relative">
      <AnimatePresence>
        {isLoading && (
            <motion.div 
                initial={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white z-100 flex flex-col items-center justify-center gap-6"
            >
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-[6px] border-primary/10 border-t-primary animate-spin" />
                    <MessageSquare className="absolute inset-0 m-auto w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-black text-dark-light tracking-tight mb-2 uppercase italic">Syncing <span className="not-italic text-primary">Lab-Line</span></h3>
                    <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em] animate-pulse">Establishing Secure Satellite Link...</p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`w-full md:w-[400px] border-r border-border-dark flex flex-col bg-surface/30 ${selectedChatId && 'hidden md:flex'}`}>
        <div className="p-8 border-b border-border-dark bg-white text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
          <h1 className="text-2xl font-black text-dark-light tracking-tighter mb-8 italic relative z-10">
            Patient <span className="text-primary not-italic tracking-normal px-2 py-1 bg-primary/5 rounded-xl">Queries</span>
          </h1>
          <div className="relative z-10 group/search">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within/search:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or ticket..."
              className="w-full bg-surface border-2 border-border-dark rounded-2xl py-4 pl-14 pr-6 text-sm font-black text-dark-light focus:outline-none focus:border-primary/40 focus:bg-white transition-all shadow-sm italic placeholder:not-italic"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2">
           {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                  setSelectedChatId(chat.id);
                  setChats(prev => prev.map(c => c.id === chat.id ? { ...c, status: 'read', unreadCount: 0 } : c));
              }}
              className={`w-full flex items-center gap-5 p-5 rounded-4xl transition-all group relative border ${
                selectedChatId === chat.id 
                ? "bg-white shadow-2xl border-primary/20 -translate-y-0.5" 
                : "hover:bg-white/80 border-transparent"
              }`}
            >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-xl relative shrink-0 transition-transform group-active:scale-95 ${
                    chat.status === 'unread' ? 'bg-primary' : 'bg-slate-300'
                }`}>
                    {chat.avatar}
                    {chat.status === 'unread' && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 border-4 border-white rounded-full animate-bounce" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-start mb-1.5">
                       <h3 className="text-[13px] font-black text-dark-light truncate tracking-tight">{chat.patientName}</h3>
                       <span className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest">{chat.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                         <span className="text-[8px] font-black px-2 py-0.5 bg-primary/10 text-primary border border-primary/10 rounded-md uppercase tracking-widest">{chat.bookingId}</span>
                    </div>
                    <p className={`text-[11px] font-bold truncate leading-none ${chat.status === 'unread' ? 'text-dark-light' : 'text-text-muted opacity-60'}`}>
                        {chat.lastMessage}
                    </p>
                </div>
            </button>
           ))}
        </div>
      </div>

      {/* Main Interface */}
      <div className={`flex-1 flex flex-col bg-white overflow-hidden ${!selectedChatId && 'hidden md:flex'}`}>
        {!selectedChatId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5 relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/2 rounded-full blur-[120px] pointer-events-none" />
                <div className="w-24 h-24 rounded-5xl bg-white border-2 border-border-dark flex items-center justify-center text-text-muted/20 mb-10 shadow-2xl relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <MessageSquare className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-dark-light tracking-tighter mb-4 italic uppercase relative z-10">Tactical <span className="not-italic text-primary">Intelligence Hub</span></h2>
                <p className="text-xs font-black text-text-muted uppercase tracking-[0.25em] max-w-sm leading-relaxed mb-10 opacity-60 relative z-10">Select a diagnostic query from the telemetry list to initiate direct communication line.</p>
            </div>
        ) : (
            <>
                <div className="p-6 md:p-8 border-b border-border-dark flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-30 shadow-sm text-left">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setSelectedChatId(null)} className="md:hidden p-3 bg-surface rounded-2xl hover:bg-primary/5 transition-all">
                            <ChevronLeft className="w-6 h-6 text-dark-light" />
                        </button>
                        <div className="w-14 h-14 rounded-2xl bg-primary shadow-xl shadow-primary/20 flex items-center justify-center text-white font-black text-xl relative group overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            {selectedChat?.avatar}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1.5">
                                <h2 className="text-xl font-black text-dark-light tracking-tight">{selectedChat?.patientName}</h2>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 rounded-md">
                                    <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 group cursor-pointer">
                                    <Clock className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform" />
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em]">{selectedChat?.bookingId}</span>
                                </div>
                                <div className="flex items-center gap-2 group cursor-pointer">
                                    <Phone className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em]">+91 {selectedChat?.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar bg-surface/20">
                     <div className="flex justify-center">
                        <div className="px-6 py-2.5 rounded-full bg-white border border-border-dark shadow-xl shadow-black/2 flex items-center gap-3">
                             <ShieldCheck className="w-4 h-4 text-emerald-500" />
                             <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] italic">Encryption Protocol Verified</span>
                        </div>
                     </div>

                     <AnimatePresence initial={false}>
                        {selectedChat?.messages.map((msg: Message) => (
                            <motion.div key={msg.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${msg.sender === 'lab' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] flex flex-col ${msg.sender === 'lab' ? 'items-end' : 'items-start'}`}>
                                     <div className={`px-8 py-5 rounded-5xl text-sm font-bold shadow-2xl transition-all hover:scale-[1.01] ${
                                         msg.sender === 'lab' 
                                         ? 'bg-dark text-white rounded-tr-none text-right border-white/5' 
                                         : 'bg-white text-dark-light rounded-tl-none text-left border border-border-dark/10'
                                     }`}>
                                         {msg.text}
                                     </div>
                                     <div className="flex items-center gap-3 mt-3 px-4">
                                          <span className="text-[9px] font-black text-text-muted/40 uppercase tracking-[0.2em]">{msg.time}</span>
                                          {msg.sender === 'lab' && <CheckCircle2 className="w-3.5 h-3.5 text-primary opacity-60" />}
                                     </div>
                                </div>
                            </motion.div>
                        ))}
                     </AnimatePresence>
                     <div ref={chatEndRef} />
                </div>

                <div className="p-8 border-t border-border-dark bg-white/80 backdrop-blur-xl">
                     <div className="flex items-center gap-4 p-2 bg-surface border border-border-dark rounded-5xl shadow-inner group focus-within:border-primary/20 transition-all">
                         <button className="w-14 h-14 rounded-full bg-white border border-border-dark text-text-muted hover:text-primary hover:border-primary/20 transition-all active:scale-95 flex items-center justify-center">
                            <Paperclip className="w-5 h-5" />
                         </button>
                         <input 
                            type="text" 
                            placeholder={`Reply to ${selectedChat?.patientName}...`}
                            className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-[15px] font-black text-dark-light py-4 placeholder:italic placeholder:font-bold placeholder:opacity-30 placeholder:tracking-tight px-2"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                         />
                         <button 
                            onClick={handleSendMessage}
                            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30 hover:scale-105 active:scale-90 transition-all group"
                         >
                            <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                         </button>
                     </div>
                </div>
            </>
        )}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
