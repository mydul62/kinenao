"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loader2, Bell, Search, Menu, Plus } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role !== "ADMIN" && user?.role !== "MANAGER") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7F5]">
        <Loader2 className="h-8 w-8 animate-spin text-[#123524]" />
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "MANAGER")) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7F5] text-[#131914] font-['Inter',sans-serif] antialiased">
      {/* Sidebar with Dark Green #123524 & Mobile Drawer */}
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E4E8E4] px-4 md:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
          {/* Mobile Menu Button & Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#131914] hover:bg-[#F1F6F2] border border-[#E4E8E4] cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#8B958D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                className="w-full bg-[#F5F7F5] border border-[#E4E8E4] rounded-xl pl-9 pr-4 py-2 text-xs text-[#131914] placeholder:text-[#8B958D] focus:outline-none focus:ring-1 focus:ring-[#123524] focus:border-[#123524] transition-all"
              />
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/products/new"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-[#123524] hover:bg-[#1B4A34] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add product</span>
            </Link>

            {/* Notifications Button */}
            <button className="relative p-2 rounded-xl border border-[#E4E8E4] bg-white text-[#5C685F] hover:bg-[#F1F6F2] transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B5601A] ring-2 ring-white" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#E4E8E4]">
              <div className="w-8 h-8 rounded-full bg-[#1B4A34] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#E4EEE7] shrink-0 font-['Manrope']">
                {user?.email?.charAt(0).toUpperCase() || "M"}
              </div>
              <div className="hidden xl:flex flex-col">
                <span className="text-xs font-bold text-[#131914] leading-tight font-['Inter']">{user?.email}</span>
                <span className="text-[10px] text-[#5C685F] font-semibold uppercase">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
