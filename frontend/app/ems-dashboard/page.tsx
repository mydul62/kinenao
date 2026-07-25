"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Users,
  BookOpen,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Award,
  Search,
  Bell,
  MessageSquare,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Plus,
  Filter,
  Download,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  LayoutDashboard,
  UserCheck,
  Building2,
  FileText,
  PieChart as PieChartIcon,
  Settings,
  HelpCircle,
  LogOut,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Laptop
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// --- Mock Data ---
const revenueData = [
  { month: "Jan", revenue: 45000, expense: 18000, students: 11200 },
  { month: "Feb", revenue: 52000, expense: 21000, students: 11800 },
  { month: "Mar", revenue: 68000, expense: 24000, students: 12400 },
  { month: "Apr", revenue: 61000, expense: 22000, students: 12900 },
  { month: "May", revenue: 84000, expense: 29000, students: 13300 },
  { month: "Jun", revenue: 95000, expense: 31000, students: 13800 },
  { month: "Jul", revenue: 128450, expense: 34210, students: 14208 },
];

const courseEnrollmentData = [
  { name: "Computer Science", students: 4200, color: "#6C5CE7" },
  { name: "Business Admin", students: 3100, color: "#8B5CF6" },
  { name: "Data Science", students: 2400, color: "#38BDF8" },
  { name: "UI/UX Design", students: 1900, color: "#22C55E" },
  { name: "Digital Marketing", students: 1500, color: "#FACC15" },
  { name: "Cyber Security", students: 1108, color: "#EF4444" },
];

const weeklyActivityData = [
  { day: "Mon", attendance: 92, submissions: 430 },
  { day: "Tue", attendance: 95, submissions: 510 },
  { day: "Wed", attendance: 88, submissions: 480 },
  { day: "Thu", attendance: 96, submissions: 620 },
  { day: "Fri", attendance: 91, submissions: 590 },
  { day: "Sat", attendance: 75, submissions: 210 },
  { day: "Sun", attendance: 60, submissions: 150 },
];

const initialStudents = [
  {
    id: "STD-8841",
    name: "Alex Rivera",
    email: "alex.rivera@edubazar.edu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    course: "Full Stack Web Development",
    dept: "Computer Science",
    date: "Jul 21, 2026",
    status: "PAID",
    amount: "$2,400",
  },
  {
    id: "STD-8842",
    name: "Sophia Chen",
    email: "sophia.chen@edubazar.edu",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
    course: "Master in Data Analytics",
    dept: "Data Science",
    date: "Jul 20, 2026",
    status: "PAID",
    amount: "$3,100",
  },
  {
    id: "STD-8843",
    name: "Marcus Vance",
    email: "marcus.v@edubazar.edu",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    course: "UI/UX Design Systems",
    dept: "Design & Arts",
    date: "Jul 19, 2026",
    status: "PENDING",
    amount: "$1,850",
  },
  {
    id: "STD-8844",
    name: "Emily Watson",
    email: "emily.w@edubazar.edu",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    course: "Digital Marketing Strategy",
    dept: "Business",
    date: "Jul 18, 2026",
    status: "ACTIVE",
    amount: "$1,500",
  },
  {
    id: "STD-8845",
    name: "David Kim",
    email: "david.kim@edubazar.edu",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    course: "Cyber Security Fundamentals",
    dept: "Computer Science",
    date: "Jul 17, 2026",
    status: "OVERDUE",
    amount: "$2,200",
  },
  {
    id: "STD-8846",
    name: "Jessica Taylor",
    email: "jessica.t@edubazar.edu",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    course: "AI & Machine Learning BootCamp",
    dept: "Data Science",
    date: "Jul 16, 2026",
    status: "PAID",
    amount: "$3,500",
  },
];

export default function EducationSaaSProfileDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<"Today" | "Week" | "Month" | "Year">("Month");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // Filter students based on search and status
  const filteredStudents = initialStudents.filter((std) => {
    const matchesSearch =
      std.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      std.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || std.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex font-sans antialiased selection:bg-[#6C5CE7]/20 selection:text-[#6C5CE7]">
      {/* ---------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR (Purple Gradient, Fixed, Collapsible) */}
      {/* ---------------------------------------------------- */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ease-in-out p-3 md:p-4 ${
          mobileSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"
        } ${sidebarCollapsed ? "md:w-20" : "md:w-72"}`}
      >
        <div className="w-full h-full bg-gradient-to-b from-[#6C5CE7] via-[#7C4DFF] to-[#8B5CF6] rounded-[24px] shadow-2xl shadow-[#6C5CE7]/30 flex flex-col justify-between overflow-hidden text-white relative border border-white/20">
          {/* Top Glow & Decorative Pattern */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-0 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header / Brand */}
          <div>
            <div className="p-5 flex items-center justify-between border-b border-white/15">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-white text-[#6C5CE7] flex items-center justify-center font-black text-xl shadow-lg shadow-black/10 shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col">
                    <span className="font-extrabold text-lg tracking-tight text-white leading-tight">
                      EduFlow <span className="text-sky-300 font-semibold text-xs ml-1 px-1.5 py-0.5 rounded bg-white/15">PRO</span>
                    </span>
                    <span className="text-[11px] text-purple-200 font-medium">Enterprise SaaS</span>
                  </div>
                )}
              </div>

              {/* Close Mobile Sidebar */}
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="p-3 space-y-1.5 mt-2">
              {[
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
                { id: "students", label: "Students", icon: GraduationCap, badge: "14.2k" },
                { id: "teachers", label: "Faculty", icon: Users, badge: "142" },
                { id: "courses", label: "Courses", icon: BookOpen, badge: "324" },
                { id: "batches", label: "Batches & Classes", icon: Building2, badge: null },
                { id: "finance", label: "Tuition & Finance", icon: DollarSign, badge: "New" },
                { id: "attendance", label: "Attendance", icon: UserCheck, badge: null },
                { id: "analytics", label: "Analytics & Reports", icon: PieChartIcon, badge: null },
                { id: "settings", label: "Settings", icon: Settings, badge: null },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                      isActive
                        ? "bg-white text-[#6C5CE7] shadow-lg shadow-black/10 font-bold backdrop-blur-md"
                        : "text-purple-100 hover:bg-white/15 hover:text-white"
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? "text-[#6C5CE7]" : "text-white/90"
                        }`}
                      />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!sidebarCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-[#6C5CE7]/15 text-[#6C5CE7]"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer User / Collapse Toggle */}
          <div className="p-3 border-t border-white/15 space-y-2">
            {!sidebarCollapsed ? (
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"
                    alt="Dr. Sarah"
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/50"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">Dr. Sarah Jenkins</span>
                    <span className="text-[10px] text-purple-200 truncate">Dean of Academics</span>
                  </div>
                </div>
                <button className="text-white/70 hover:text-white p-1 hover:bg-white/15 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Desktop Collapse Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex w-full items-center justify-center py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all text-xs font-medium gap-2"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-300 ${
                  sidebarCollapsed ? "rotate-0" : "rotate-180"
                }`}
              />
              {!sidebarCollapsed && <span>Collapse Sidebar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------------------------------------------- */}
      {/* MAIN CONTENT WRAPPER */}
      {/* ---------------------------------------------------- */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-72"
        }`}
      >
        {/* ---------------------------------------------------- */}
        {/* 2. TOP NAVBAR (Sticky, Search, User Avatar, Quick Actions) */}
        {/* ---------------------------------------------------- */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-2 rounded-xl border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students, courses, faculty, invoices (Ctrl+K)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl pl-10 pr-12 py-2.5 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:border-[#6C5CE7] transition-all shadow-inner"
              />
              <span className="hidden sm:inline-flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Quick Add Button */}
            <button className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-xs font-semibold rounded-xl shadow-md shadow-[#6C5CE7]/20 hover:opacity-95 transition-all hover:scale-[1.02]">
              <Plus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>

            {/* Messages Drawer Toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMessages(!showMessages);
                  setShowNotifications(false);
                }}
                className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#38BDF8] ring-2 ring-white" />
              </button>

              {/* Messages Popover */}
              {showMessages && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b pb-2 mb-3">
                    <h4 className="font-bold text-sm text-slate-800">Department Messages</h4>
                    <span className="text-[10px] bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded-full">
                      3 Unread
                    </span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-[#6C5CE7] flex items-center justify-center font-bold">
                        CS
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Prof. Alan Turing</p>
                        <p className="text-slate-500 text-[11px] truncate">Updated CS101 Midterm Syllabus.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowMessages(false);
                }}
                className="relative p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
              </button>

              {/* Notifications Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b pb-2 mb-3">
                    <h4 className="font-bold text-sm text-slate-800">Campus Alerts</h4>
                    <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                      4 New
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800">Tuition Batch #842 Settled</p>
                        <p className="text-[10px] text-slate-400">10 mins ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle (Visual Demo) */}
            <button className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <Sun className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* User Profile Dropdown */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"
                alt="Profile Avatar"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#6C5CE7]/30"
              />
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-bold text-slate-900 leading-tight">Dr. Sarah Jenkins</span>
                <span className="text-[10px] text-slate-500 font-medium">Dean of Academics</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------- */}
        {/* 3. DASHBOARD BODY CONTENT */}
        {/* ---------------------------------------------------- */}
        <main className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* Page Title & Time Filter Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
                  Education Dashboard
                </h1>
                <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#6C5CE7]/20">
                  Spring 2026 Term
                </span>
              </div>
              <p className="text-slate-500 text-xs md:text-sm mt-1">
                Real-time academic performance, tuition revenues, enrollment & faculty insights.
              </p>
            </div>

            {/* Time Filter Tabs & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Time Range Switcher */}
              <div className="bg-white border border-[#E5E7EB] p-1 rounded-2xl shadow-sm flex items-center gap-1">
                {(["Today", "Week", "Month", "Year"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      timeRange === range
                        ? "bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white shadow-md shadow-[#6C5CE7]/30"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              {/* Export Button */}
              <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E5E7EB] text-slate-700 text-xs font-semibold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* 4. STATISTICS CARDS (Top Row with Soft Gradients & 20px Corners) */}
          {/* ---------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Revenue Card (Soft Green Gradient) */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border border-emerald-200/80 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Total Tuition Revenue
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">$128,450</h2>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <ArrowUpRight className="w-3 h-3" />
                      +14.8%
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">vs $112,800 last month</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              {/* Soft Ambient Line */}
              <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
                <span>Collection Rate</span>
                <span className="font-bold">94.2%</span>
              </div>
            </div>

            {/* Card 2: Expense Card (Soft Red Gradient) */}
            <div className="bg-gradient-to-br from-rose-500/10 via-red-500/5 to-white border border-rose-200/80 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                    Operating Expense
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">$34,210</h2>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <ArrowDownRight className="w-3 h-3" />
                      -3.2%
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Payroll, labs & infrastructure</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-xs text-rose-700 font-medium">
                <span>Budget Efficiency</span>
                <span className="font-bold">Optimal</span>
              </div>
            </div>

            {/* Card 3: Students Card (Soft Blue Gradient) */}
            <div className="bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-white border border-sky-200/80 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                    Active Students
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">14,208</h2>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">
                      <ArrowUpRight className="w-3 h-3" />
                      +8.5%
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Enrolled across 18 departments</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#38BDF8] text-white flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between text-xs text-sky-700 font-medium">
                <span>Retention Rate</span>
                <span className="font-bold">98.1%</span>
              </div>
            </div>

            {/* Card 4: Courses Card (Soft Yellow/Purple Gradient) */}
            <div className="bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-white border border-amber-200/80 rounded-[20px] p-5 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    Active Courses
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">324</h2>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                      <ArrowUpRight className="w-3 h-3" />
                      +12.0%
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">42 new batches launched</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-amber-700 font-medium">
                <span>Average Rating</span>
                <span className="font-bold">4.9 / 5.0</span>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* 5. SECONDARY METRICS (Match Reference Style Layout) */}
          {/* ---------------------------------------------------- */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: "Enrolled Students", val: "14,208", icon: Users, color: "text-[#6C5CE7]" },
              { title: "Active Batches", val: "2,314", icon: Building2, color: "text-[#38BDF8]" },
              { title: "Avg Tuition / Std", val: "$1,770", icon: Award, color: "text-emerald-500" },
              { title: "Avg Course Sale", val: "185", icon: BookOpen, color: "text-amber-500" },
              { title: "Total Budget", val: "$35,000", icon: DollarSign, color: "text-[#8B5CF6]" },
              { title: "Campus Visitors", val: "11,452", icon: Laptop, color: "text-sky-500" },
            ].map((m, idx) => {
              const MIcon = m.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm hover:border-[#6C5CE7]/30 transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-[11px] text-slate-500 font-semibold">{m.title}</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5">{m.val}</p>
                  </div>
                  <div className={`p-2 rounded-xl bg-slate-50 ${m.color}`}>
                    <MIcon className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------------------------------------------------- */}
          {/* 6. MODERN CHARTS SECTION (Recharts) */}
          {/* ---------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Revenue Overview & Income vs Expense (2 Cols) */}
            <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Financial Performance & Revenue Overview</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Monthly tuition fees collected vs operational costs</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#6C5CE7]" />
                    <span className="text-slate-600">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
                    <span className="text-slate-600">Expense</span>
                  </div>
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1E293B",
                        borderRadius: "16px",
                        border: "none",
                        color: "#FFF",
                        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
                      }}
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, ""]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6C5CE7"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#EF4444"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorExp)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Course Enrollment breakdown (1 Col) */}
            <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Department Enrollment</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Distribution across major faculties</p>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Pie Chart */}
                <div className="h-52 w-full my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courseEnrollmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="students"
                      >
                        {courseEnrollmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1E293B",
                          borderRadius: "12px",
                          color: "#FFF",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Custom Legend Grid */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                {courseEnrollmentData.slice(0, 4).map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-slate-700 font-medium">{d.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{d.students.toLocaleString()} std</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* 7. DATA TABLE (Recent Enrolled Students) */}
          {/* ---------------------------------------------------- */}
          <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-sm overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-6 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Recent Student Registrations</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage student profiles, tuition status, and department enrollments
                </p>
              </div>

              {/* Table Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Pills Filter */}
                <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl text-xs font-semibold text-slate-600">
                  {["ALL", "PAID", "PENDING", "ACTIVE", "OVERDUE"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        statusFilter === st ? "bg-[#6C5CE7] text-white" : "hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-100/60 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-4 px-6">Student Info</th>
                    <th className="py-4 px-6">Enrolled Course</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Tuition Status</th>
                    <th className="py-4 px-6 text-right">Fee</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredStudents.map((std) => (
                    <tr
                      key={std.id}
                      className="hover:bg-purple-50/40 transition-colors group"
                    >
                      {/* Student Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={std.avatar}
                            alt={std.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-sm group-hover:text-[#6C5CE7] transition-colors">
                              {std.name}
                            </p>
                            <p className="text-slate-400 text-xs">{std.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-800">{std.course}</p>
                        <p className="text-slate-400 text-[11px]">ID: {std.id}</p>
                      </td>

                      {/* Department */}
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                          {std.dept}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-slate-500">{std.date}</td>

                      {/* Tuition Status Badge */}
                      <td className="py-4 px-6">
                        {std.status === "PAID" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Paid
                          </span>
                        )}
                        {std.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        )}
                        {std.status === "ACTIVE" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            Active
                          </span>
                        )}
                        {std.status === "OVERDUE" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Overdue
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 text-right font-extrabold text-slate-900">
                        {std.amount}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-center">
                        <button className="p-2 rounded-xl text-slate-400 hover:text-[#6C5CE7] hover:bg-white border border-transparent hover:border-slate-200 transition-all shadow-none hover:shadow-sm">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-4 border-t border-[#E5E7EB] bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>Showing 1 to 6 of 14,208 registered students</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                  Previous
                </button>
                <button className="px-3 py-1.5 bg-[#6C5CE7] text-white font-semibold rounded-lg shadow-sm">
                  1
                </button>
                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                  2
                </button>
                <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
