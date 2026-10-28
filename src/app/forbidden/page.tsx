import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-900 selection:bg-rose-500 selection:text-white">
      <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200">
            HTTP 403 • Access Denied
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Permission Denied
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            You don&apos;t have permission to access this resource. Each portal is strictly isolated to prevent cross-role data leaks.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 border border-slate-200">
          Server-enforced role perimeter. Client URL manipulation is strictly blocked.
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition font-bold text-xs shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Switch Account
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition font-bold text-xs"
          >
            <Home className="w-4 h-4" /> Home Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
