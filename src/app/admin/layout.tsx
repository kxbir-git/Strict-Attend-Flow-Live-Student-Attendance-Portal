"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  Layers,
  Clock,
  FileSpreadsheet,
  BarChart3,
  AlertTriangle,
  History,
  Activity,
  LogOut,
  Menu,
  X,
  FileCheck,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "User Directory", href: "/admin/users", icon: Users },
  { name: "Students (CSV)", href: "/admin/students", icon: GraduationCap },
  { name: "Teachers", href: "/admin/teachers", icon: Briefcase },
  { name: "Classes & Subjects", href: "/admin/classes", icon: Layers },
  { name: "Timetable Overrides", href: "/admin/timetable", icon: Clock },
  { name: "All Sessions", href: "/admin/sessions", icon: FileSpreadsheet },
  { name: "Leave Requests", href: "/admin/leave-requests", icon: FileCheck },
  { name: "Analytics & Export", href: "/admin/reports", icon: BarChart3 },
  { name: "Defaulters (<75%)", href: "/admin/defaulters", icon: AlertTriangle },
  { name: "Audit Log", href: "/admin/audit-log", icon: History },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "System Health", href: "/admin/health", icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200">
                    Admin
                  </span>
                </span>
                <span className="block text-[11px] text-slate-500 font-medium">
                  {session?.user?.name || "Institution Administrator"}
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Sign Out & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
              Role: <strong>ADMIN</strong>
            </span>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Sub-header Navigation Bar for Admin Desktop */}
        <nav className="hidden lg:flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${isActive
                  ? "bg-purple-600 text-white shadow-xs"
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

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white/95 backdrop-blur-lg flex flex-col p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <span className="font-bold text-slate-900">Admin Control</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 space-y-1.5 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive ? "bg-purple-600 text-white" : "text-slate-700 hover:bg-slate-100"
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
