"use client";

import { Bell, Search, Menu, Globe, User, ChevronDown, Command, History, ArrowRight, LayoutDashboard, ClipboardList, Calendar, TestTube2, PlusCircle, UploadCloud, Users, IndianRupee, Settings, Store, LogOut, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { popularTests } from "@/data/tests";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/hooks";

interface SearchResult {
  id: string;
  name: string;
  type: string;
  href?: string;
  icon?: React.ElementType | string;
  lastVisit?: string;
  minPrice?: number;
}

export default function LabTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);
  const notificationContainerRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuthStore();
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "ND";

  const { data: notifications = [] } = useNotifications();
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
    setShowNotifications(false);
  };

  // Comprehensive searchable items
  const navigationItems = [
    { id: 'nav1', name: 'Dashboard', type: 'Navigation', href: '/dashboard', icon: LayoutDashboard },
    { id: 'nav2', name: 'Bookings Management', type: 'Navigation', href: '/bookings', icon: ClipboardList },
    { id: 'nav3', name: 'Appointment Calendar', type: 'Navigation', href: '/calendar', icon: Calendar },
    { id: 'nav4', name: 'My Test Catalog', type: 'Navigation', href: '/tests', icon: TestTube2 },
    { id: 'nav5', name: 'Add New Test', type: 'Action', href: '/tests/add', icon: PlusCircle },
    { id: 'nav6', name: 'Upload Patient Reports', type: 'Action', href: '/reports', icon: UploadCloud },
    { id: 'nav7', name: 'Technicians Team', type: 'Navigation', href: '/technicians', icon: Users },
    { id: 'nav8', name: 'Earnings & Revenue', type: 'Navigation', href: '/earnings', icon: IndianRupee },
    { id: 'nav9', name: 'Lab Profile Info', type: 'Navigation', href: '/profile', icon: Store },
    { id: 'nav10', name: 'Portal Settings', type: 'Navigation', href: '/settings', icon: Settings },
  ];

  const searchResults: SearchResult[] = searchQuery.length > 0 ? [
    ...navigationItems.map(item => ({ ...item, type: 'Navigation' as const })),
    ...popularTests.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(t => ({ ...t, type: 'Test' as const })),
  ].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8) : [];

  const groupedResults = searchResults.reduce((acc: Record<string, SearchResult[]>, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
      if (notificationContainerRef.current && !notificationContainerRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header 
      suppressHydrationWarning
      className="h-[72px] bg-white/80 backdrop-blur-3xl border-b border-border fixed top-0 left-0 right-0 z-50 px-6 flex items-center justify-between"
    >
      {/* Left - Logo */}
      <div className="flex items-center gap-3 sm:gap-12">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-surface rounded-full transition-colors"
        >
          <Menu className="w-6 h-6 text-text-secondary" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 relative">
             <div className="w-full h-full bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">M</div>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-lg sm:text-xl font-black text-dark-light tracking-tight leading-none group-hover:text-primary transition-colors">
              Meddy<span className="text-primary group-hover:text-dark-light">Net</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-black text-text-muted uppercase tracking-widest leading-none mt-1.5 font-inter">
              Partner Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Middle - Global Search */}
      <div className="hidden md:flex items-center flex-1 max-w-lg mx-8 relative" ref={searchContainerRef}>
        <div className={`absolute inset-0 bg-primary/5 rounded-4xl blur-xl transition-all duration-500 ${isSearchFocused ? 'opacity-100 scale-105' : 'opacity-0 scale-95'}`} />
        
        <div className={`relative flex items-center w-full bg-surface border-2 rounded-full px-5 py-2.5 transition-all duration-300 ${isSearchFocused ? 'border-primary bg-white shadow-2xl shadow-primary/10' : 'border-border-dark'}`}>
          <Search className={`w-4 h-4 mr-3 transition-colors ${isSearchFocused ? 'text-primary' : 'text-text-muted'}`} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search bookings, tests, or results..."
            className="bg-transparent border-none outline-none text-sm text-text font-bold flex-1 placeholder:text-text-muted/60"
          />
          <kbd className="hidden sm:inline-flex items-center h-5 px-2 font-black text-[10px] text-text-muted bg-white border border-border-dark rounded-lg ml-2 uppercase shadow-sm gap-1">
             <span className="text-[12px]">⌘</span>K
          </kbd>
        </div>

        {/* Global Search Results Dropdown */}
        <AnimatePresence>
          {isSearchFocused && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="absolute top-full left-0 right-0 mt-3 bg-white border border-border-dark shadow-2xl rounded-4xl overflow-hidden z-60 p-2"
            >
              <div className="p-2 pt-0 max-h-[480px] overflow-y-auto no-scrollbar">
                 {Object.keys(groupedResults).length > 0 ? (
                   <div className="space-y-6 pt-4 pb-2">
                      {Object.keys(groupedResults).map((category) => (
                        <div key={category} className="space-y-1">
                           <p className="px-5 mb-3 text-[9px] font-black text-text-muted uppercase tracking-[0.25em]">{category}s</p>
                           {groupedResults[category].map((result) => (
                             <Link 
                               key={result.id} 
                               href={result.href || (result.type === 'Patient' ? `/patients/${result.id}` : `/tests/${result.id}`)}
                               onClick={() => {
                                 setIsSearchFocused(false);
                                 setSearchQuery("");
                               }}
                               className="w-full flex items-center justify-between p-4 rounded-full hover:bg-surface border border-transparent hover:border-border-dark/30 transition-all text-left group"
                             >
                                <div className="flex items-center gap-4">
                                   <div className="w-11 h-11 rounded-2xl bg-surface flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform group-hover:shadow-lg group-hover:shadow-primary/5">
                                      {result.icon ? (
                                         typeof result.icon === 'string' ? result.icon : <result.icon className="w-5 h-5 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
                                      ) : '🧬'}
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-dark-light leading-none mb-1.5">{result.name}</p>
                                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5 group-hover:text-primary transition-colors">
                                         {result.type} <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                      </p>
                                   </div>
                                </div>
                             </Link>
                           ))}
                        </div>
                      ))}
                   </div>
                 ) : (
                   <div className="p-16 text-center">
                      <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-6 text-text-muted shadow-inner animate-pulse">
                         <Search className="w-10 h-10 opacity-10" />
                      </div>
                      <h4 className="text-base font-black text-dark-light mb-1">Search portal commands</h4>
                      <p className="text-xs font-bold text-text-muted">Type to find bookings, tests, or navigate.</p>
                   </div>
                 )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-1 sm:gap-4">
        <button onClick={() => setIsSearchFocused(true)} className="md:hidden p-2 hover:bg-surface rounded-full transition-all text-text-secondary">
          <Search className="w-5 h-5" />
        </button>

        <div className="relative" ref={notificationContainerRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className={`p-2 relative hover:bg-surface rounded-full transition-all group ${showNotifications ? 'bg-primary/10 text-primary' : 'text-text-secondary'}`}
          >
            <Bell className={`w-5 h-5 transition-colors ${showNotifications ? 'text-primary' : 'group-hover:text-primary'}`} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg animate-bounce">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white border border-border shadow-2xl rounded-5xl overflow-hidden z-60"
              >
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h3 className="font-black text-dark-light tracking-tight">Recent Activity</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-70 transition-opacity">
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-[360px] overflow-y-auto no-scrollbar py-2">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notif: any) => (
                      <div 
                        key={notif.id}
                        onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                        className={`p-5 hover:bg-surface transition-all cursor-pointer flex items-start gap-4 relative group ${!notif.is_read ? 'bg-primary/2' : ''}`}
                      >
                         <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-black overflow-hidden shadow-md ${
                            notif.type?.toLowerCase().includes('booking') ? 'bg-orange-500' :
                            notif.type?.toLowerCase().includes('report') ? 'bg-indigo-500' :
                            'bg-primary'
                         }`}>
                            {notif.type?.toLowerCase().includes('booking') ? <ClipboardList className="w-5 h-5" /> : 
                             notif.type?.toLowerCase().includes('report') ? <UploadCloud className="w-5 h-5" /> : 
                             <Bell className="w-5 h-5" />}
                         </div>
                         <div className="flex-1 min-w-0 pr-4 text-left">
                           <div className="flex items-center gap-2 mb-1">
                              <p className={`text-sm font-black truncate ${!notif.is_read ? 'text-primary' : 'text-dark-light'}`}>{notif.title}</p>
                              {!notif.is_read && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                           </div>
                           <p className="text-xs font-bold text-text-muted line-clamp-2 leading-relaxed">{notif.message}</p>
                           <p className="text-[9px] font-bold text-text-muted/60 mt-2 flex items-center gap-1.5 uppercase tracking-widest italic">
                              {/* eslint-disable-next-line */}
                              <Clock className="w-3 h-3" /> {new Date(notif.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                         </div>
                         {!notif.is_read && (
                           <button onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-border shadow-sm">
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                           </button>
                         )}
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                       <AlertCircle className="w-10 h-10 text-text-muted/20 mx-auto mb-3" />
                       <p className="text-xs font-black text-text-muted uppercase tracking-widest">No new alerts</p>
                    </div>
                  )}
                </div>
                
                <Link href="/notifications" onClick={() => setShowNotifications(false)} className="block p-4 text-center bg-surface border-t border-border text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary/5 transition-all">
                  View All Activity Feed
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-border-dark mx-1 hidden sm:block" />

        <div className="relative" ref={profileContainerRef}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-1.5 pl-3 rounded-full border-2 border-transparent hover:border-border-dark hover:bg-surface transition-all"
          >
            <div className="hidden sm:flex flex-col items-end mr-1 text-right">
              <span className="text-sm font-black text-dark-light leading-none mb-1">{user?.name || "Laboratory"}</span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.05em] leading-none">Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg">
              {initials}
            </div>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showProfile ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-3 w-64 bg-white border border-border rounded-4xl shadow-2xl p-3 z-60 overflow-hidden"
              >
                 <div className="p-4 border-b border-border/60 mb-2 px-6 text-left">
                   <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-1">Lab ID</p>
                   <p className="text-sm font-black text-dark-light font-inter">#{user?.lab_id?.slice(0, 10) || "PENDING"}</p>
                 </div>
                 <Link href="/profile" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-6 py-3.5 rounded-full hover:bg-surface text-sm font-bold text-text-secondary transition-colors">
                   <User className="w-4 h-4 text-primary" /> Lab Profile
                 </Link>
                 <Link href="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-6 py-3.5 rounded-full hover:bg-surface text-sm font-bold text-text-secondary transition-colors">
                   <Settings className="w-4 h-4 text-orange-500" /> Cloud Settings
                 </Link>
                 <button 
                   onClick={() => {
                     logout();
                     window.location.href = "/login";
                   }}
                   className="w-full flex items-center gap-3 px-6 py-3.5 rounded-full hover:bg-red-50 text-sm font-bold text-red-500 transition-all mt-1"
                 >
                   <LogOut className="w-4 h-4" /> Sign Out Safely
                 </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
