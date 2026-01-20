"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Award,
  Calendar,
  DollarCircle,
  MessageSquare,
  TrendUp,
  Receipt21,
  Menu,
  CloseCircle,
} from "iconsax-react";
import { useState } from "react";
import { useLanguage } from "@/context/language-context";

const getNavItems = (t: (key: string) => string) => [
  { labelKey: "nav.dashboard", href: "/", icon: Home },
  { labelKey: "nav.performance", href: "/performance", icon: Award },
  { labelKey: "nav.attendance", href: "/attendance", icon: Calendar },
  { labelKey: "nav.payments", href: "/payments", icon: DollarCircle },
  { labelKey: "nav.messages", href: "/messages", icon: MessageSquare },
  { labelKey: "nav.progress", href: "/progress", icon: TrendUp },
  { labelKey: "nav.results", href: "/results", icon: Receipt21 },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useLanguage();
  const navItems = getNavItems(t);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white border border-slate-200 rounded-lg"
      >
        {isOpen ? (
          <CloseCircle size={20} color="black" />
        ) : (
          <Menu size={20} color="black" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 transition-transform duration-300 z-40 lg:translate-x-0 pt-20 lg:pt-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">CoreSkool</h1>
          <p className="text-sm text-slate-600 mt-1">Parent Portal</p>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon size={20} color={isActive ? "#155dfc" : "black"} />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
