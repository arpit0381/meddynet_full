"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AnimatedPartnerLink from "@/components/ui/AnimatedPartnerLink";
import { cn } from "@/lib/utils";
import { haptics } from "@/lib/haptics";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/context/LanguageContext";
import { usePathname } from "next/navigation";
import { Search, ChevronRight, User as UserIcon, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuthStore();


  const navLinks = [
    { href: "/", label: t("common.home") },
    { href: "/about", label: t("common.about") },
    { href: "/search", label: t("common.tests") },
    { href: "/map", label: t("common.labs") },
    { href: "/compare", label: t("common.compare") },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  /* close menu on route change */
  useEffect(() => {
    Promise.resolve().then(() => {
      setIsMobileMenuOpen(false);
    });
  }, [pathname]);

  const closeMobileMenu = () => {
    haptics.light();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    haptics.light();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300",
          isScrolled || isMobileMenuOpen
            ? "glass shadow-lg shadow-black/5 border-b border-white/60"
            : "bg-white/90 backdrop-blur-sm"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-[72px] sm:h-[84px]">

            {/* Logo */}
            <Link href="/" className="flex items-center group" onClick={closeMobileMenu}>
              <div className="relative h-12 sm:h-14 lg:h-16 w-[180px] sm:w-[240px] lg:w-[280px] overflow-hidden group-hover:scale-105 transition-transform duration-200">
                <Image
                  src="/MeddyNetlogo.png"
                  alt="MeddyNet"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => haptics.light()}
                    className={cn(
                      "relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                      active
                        ? "text-primary bg-primary/8"
                        : "text-slate-600 hover:text-primary hover:bg-primary/6"
                    )}
                  >
                    {link.label}
                    {active && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center gap-2.5">
              <LanguageSelector />
              <Link
                href="/search"
                onClick={() => haptics.light()}
                className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-primary transition-all active:scale-[0.95]"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </Link>
              
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => haptics.medium()}
                    className="px-5 py-2.5 min-h-[44px] flex items-center rounded-xl text-sm font-bold border-2 border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-all duration-200 active:scale-[0.97]"
                  >
                    {t("common.login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => haptics.medium()}
                    className="px-5 py-2.5 min-h-[44px] flex items-center rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dark transition-all duration-200 shadow-lg shadow-primary/20 active:scale-[0.97]"
                  >
                    {t("common.register")}
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link 
                    href="/dashboard"
                    onClick={() => haptics.medium()}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all active:scale-[0.95]"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-2xl pr-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs overflow-hidden">
                        {user?.profile_image_url ? (
                          <div className="relative w-9 h-9">
                            <Image src={user.profile_image_url} alt="Profile" fill className="object-cover" />
                          </div>
                        ) : (
                          <span>{user?.avatar || (user?.name ? user.name.substring(0, 2).toUpperCase() : "U")}</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-slate-600 leading-none truncate max-w-[80px]">{user?.name}</span>
                        <button 
                          onClick={() => { haptics.light(); logout(); }}
                          className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors text-left flex items-center gap-1"
                        >
                          <LogOut className="w-2.5 h-2.5" />
                          {t("common.logout") || "Logout"}
                        </button>
                    </div>
                  </div>
                </div>
              )}
            </div>


            <div className="flex lg:hidden items-center gap-2 sm:gap-4">
              <div className="scale-90 sm:scale-100 origin-right">
                <LanguageSelector />
              </div>
              {/* Mobile Hamburger — 44×44px minimum */}
              <button
                className="w-11 h-11 flex flex-col items-center justify-center gap-[5px] group bg-transparent border-none focus:outline-none active:scale-[0.95] transition-transform"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span
                  className={cn(
                    "h-[2.5px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center w-[24px]",
                    isMobileMenuOpen ? "translate-y-[7.5px] rotate-45 bg-primary" : "bg-slate-800 group-hover:bg-primary"
                  )}
                />
                <span
                  className={cn(
                    "h-[2.5px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center",
                    isMobileMenuOpen ? "w-[24px] opacity-0 translate-x-4 bg-primary" : "w-[16px] bg-slate-800 group-hover:w-[24px] group-hover:bg-primary"
                  )}
                />
                <span
                  className={cn(
                    "h-[2.5px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center w-[24px]",
                    isMobileMenuOpen ? "-translate-y-[7.5px] -rotate-45 bg-primary" : "bg-slate-800 group-hover:bg-primary"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Backdrop ── */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-400",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobileMenu}
      >
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />
      </div>

      {/* ── Mobile Drawer ── */}
      <div
        className={cn(
          "fixed top-[72px] sm:top-[84px] left-0 right-0 z-50 lg:hidden",
          "bg-white border-t border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]",
          "transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-b-2xl",
          "max-h-[calc(100vh-72px)] sm:max-h-[calc(100vh-84px)] overflow-y-auto",
          isMobileMenuOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <div className="p-4 space-y-1">
          {navLinks.map((link, i) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${i * 50}ms` : "0ms",
                }}
                className={cn(
                  "flex items-center justify-between px-4 min-h-[52px] rounded-2xl font-bold text-[15px]",
                  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "active:bg-primary/10",
                  isMobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                )}
                onClick={closeMobileMenu}
              >
                {link.label}
                <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", active ? "text-primary translate-x-1" : "text-slate-400")} />
              </Link>
            );
          })}
        </div>

        <div
          className={cn(
            "px-5 pb-6 flex flex-col gap-3 border-t border-slate-100 pt-5",
            "transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
          style={{ transitionDelay: isMobileMenuOpen ? "200ms" : "0ms" }}
        >
          <AnimatedPartnerLink
            className="w-full text-center py-3.5 min-h-[48px] flex items-center justify-center rounded-xl text-sm font-extrabold text-primary bg-primary/10 border-2 border-primary/20 hover:bg-primary/15 active:scale-[0.97] transition-all"
            onClick={closeMobileMenu}
          >
            {t("common.partner")}
          </AnimatedPartnerLink>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="flex-1 text-center py-3.5 min-h-[48px] flex items-center justify-center rounded-xl text-sm font-extrabold border-2 border-slate-200 text-slate-600 hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-[0.97] transition-all outline-none"
              onClick={() => { haptics.medium(); setIsMobileMenuOpen(false); }}
            >
              {t("common.login")}
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center py-3.5 min-h-[48px] flex items-center justify-center rounded-xl text-sm font-extrabold bg-primary text-white hover:bg-primary-dark active:scale-[0.97] transition-all shadow-lg shadow-primary/10"
              onClick={() => { haptics.medium(); setIsMobileMenuOpen(false); }}
            >
              {t("common.register")}
            </Link>
          </div>
        </div>
        <div className="h-2" />
      </div>
    </>
  );
}
