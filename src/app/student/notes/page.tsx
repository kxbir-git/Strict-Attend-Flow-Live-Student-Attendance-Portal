"use client";

import React, { useState } from "react";
import {
  Folder,
  FileText,
  Video,
  Presentation,
  Image as ImageIcon,
  Download,
  Eye,
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
  Calendar,
  User,
  ArrowRight,
  Bookmark,
  Layers,
  LayoutGrid,
  ListFilter,
  Play,
  Clock,
  Flame,
  Maximize2,
  Share2,
} from "lucide-react";

interface NoteItem {
  id: string;
  title: string;
  description: string;
  subjectCode: string;
  subjectName: string;
  unit: string;
  type: "pdf" | "ppt" | "video" | "image";
  fileSize: string;
  durationOrPages?: string;
  uploadedAt: string;
  facultyName: string;
  fileUrl: string;
  downloadCount: number;
  isPopular?: boolean;
}

const SUBJECT_THEMES: Record<
  string,
  {
    gradient: string;
    border: string;
    badge: string;
    activeBg: string;
    accent: string;
    lightAccent: string;
  }
> = {
  ALL: {
    gradient: "from-slate-900 to-indigo-950",
    border: "border-slate-800",
    badge: "bg-slate-100 text-slate-800",
    activeBg: "bg-slate-900 text-white",
    accent: "text-indigo-600",
    lightAccent: "bg-indigo-50",
  },
  "BCA-301": {
    gradient: "from-sky-500/10 via-blue-500/5 to-transparent",
    border: "hover:border-sky-300 border-sky-100",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    activeBg: "bg-sky-600 text-white shadow-sky-600/25",
    accent: "text-sky-600",
    lightAccent: "bg-sky-50",
  },
  "BCA-302": {
    gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
    border: "hover:border-emerald-300 border-emerald-100",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    activeBg: "bg-emerald-600 text-white shadow-emerald-600/25",
    accent: "text-emerald-600",
    lightAccent: "bg-emerald-50",
  },
  "BCA-303": {
    gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
    border: "hover:border-amber-300 border-amber-100",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    activeBg: "bg-amber-600 text-white shadow-amber-600/25",
    accent: "text-amber-600",
    lightAccent: "bg-amber-50",
  },
  "BCA-304": {
    gradient: "from-purple-500/10 via-indigo-500/5 to-transparent",
    border: "hover:border-purple-300 border-purple-100",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    activeBg: "bg-purple-600 text-white shadow-purple-600/25",
    accent: "text-purple-600",
    lightAccent: "bg-purple-50",
  },
  "BCA-305": {
    gradient: "from-rose-500/10 via-pink-500/5 to-transparent",
    border: "hover:border-rose-300 border-rose-100",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    activeBg: "bg-rose-600 text-white shadow-rose-600/25",
    accent: "text-rose-600",
    lightAccent: "bg-rose-50",
  },
};

const SUBJECTS = [
  { code: "ALL", name: "All Subjects", icon: Layers, count: 18, color: "slate" },
  { code: "BCA-301", name: "Database (DBMS)", icon: BookOpen, count: 5, color: "sky" },
  { code: "BCA-302", name: "Data Structures (DSA)", icon: BookOpen, count: 4, color: "emerald" },
  { code: "BCA-303", name: "Operating Systems", icon: BookOpen, count: 3, color: "amber" },
  { code: "BCA-304", name: "Web Technologies", icon: BookOpen, count: 3, color: "purple" },
  { code: "BCA-305", name: "Computer Networks", icon: BookOpen, count: 3, color: "rose" },
];

const INITIAL_NOTES: NoteItem[] = [
  // DBMS
  {
    id: "dbms-1",
    title: "Unit 1: Relational Model & ER Diagram Architecture",
    description: "Comprehensive lecture notes covering Entities, Relationships, Structural Constraints, and E-R to Relational Table mapping with solved university questions.",
    subjectCode: "BCA-301",
    subjectName: "Database Management (DBMS)",
    unit: "Unit 1",
    type: "pdf",
    fileSize: "4.2 MB",
    durationOrPages: "38 Pages",
    uploadedAt: "24 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 142,
    isPopular: true,
  },
  {
    id: "dbms-2",
    title: "Unit 2: Normalization (1NF, 2NF, 3NF, BCNF) Slides",
    description: "Visual classroom presentation on Functional Dependencies, Attribute Closure, Lossless Join Decomposition, and BCNF step-by-step algorithms.",
    subjectCode: "BCA-301",
    subjectName: "Database Management (DBMS)",
    unit: "Unit 2",
    type: "ppt",
    fileSize: "6.8 MB",
    durationOrPages: "45 Slides",
    uploadedAt: "18 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 98,
  },
  {
    id: "dbms-3",
    title: "SQL Joins & Complex Nested Subqueries Class",
    description: "Screen recorded deep dive explaining INNER, LEFT, RIGHT, FULL OUTER joins, Correlated subqueries and indexing queries executed live in PostgreSQL.",
    subjectCode: "BCA-301",
    subjectName: "Database Management (DBMS)",
    unit: "Unit 3",
    type: "video",
    fileSize: "45.0 MB",
    durationOrPages: "32 Mins",
    uploadedAt: "12 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    downloadCount: 215,
    isPopular: true,
  },
  {
    id: "dbms-4",
    title: "ACID Properties & Transaction States Mind-Map",
    description: "High-resolution diagram chart detailing Atomicity, Consistency, Isolation, Durability with concurrent serializability conflict schedules.",
    subjectCode: "BCA-301",
    subjectName: "Database Management (DBMS)",
    unit: "Unit 4",
    type: "image",
    fileSize: "2.1 MB",
    durationOrPages: "4K Infographic",
    uploadedAt: "08 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
    downloadCount: 84,
  },
  {
    id: "dbms-5",
    title: "Unit 5: B-Trees & B+ Tree Indexing Handout",
    description: "Detailed step-by-step leaf node insertion, deletion, and split algorithms with practice university exam solutions.",
    subjectCode: "BCA-301",
    subjectName: "Database Management (DBMS)",
    unit: "Unit 5",
    type: "pdf",
    fileSize: "3.5 MB",
    durationOrPages: "26 Pages",
    uploadedAt: "01 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 167,
  },

  // DSA
  {
    id: "dsa-1",
    title: "Unit 1: Asymptotic Notations & Master Theorem Handout",
    description: "Mathematical proofs of Big-O, Omega, Theta and recursion tree master theorem formulas with shortcut lookup tables.",
    subjectCode: "BCA-302",
    subjectName: "Data Structures & Algorithms",
    unit: "Unit 1",
    type: "pdf",
    fileSize: "2.8 MB",
    durationOrPages: "22 Pages",
    uploadedAt: "26 Oct 2026",
    facultyName: "Dr. Ananya Roy",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 189,
    isPopular: true,
  },
  {
    id: "dsa-2",
    title: "Unit 2: Linked Lists & Stack Applications Slides",
    description: "Visual slides on Singly/Doubly Linked Lists, Infix to Postfix conversion, and Tower of Hanoi simulation.",
    subjectCode: "BCA-302",
    subjectName: "Data Structures & Algorithms",
    unit: "Unit 2",
    type: "ppt",
    fileSize: "7.4 MB",
    durationOrPages: "52 Slides",
    uploadedAt: "20 Oct 2026",
    facultyName: "Dr. Ananya Roy",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 120,
  },
  {
    id: "dsa-3",
    title: "AVL Tree Rotations (LL, RR, LR, RL) Video Class",
    description: "Step-by-step whiteboard animation of balanced BST rotations to maintain O(log N) search complexity.",
    subjectCode: "BCA-302",
    subjectName: "Data Structures & Algorithms",
    unit: "Unit 3",
    type: "video",
    fileSize: "52.0 MB",
    durationOrPages: "28 Mins",
    uploadedAt: "15 Oct 2026",
    facultyName: "Dr. Ananya Roy",
    fileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    downloadCount: 310,
    isPopular: true,
  },
  {
    id: "dsa-4",
    title: "Dijkstra & Floyd-Warshall Algorithm Cheatsheet",
    description: "Graph shortest path comparison matrix, edge weight conditions, and negative cycle detection.",
    subjectCode: "BCA-302",
    subjectName: "Data Structures & Algorithms",
    unit: "Unit 4",
    type: "image",
    fileSize: "1.9 MB",
    durationOrPages: "HD Chart",
    uploadedAt: "09 Oct 2026",
    facultyName: "Dr. Ananya Roy",
    fileUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    downloadCount: 204,
  },

  // OS
  {
    id: "os-1",
    title: "Unit 1: Process Management & CPU Scheduling Notes",
    description: "FCFS, SJF, Priority, Round Robin scheduling algorithms with Gantt charts and turnaround time calculations.",
    subjectCode: "BCA-303",
    subjectName: "Operating Systems (OS)",
    unit: "Unit 1",
    type: "pdf",
    fileSize: "4.8 MB",
    durationOrPages: "40 Pages",
    uploadedAt: "23 Oct 2026",
    facultyName: "Prof. Vikram Malhotra",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 175,
    isPopular: true,
  },
  {
    id: "os-2",
    title: "Unit 2: Deadlock Avoidance (Banker's Algorithm) PPT",
    description: "Safe state evaluation, resource allocation matrices, and deadlock recovery strategies.",
    subjectCode: "BCA-303",
    subjectName: "Operating Systems (OS)",
    unit: "Unit 2",
    type: "ppt",
    fileSize: "5.6 MB",
    durationOrPages: "36 Slides",
    uploadedAt: "17 Oct 2026",
    facultyName: "Prof. Vikram Malhotra",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 112,
  },
  {
    id: "os-3",
    title: "Virtual Memory & Page Replacement Video Lecture",
    description: "FIFO, LRU, Optimal page replacement algorithms compared with Belady's Anomaly explanation.",
    subjectCode: "BCA-303",
    subjectName: "Operating Systems (OS)",
    unit: "Unit 3",
    type: "video",
    fileSize: "61.0 MB",
    durationOrPages: "41 Mins",
    uploadedAt: "11 Oct 2026",
    facultyName: "Prof. Vikram Malhotra",
    fileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    downloadCount: 228,
  },

  // Web Tech
  {
    id: "wt-1",
    title: "Unit 1: HTML5 Semantic Tags & CSS3 Flexbox/Grid",
    description: "Complete modern responsive layout design guide with practical coding exercises and templates.",
    subjectCode: "BCA-304",
    subjectName: "Web Technologies",
    unit: "Unit 1",
    type: "pdf",
    fileSize: "3.9 MB",
    durationOrPages: "34 Pages",
    uploadedAt: "25 Oct 2026",
    facultyName: "Prof. Amit Verma",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 240,
    isPopular: true,
  },
  {
    id: "wt-2",
    title: "Unit 2: JavaScript ES6+ Async/Await & DOM PPT",
    description: "Promises, fetch API, Event Loop, closures, and modern frontend architecture patterns.",
    subjectCode: "BCA-304",
    subjectName: "Web Technologies",
    unit: "Unit 2",
    type: "ppt",
    fileSize: "8.1 MB",
    durationOrPages: "48 Slides",
    uploadedAt: "19 Oct 2026",
    facultyName: "Prof. Amit Verma",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 195,
  },
  {
    id: "wt-3",
    title: "REST APIs & JSON Integration Video Class",
    description: "Building Node.js and Express backend routes, handling POST/GET requests and JWT authentication.",
    subjectCode: "BCA-304",
    subjectName: "Web Technologies",
    unit: "Unit 3",
    type: "video",
    fileSize: "55.0 MB",
    durationOrPages: "35 Mins",
    uploadedAt: "14 Oct 2026",
    facultyName: "Prof. Amit Verma",
    fileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    downloadCount: 280,
    isPopular: true,
  },

  // Computer Networks
  {
    id: "cn-1",
    title: "Unit 1: OSI vs TCP/IP 7-Layer Model Architecture",
    description: "Layer-by-layer headers, encapsulation, protocols (HTTP, TCP, IP, ARP, MAC), and port numbers reference.",
    subjectCode: "BCA-305",
    subjectName: "Computer Networks",
    unit: "Unit 1",
    type: "pdf",
    fileSize: "5.1 MB",
    durationOrPages: "44 Pages",
    uploadedAt: "22 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 215,
    isPopular: true,
  },
  {
    id: "cn-2",
    title: "Unit 2: IP Subnetting & CIDR Calculation Slides",
    description: "Class A/B/C address partitioning, subnet masks, usable host formulas, and routing tables.",
    subjectCode: "BCA-305",
    subjectName: "Computer Networks",
    unit: "Unit 2",
    type: "ppt",
    fileSize: "6.3 MB",
    durationOrPages: "38 Slides",
    uploadedAt: "16 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 160,
  },
  {
    id: "cn-3",
    title: "TCP 3-Way Handshake & Congestion Control Infographic",
    description: "SYN, SYN-ACK, ACK sequence diagram with TCP Slow Start and Fast Retransmit visual flow.",
    subjectCode: "BCA-305",
    subjectName: "Computer Networks",
    unit: "Unit 3",
    type: "image",
    fileSize: "2.4 MB",
    durationOrPages: "High-Res Flow",
    uploadedAt: "10 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    downloadCount: 130,
  },
];

export default function StudentNotesPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [activePreviewNote, setActivePreviewNote] = useState<NoteItem | null>(null);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const filteredNotes = INITIAL_NOTES.filter((note) => {
    if (selectedSubject !== "ALL" && note.subjectCode !== selectedSubject) return false;
    if (selectedType !== "ALL" && note.type !== selectedType) return false;
    if (selectedUnit !== "ALL" && note.unit !== selectedUnit) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const match =
        note.title.toLowerCase().includes(q) ||
        note.description.toLowerCase().includes(q) ||
        note.subjectName.toLowerCase().includes(q) ||
        note.facultyName.toLowerCase().includes(q) ||
        note.unit.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getTypeBadge = (type: NoteItem["type"]) => {
    switch (type) {
      case "pdf":
        return {
          label: "PDF Document",
          bg: "bg-rose-50 text-rose-700 border-rose-200/80",
          cardTop: "from-rose-500/10 via-rose-500/5 to-transparent",
          iconBg: "bg-rose-100 text-rose-600",
          icon: FileText,
        };
      case "ppt":
        return {
          label: "Presentation PPT",
          bg: "bg-amber-50 text-amber-700 border-amber-200/80",
          cardTop: "from-amber-500/10 via-amber-500/5 to-transparent",
          iconBg: "bg-amber-100 text-amber-600",
          icon: Presentation,
        };
      case "video":
        return {
          label: "Video Class",
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
          cardTop: "from-indigo-500/10 via-indigo-500/5 to-transparent",
          iconBg: "bg-indigo-100 text-indigo-600",
          icon: Video,
        };
      case "image":
        return {
          label: "Visual Chart",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          cardTop: "from-emerald-500/10 via-emerald-500/5 to-transparent",
          iconBg: "bg-emerald-100 text-emerald-600",
          icon: ImageIcon,
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Top Ambient Glow Banner */}
      <div className="relative bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white overflow-hidden pb-12 pt-8 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-emerald-400 border border-white/15 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> University Digital Library
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Course Materials &amp; Study Notes
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Faculty-curated syllabus handouts, interactive video lectures, chapter slides, and high-res architectural diagrams for semester exams.
              </p>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 bg-white/5 border border-white/10 backdrop-blur-md p-3 rounded-3xl">
              <div className="text-center px-3 py-1.5">
                <span className="block text-xl sm:text-2xl font-black text-white">{INITIAL_NOTES.length}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Resources</span>
              </div>
              <div className="text-center px-3 py-1.5 border-x border-white/10">
                <span className="block text-xl sm:text-2xl font-black text-emerald-400">5</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Subjects</span>
              </div>
              <div className="text-center px-3 py-1.5">
                <span className="block text-xl sm:text-2xl font-black text-indigo-400">100%</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Verified</span>
              </div>
            </div>
          </div>

          {/* Subject Pills Slider */}
          <div className="pt-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {SUBJECTS.map((sub) => {
                const isSelected = selectedSubject === sub.code;

                return (
                  <button
                    key={sub.code}
                    onClick={() => setSelectedSubject(sub.code)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                      isSelected
                        ? "bg-white text-slate-900 shadow-lg shadow-white/10 scale-[1.03]"
                        : "bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 hover:border-white/20"
                    }`}
                  >
                    <Folder className={`w-4 h-4 ${isSelected ? "text-indigo-600" : "text-slate-300"}`} />
                    <span>{sub.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isSelected ? "bg-indigo-100 text-indigo-800" : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {sub.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
        {/* Floating Search & Control Center */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by topic, unit, or faculty (e.g. Normalization, B-Tree, TCP/IP, Banker's)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Controls Right */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Unit Dropdown */}
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Syllabus Units</option>
                <option value="Unit 1">Unit 1</option>
                <option value="Unit 2">Unit 2</option>
                <option value="Unit 3">Unit 3</option>
                <option value="Unit 4">Unit 4</option>
                <option value="Unit 5">Unit 5</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-xl transition ${
                    viewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-xl transition ${
                    viewMode === "list"
                      ? "bg-white text-indigo-600 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="List View"
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Media Format Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
            </span>
            {[
              { id: "ALL", label: "All Formats", icon: Layers },
              { id: "pdf", label: "📄 PDF Notes", icon: FileText },
              { id: "ppt", label: "📊 Slides (PPT)", icon: Presentation },
              { id: "video", label: "🎥 Video Classes", icon: Video },
              { id: "image", label: "🖼️ Mind-Maps & Charts", icon: ImageIcon },
            ].map((fmt) => {
              const isSelected = selectedType === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedType(fmt.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30 scale-[1.02]"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {fmt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes Feed Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900">
              {selectedSubject === "ALL" ? "All Course Resources" : `${selectedSubject} Materials`}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredNotes.length} Found
            </span>
          </div>

          {bookmarkedIds.length > 0 && (
            <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              <Bookmark className="w-3.5 h-3.5 fill-indigo-600" /> {bookmarkedIds.length} Bookmarked
            </span>
          )}
        </div>

        {/* Empty State */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto border border-indigo-100">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Learning Materials Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Selected subject, unit, or search keywords ke mutabiq koi notes available nahi hain.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedSubject("ALL");
                setSelectedType("ALL");
                setSelectedUnit("ALL");
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/20"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* Bento-Style Rich Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotes.map((note) => {
              const badge = getTypeBadge(note.type);
              const Icon = badge.icon;
              const isBookmarked = bookmarkedIds.includes(note.id);

              return (
                <div
                  key={note.id}
                  className="group relative bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Subtle Card Background Accent */}
                  <div
                    className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${badge.cardTop} pointer-events-none opacity-80`}
                  />

                  {/* Top Row: Type Pill, Unit, & Bookmark */}
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-extrabold border ${badge.bg}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {badge.label}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          {note.unit}
                        </span>
                        <button
                          onClick={() => toggleBookmark(note.id)}
                          className={`p-1.5 rounded-xl border transition ${
                            isBookmarked
                              ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                              : "text-slate-400 hover:text-slate-700 border-transparent hover:bg-slate-100"
                          }`}
                          title={isBookmarked ? "Remove Bookmark" : "Save Note"}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${isBookmarked ? "fill-indigo-600" : ""}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Subject Header */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-wider">
                        {note.subjectCode}
                      </span>
                      <span className="text-slate-300 text-xs">•</span>
                      <span className="text-[11px] font-bold text-slate-600 truncate">
                        {note.subjectName}
                      </span>
                      {note.isPopular && (
                        <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" /> Popular
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                        {note.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {note.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Meta & Actions */}
                  <div className="relative z-10 pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {note.facultyName}
                      </span>
                      <span className="font-mono text-slate-500 font-semibold">
                        {note.durationOrPages || note.fileSize}
                      </span>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setActivePreviewNote(note)}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-700" /> View Online
                      </button>

                      <a
                        href={note.fileUrl}
                        download
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100">
            {filteredNotes.map((note) => {
              const badge = getTypeBadge(note.type);
              const Icon = badge.icon;

              return (
                <div
                  key={note.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${badge.iconBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {note.subjectCode}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                          {note.unit}
                        </span>
                        <span className="text-xs text-slate-400">• {note.facultyName}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">{note.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{note.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <span className="text-xs text-slate-400 font-mono mr-2 hidden sm:inline">
                      {note.durationOrPages || note.fileSize}
                    </span>
                    <button
                      onClick={() => setActivePreviewNote(note)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <a
                      href={note.fileUrl}
                      download
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modern Theater Mode Modal Viewer */}
      {activePreviewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 backdrop-blur-sm">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-indigo-100 text-indigo-700 font-mono">
                    {activePreviewNote.subjectCode}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-200 text-slate-700">
                    {activePreviewNote.unit}
                  </span>
                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    Uploaded by {activePreviewNote.facultyName}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                  {activePreviewNote.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={activePreviewNote.fileUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download ({activePreviewNote.fileSize})
                </a>
                <button
                  onClick={() => setActivePreviewNote(null)}
                  className="p-2 rounded-2xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded Viewer */}
            <div className="flex-1 bg-slate-950 overflow-hidden flex items-center justify-center p-4">
              {activePreviewNote.type === "pdf" && (
                <div className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                  <iframe
                    src={activePreviewNote.fileUrl}
                    title={activePreviewNote.title}
                    className="w-full flex-1 border-0"
                  />
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>{activePreviewNote.durationOrPages || "Multi-Page PDF Document"}</span>
                    <a
                      href={activePreviewNote.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      Open in External Tab <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {activePreviewNote.type === "video" && (
                <div className="w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                  <video
                    controls
                    autoPlay
                    className="w-full aspect-video object-contain"
                    src={activePreviewNote.fileUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="p-4 bg-slate-900 text-white space-y-1">
                    <h4 className="font-black text-sm">{activePreviewNote.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{activePreviewNote.description}</p>
                  </div>
                </div>
              )}

              {activePreviewNote.type === "image" && (
                <div className="max-w-4xl max-h-[80vh] bg-white rounded-3xl p-4 shadow-2xl space-y-3 overflow-hidden flex flex-col">
                  <div className="rounded-2xl overflow-hidden border border-slate-200 flex-1 flex items-center justify-center bg-slate-50">
                    <img
                      src={activePreviewNote.fileUrl}
                      alt={activePreviewNote.title}
                      className="max-h-[65vh] w-auto object-contain"
                    />
                  </div>
                  <div className="text-xs text-slate-600 px-1">
                    <p className="font-black text-slate-900">{activePreviewNote.title}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{activePreviewNote.description}</p>
                  </div>
                </div>
              )}

              {activePreviewNote.type === "ppt" && (
                <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl space-y-5 border border-slate-200">
                  <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-inner">
                    <Presentation className="w-10 h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-black text-base text-slate-900">{activePreviewNote.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{activePreviewNote.description}</p>
                  </div>
                  <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 text-left space-y-1">
                    <p className="font-black flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> PowerPoint Slides Deck (.pptx)
                    </p>
                    <p className="text-[11px] text-amber-700">
                      Contains {activePreviewNote.durationOrPages || "40+ slides"} with diagram animations and exam pointers.
                    </p>
                  </div>
                  <a
                    href={activePreviewNote.fileUrl}
                    download
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm shadow-lg shadow-amber-600/25 transition"
                  >
                    <Download className="w-4 h-4" /> Download Presentation ({activePreviewNote.fileSize})
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
