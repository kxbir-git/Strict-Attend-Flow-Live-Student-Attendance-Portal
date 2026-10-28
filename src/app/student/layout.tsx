"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  GraduationCap,
  LayoutDashboard,
  Radio,
  History,
  User,
  LogOut,
  Menu,
  X,
  FileText,
  ShieldCheck,
  Bot,
  Calendar,
  Award,
  Bell,
  Settings,
  WifiOff,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "Live Mark", href: "/student/live", icon: Radio },
  { name: "History", href: "/student/history", icon: History },
  { name: "Leave", href: "/student/leave", icon: FileText },
  { name: "Certificate", href: "/student/certificate", icon: ShieldCheck },
  { name: "AI Assistant", href: "/student/assistant", icon: Bot },
  { name: "Calendar", href: "/student/calendar", icon: Calendar },
  { name: "Achievements", href: "/student/achievements", icon: Award },
  { name: "Notifications", href: "/student/notifications", icon: Bell },
  { name: "Settings", href: "/student/settings", icon: Settings },
  { name: "Profile", href: "/student/profile", icon: User },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (!navigator.onLine) setIsOffline(true);

    fetch("/api/student/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.unreadCount) {
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(() => { });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/student/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs border border-orange-200 flex-shrink-0 bg-white">
                <Image
                  src="/logo.png"
                  alt="Strict Attend Flow"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-2">
                  Strict Attend Flow
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Student
                  </span>
                </span>
                <span className="block text-[11px] text-slate-500 font-medium">
                  {session?.user?.name || "Student Portal"} • Roll: {(session?.user as any)?.rollNo || "N/A"}
                </span>
              </div>
            </Link>
          </div>

          {/* Status indicators & User Actions */}
          <div className="flex items-center gap-3">
            {isOffline && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <WifiOff className="w-3.5 h-3.5" /> Offline Mode
              </span>
            )}

            <Link
              href="/student/notifications"
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-right">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-emerald-600 font-bold text-xs">
                {session?.user?.name ? session.user.name[0] : "S"}
              </div>
              <div className="text-left text-xs">
                <div className="font-semibold text-slate-800">{session?.user?.name}</div>
                <div className="text-[10px] text-emerald-700 font-mono font-bold">{(session?.user as any)?.rollNo}</div>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Sub-bar */}
        <nav className="hidden lg:flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white/95 backdrop-blur-lg flex flex-col p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <span className="font-bold text-slate-900">Student Navigation</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 space-y-1.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
