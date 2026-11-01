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
  Share2,
  Calendar,
  User,
  ArrowRight,
  Bookmark,
  Layers,
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
  uploadedAt: string;
  facultyName: string;
  fileUrl: string;
  previewUrl?: string;
  downloadCount: number;
}

const SUBJECTS = [
  { code: "ALL", name: "All Subjects", icon: Layers, count: 18 },
  { code: "BCA-301", name: "Database Management (DBMS)", icon: BookOpen, count: 5 },
  { code: "BCA-302", name: "Data Structures & Algorithms", icon: BookOpen, count: 4 },
  { code: "BCA-303", name: "Operating Systems (OS)", icon: BookOpen, count: 3 },
  { code: "BCA-304", name: "Web Technologies", icon: BookOpen, count: 3 },
  { code: "BCA-305", name: "Computer Networks", icon: BookOpen, count: 3 },
];

const INITIAL_NOTES: NoteItem[] = [
  // DBMS
  {
    id: "dbms-1",
    title: "Unit 1: Relational Model & ER Diagram Architecture",
    description: "Complete lecture notes covering Entities, Relationships, Cardinality, and E-R to Table mapping with solved university examples.",
    subjectCode: "BCA-301",
    subjectName: "Database Management (DBMS)",
    unit: "Unit 1",
    type: "pdf",
    fileSize: "4.2 MB",
    uploadedAt: "24 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    previewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 142,
  },
  {
    id: "dbms-2",
    title: "Unit 2: Normalization (1NF, 2NF, 3NF, BCNF) Slides",
    description: "Classroom presentation on Functional Dependencies, Lossless Join Decomposition, and BCNF step-by-step proofs.",
    subjectCode: "BCA-301",
    subjectName: "Database Management (DBMS)",
    unit: "Unit 2",
    type: "ppt",
    fileSize: "6.8 MB",
    uploadedAt: "18 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 98,
  },
  {
    id: "dbms-3",
    title: "SQL Joins & Subqueries Master Video Lecture",
    description: "Screen recorded walkthrough of INNER, LEFT, RIGHT, FULL OUTER joins with complex nested queries execution in PostgreSQL.",
    subjectCode: "BCA-301",
    subjectName: "Database Management (DBMS)",
    unit: "Unit 3",
    type: "video",
    fileSize: "45.0 MB",
    uploadedAt: "12 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    downloadCount: 215,
  },
  {
    id: "dbms-4",
    title: "ACID Properties & Transaction States Mind-Map",
    description: "High-resolution diagram chart detailing Atomicity, Consistency, Isolation, Durability with concurrent schedule diagrams.",
    subjectCode: "BCA-301",
    subjectName: "Database Management (DBMS)",
    unit: "Unit 4",
    type: "image",
    fileSize: "2.1 MB",
    uploadedAt: "08 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
    previewUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
    downloadCount: 84,
  },
  {
    id: "dbms-5",
    title: "Unit 5: B-Trees & B+ Tree Indexing Handout",
    description: "Detailed step-by-step leaf node insertion and split algorithms with practice university exam questions.",
    subjectCode: "BCA-301",
    subjectName: "Database Management (DBMS)",
    unit: "Unit 5",
    type: "pdf",
    fileSize: "3.5 MB",
    uploadedAt: "01 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    previewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
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
    uploadedAt: "26 Oct 2026",
    facultyName: "Dr. Ananya Roy",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    previewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 189,
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
    uploadedAt: "15 Oct 2026",
    facultyName: "Dr. Ananya Roy",
    fileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    downloadCount: 310,
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
    uploadedAt: "09 Oct 2026",
    facultyName: "Dr. Ananya Roy",
    fileUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    previewUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
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
    uploadedAt: "23 Oct 2026",
    facultyName: "Prof. Vikram Malhotra",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    previewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 175,
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
    uploadedAt: "11 Oct 2026",
    facultyName: "Prof. Vikram Malhotra",
    fileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
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
    uploadedAt: "25 Oct 2026",
    facultyName: "Prof. Amit Verma",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    previewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 240,
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
    uploadedAt: "14 Oct 2026",
    facultyName: "Prof. Amit Verma",
    fileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    previewUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    downloadCount: 280,
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
    uploadedAt: "22 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    previewUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadCount: 215,
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
    uploadedAt: "10 Oct 2026",
    facultyName: "Prof. Rajesh Sharma",
    fileUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    previewUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    downloadCount: 130,
  },
];

export default function StudentNotesPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedUnit, setSelectedUnit] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  // Preview Modal state
  const [activePreviewNote, setActivePreviewNote] = useState<NoteItem | null>(null);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const filteredNotes = INITIAL_NOTES.filter((note) => {
    // Subject filter
    if (selectedSubject !== "ALL" && note.subjectCode !== selectedSubject) return false;
    // Type filter
    if (selectedType !== "ALL" && note.type !== selectedType) return false;
    // Unit filter
    if (selectedUnit !== "ALL" && note.unit !== selectedUnit) return false;
    // Search query
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
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: FileText,
          iconColor: "text-rose-600",
        };
      case "ppt":
        return {
          label: "PPT Slides",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Presentation,
          iconColor: "text-amber-600",
        };
      case "video":
        return {
          label: "Video Class",
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: Video,
          iconColor: "text-indigo-600",
        };
      case "image":
        return {
          label: "Diagram / Image",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: ImageIcon,
          iconColor: "text-emerald-600",
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Academic Resource Repository
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Subject Notes &amp; Learning Materials
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              University-verified syllabus notes, lecture PPTs, video recordings, and unit-wise diagrams uploaded directly by course faculty. Read online or download anytime for offline exam preparation.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-center flex-1 sm:flex-none">
              <span className="block text-xl font-black text-white">{INITIAL_NOTES.length}</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Total Materials</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl text-center flex-1 sm:flex-none">
              <span className="block text-xl font-black text-emerald-400">5</span>
              <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Sem 3 Subjects</span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Subject Folders Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Folder className="w-4 h-4 text-indigo-600" /> Select Subject Folder
          </h2>
          <span className="text-xs text-slate-400">
            {selectedSubject === "ALL" ? "Showing all subjects" : selectedSubject}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SUBJECTS.map((sub) => {
            const isSelected = selectedSubject === sub.code;
            return (
              <button
                key={sub.code}
                onClick={() => setSelectedSubject(sub.code)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]"
                    : "bg-white border-slate-200 hover:border-indigo-300 text-slate-800 hover:bg-slate-50/80 shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {sub.count}
                  </span>
                </div>
                <div className="font-mono text-[10px] font-bold tracking-tight opacity-80">
                  {sub.code}
                </div>
                <div className="font-extrabold text-xs truncate mt-0.5" title={sub.name}>
                  {sub.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes by topic (e.g. Normalization, B-Tree, TCP/IP, Banker's Algorithm)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Unit Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Syllabus Units</option>
            <option value="Unit 1">Unit 1</option>
            <option value="Unit 2">Unit 2</option>
            <option value="Unit 3">Unit 3</option>
            <option value="Unit 4">Unit 4</option>
            <option value="Unit 5">Unit 5</option>
          </select>
        </div>

        {/* Format Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Format:
          </span>
          {[
            { id: "ALL", label: "All Formats" },
            { id: "pdf", label: "📄 PDF Notes", icon: FileText },
            { id: "ppt", label: "📊 PPT Presentations", icon: Presentation },
            { id: "video", label: "🎥 Video Lectures", icon: Video },
            { id: "image", label: "🖼️ Diagrams & Images", icon: ImageIcon },
          ].map((type) => {
            const isAct = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isAct
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Available Documents &amp; Media ({filteredNotes.length})
          </h2>
          {bookmarkedIds.length > 0 && (
            <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 fill-indigo-600" /> {bookmarkedIds.length} Saved
            </span>
          )}
        </div>

        {filteredNotes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-800">No study material found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Selected filters or search query ke saath koi note match nahi hua. Filters reset karke dekhein.
            </p>
            <button
              onClick={() => {
                setSelectedSubject("ALL");
                setSelectedType("ALL");
                setSelectedUnit("ALL");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => {
              const badge = getTypeBadge(note.type);
              const Icon = badge.icon;
              const isBookmarked = bookmarkedIds.includes(note.id);

              return (
                <div
                  key={note.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Type & Unit */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {badge.label}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          {note.unit}
                        </span>
                        <button
                          onClick={() => toggleBookmark(note.id)}
                          title={isBookmarked ? "Remove Bookmark" : "Save Note"}
                          className={`p-1.5 rounded-lg border transition ${
                            isBookmarked
                              ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                              : "text-slate-400 hover:text-slate-700 border-transparent hover:bg-slate-100"
                          }`}
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${isBookmarked ? "fill-indigo-600" : ""}`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Subject Tag */}
                    <div className="font-mono text-[11px] font-extrabold text-indigo-600">
                      {note.subjectCode} • {note.subjectName}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-snug hover:text-indigo-600 transition">
                        {note.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {note.description}
                      </p>
                    </div>
                  </div>

                  {/* Metadata and Action Buttons */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> {note.facultyName}
                      </span>
                      <span>{note.fileSize}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* In-Page Preview Button */}
                      <button
                        onClick={() => setActivePreviewNote(note)}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" /> View Online
                      </button>

                      {/* Download Button */}
                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs shadow-indigo-600/20 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* In-Page Interactive Modal Viewer */}
      {activePreviewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 font-mono">
                    {activePreviewNote.subjectCode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                    {activePreviewNote.unit}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-xl">
                  {activePreviewNote.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activePreviewNote.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download ({activePreviewNote.fileSize})
                </a>
                <button
                  onClick={() => setActivePreviewNote(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="flex-1 bg-slate-100 overflow-y-auto p-4 flex items-center justify-center">
              {activePreviewNote.type === "pdf" && (
                <div className="w-full h-full bg-white rounded-2xl shadow-inner overflow-hidden flex flex-col">
                  <iframe
                    src={activePreviewNote.fileUrl}
                    title={activePreviewNote.title}
                    className="w-full flex-1 border-0"
                  />
                  <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-between">
                    <span>Uploaded by {activePreviewNote.facultyName}</span>
                    <a
                      href={activePreviewNote.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      Open in new tab <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {activePreviewNote.type === "video" && (
                <div className="w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl">
                  <video
                    controls
                    autoPlay
                    className="w-full h-auto aspect-video"
                    src={activePreviewNote.fileUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="p-4 bg-slate-900 text-white space-y-1">
                    <h4 className="font-bold text-sm">{activePreviewNote.title}</h4>
                    <p className="text-xs text-slate-400">{activePreviewNote.description}</p>
                  </div>
                </div>
              )}

              {activePreviewNote.type === "image" && (
                <div className="max-w-2xl bg-white rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-[60vh]">
                    <img
                      src={activePreviewNote.fileUrl}
                      alt={activePreviewNote.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-xs text-slate-600">
                    <p className="font-bold text-slate-800">{activePreviewNote.title}</p>
                    <p className="text-slate-500 mt-1">{activePreviewNote.description}</p>
                  </div>
                </div>
              )}

              {activePreviewNote.type === "ppt" && (
                <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-xl space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                    <Presentation className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-base text-slate-900">{activePreviewNote.title}</h4>
                    <p className="text-xs text-slate-500">{activePreviewNote.description}</p>
                  </div>
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 text-left space-y-1">
                    <p className="font-bold">PowerPoint Presentation File (.pptx)</p>
                    <p className="text-[11px] text-amber-700">
                      View full slides by downloading or using your system presentation software.
                    </p>
                  </div>
                  <a
                    href={activePreviewNote.fileUrl}
                    download
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition"
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

