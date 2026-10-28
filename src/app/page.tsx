import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Radio,
  FileText,
  Bot,
  Calendar,
  Award,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-600 selection:text-white">
      {/* Soft Ambient Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-orange-500/20 border border-orange-200/80 flex-shrink-0 bg-white">
            <Image
              src="/logo.png"
              alt="Strict Attend Flow Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900">
              Strict Attend Flow
            </span>
            <span className="block text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
              Student Attendance Portal
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
        >
          Student Login <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Real-time • Cryptographically Verified • Anti-Cheat
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Live Student Attendance &amp; <br />
            <span className="text-emerald-700">
              Academic Compliance Portal
            </span>
          </h1>

          <p className="text-slate-600 text-base md:text-lg font-normal leading-relaxed">
            Verify lecture presence via rotating in-class passcodes, monitor safe attendance buffers before dipping below 75%, download official HMAC-signed certificates, and get AI-assisted academic guidance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/25 text-sm inline-flex items-center gap-2 hover:scale-[1.02]"
            >
              Enter Enrollment No to Check Attendance <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#features"
              className="px-6 py-3.5 rounded-xl font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition text-sm shadow-xs"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Smart Student Capabilities Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Live In-Class Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Self-mark presence during active lectures using 30-second rotating passcodes or classroom QR tokens.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">75% Buffer Insurance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Know exactly how many spare absences you have in every subject before triggering defaulter warnings.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Official Signed Certificates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate tamper-proof PDF certificates with verification QR codes for scholarships and exams.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">AI Attendance Assistant</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ask questions in Hindi or English to calculate recovery lectures and evaluate risky subjects.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Calendar &amp; ICS Sync</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Live timetable sync, countdown to next lecture, and one-click Google &amp; Apple Calendar exports.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Streaks &amp; Milestones</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Earn badges for consistency, track attendance streaks, and follow personal attendance target goals.
            </p>
          </div>
        </div>
      </main>

      {/* Footer with Discreet Staff Login Link */}
      <footer className="relative z-10 border-t border-slate-200 bg-white px-6 py-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; {new Date().getFullYear()} Strict Attend Flow. All rights reserved.
          </div>

          {/* Discreet link for authorized institutional faculty & administrators */}
          <Link
            href="/login?staff=true"
            className="text-[11px] text-slate-400 hover:text-slate-700 transition"
          >
            Faculty &amp; Staff Administration &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
