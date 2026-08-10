"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Award,
  ClipboardList,
  CreditCard,
  Truck,
  Percent,
  Star,
  Users,
  Package,
  Settings,
  Image as ImageIcon,
  Sparkles,
  X,
  ChevronDown,
  LogOut,
  FileText,
  DollarSign,
  Grid,
  List,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSubItem {
  href: string;
  label: string;
  icon?: any;
}

interface NavGroup {
  label: string;
  icon: any;
  items?: NavSubItem[];
  href?: string;
}

const navGroups: NavGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    label: "Products",
    icon: ShoppingBag,
    items: [
      { href: "/admin/products", label: "Product List", icon: List },
      { href: "/admin/products/new", label: "Product Add", icon: PlusCircle },
      { href: "/admin/inventory", label: "Stock Control", icon: Package },
    ],
  },
  {
    label: "Categories",
    icon: Tag,
    items: [
      { href: "/admin/categories", label: "Categories List", icon: List },
      { href: "/admin/brands", label: "Brands Directory", icon: Award },
    ],
  },
  {
    label: "Orders",
    icon: ClipboardList,
    items: [
      { href: "/admin/orders", label: "Orders List", icon: List },
      { href: "/admin/payments", label: "Payment Receipts", icon: CreditCard },
    ],
  },
  {
    label: "Customers",
    icon: Users,
    items: [
      { href: "/admin/customers", label: "Customers List", icon: List },
      { href: "/admin/reviews", label: "Customer Reviews", icon: Star },
    ],
  },
  {
    label: "Sales Promotion",
    icon: Percent,
    items: [
      { href: "/admin/coupons", label: "Coupons List", icon: List },
      { href: "/admin/banners", label: "Homepage Banners", icon: ImageIcon },
    ],
  },
  {
    label: "Logistics & Store",
    icon: Truck,
    items: [
      { href: "/admin/delivery-zones", label: "Delivery Zones", icon: Truck },
      { href: "/admin/payment-methods", label: "Payment Gateways", icon: CreditCard },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Accordion state for expanded submenus
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Products: true,
    Categories: false,
    Orders: true,
    Customers: false,
    "Sales Promotion": false,
    "Logistics & Store": false,
  });

  // Automatically open accordion group if active pathname matches
  useEffect(() => {
    navGroups.forEach((group) => {
      if (group.items) {
        const hasActiveChild = group.items.some(
          (item) => pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
        );
        if (hasActiveChild) {
          setOpenGroups((prev) => ({ ...prev, [group.label]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleGroup = (label: string) => {
    if (collapsed && !mobileOpen) setCollapsed(false);
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={cn(
          "h-screen sticky top-0 z-50 transition-all duration-300 ease-in-out p-3 md:p-3.5 flex flex-col shrink-0 font-['Inter',sans-serif]",
          "lg:translate-x-0 lg:static",
          mobileOpen
            ? "fixed top-0 bottom-0 left-0 translate-x-0 w-72"
            : "fixed lg:sticky -translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        <div className="w-full h-full bg-[#123524] rounded-[20px] shadow-xl flex flex-col justify-between overflow-hidden text-white relative border border-[#1B4A34]/80">
          {/* Header Logo */}
          <div className="flex flex-col min-h-0 flex-1">
            <div className="p-4 flex items-center justify-between border-b border-[#1B4A34]/80 shrink-0">
              <Link
                href="/admin/dashboard"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1B4A34] text-white flex items-center justify-center font-extrabold text-sm border border-emerald-400/20 shadow-sm shrink-0 font-['Manrope',sans-serif]">
                  eB
                </div>
                {(!collapsed || mobileOpen) && (
                  <div className="flex flex-col">
                    <span className="font-extrabold text-base tracking-tight text-white leading-tight font-['Manrope',sans-serif]">
                      eBazar
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-[#8B958D] font-bold">
                      ENTERPRISE COMMERCE
                    </span>
                  </div>
                )}
              </Link>

              {/* Close Mobile Button */}
              <button
                onClick={onCloseMobile}
                className="lg:hidden text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Accordion Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs scrollbar-none">
              {navGroups.map((group) => {
                const GroupIcon = group.icon;
                const isGroupOpen = !!openGroups[group.label];
                const hasItems = group.items && group.items.length > 0;
                const isSingleActive =
                  group.href &&
                  (pathname === group.href || (group.href !== "/admin/dashboard" && pathname.startsWith(group.href)));

                if (!hasItems && group.href) {
                  return (
                    <Link
                      key={group.label}
                      href={group.href}
                      onClick={onCloseMobile}
                      title={collapsed ? group.label : undefined}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 group text-xs font-semibold",
                        isSingleActive
                          ? "bg-[#1B4A34] text-white font-bold shadow-xs"
                          : "text-[#C4D1C7] hover:bg-[#1B4A34]/50 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GroupIcon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-transform duration-150",
                            isSingleActive ? "text-white" : "text-[#8B958D] group-hover:text-white"
                          )}
                        />
                        {(!collapsed || mobileOpen) && <span className="truncate">{group.label}</span>}
                      </div>
                    </Link>
                  );
                }

                // Group with Accordion Dropdown
                const hasActiveChild = group.items?.some(
                  (item) => pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
                );

                return (
                  <div key={group.label} className="space-y-0.5">
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-150 text-xs font-semibold group cursor-pointer",
                        hasActiveChild
                          ? "text-white bg-[#1B4A34]/50 font-bold"
                          : "text-[#C4D1C7] hover:bg-[#1B4A34]/50 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <GroupIcon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-transform duration-150",
                            hasActiveChild ? "text-white" : "text-[#8B958D] group-hover:text-white"
                          )}
                        />
                        {(!collapsed || mobileOpen) && <span className="truncate">{group.label}</span>}
                      </div>
                      {(!collapsed || mobileOpen) && (
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 transition-transform duration-200 text-[#8B958D]",
                            isGroupOpen ? "rotate-180 text-white" : ""
                          )}
                        />
                      )}
                    </button>

                    {/* Submenu Links */}
                    {isGroupOpen && (!collapsed || mobileOpen) && (
                      <div className="pl-3 pr-1 py-0.5 space-y-0.5 ml-3 border-l border-[#1B4A34]">
                        {group.items?.map((sub) => {
                          const SubIcon = sub.icon;
                          const active = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={onCloseMobile}
                              className={cn(
                                "flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-xs font-medium",
                                active
                                  ? "bg-[#1B4A34] text-white font-bold shadow-xs"
                                  : "text-[#A2B3A7] hover:bg-[#1B4A34]/40 hover:text-white"
                              )}
                            >
                              {SubIcon && (
                                <SubIcon
                                  className={cn(
                                    "w-3.5 h-3.5 shrink-0",
                                    active ? "text-white" : "text-[#8B958D]"
                                  )}
                                />
                              )}
                              <span className="truncate">{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Footer User Card */}
          <div className="p-3 border-t border-[#1B4A34]/80 space-y-2 shrink-0">
            {(!collapsed || mobileOpen) ? (
              <div className="p-2 bg-[#1B4A34]/40 rounded-xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#1B4A34] text-white flex items-center justify-center font-bold text-xs shrink-0 font-['Manrope']">
                    {user?.email?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-white truncate">{user?.email}</span>
                    <span className="text-[9px] text-[#8B958D] font-semibold uppercase">{user?.role}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={logout}
                className="w-full flex justify-center text-white/70 hover:text-white p-2 hover:bg-[#1B4A34] rounded-xl transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex w-full items-center justify-center py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-medium gap-1.5 cursor-pointer"
            >
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-300",
                  collapsed ? "-rotate-90" : "rotate-90"
                )}
              />
              {!collapsed && <span className="text-[11px]">Collapse</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
