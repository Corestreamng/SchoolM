"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Xrp,
  MenuBoard,
  User,
  Book1,
  Clipboard,
  Data,
  Book,
  TrendUp,
  MessageSquare,
  Settings,
  Home,
  CloseCircle,
} from "iconsax-react";
import { useLanguage } from "@/context/language-context";

interface NavItem {
  labelKey: string;
  href: string;
  icon: any;
  submenu?: NavItem[];
}

const getNavItems = (t: (key: string) => string): NavItem[] => [
  {
    labelKey: "nav.dashboard",
    href: "/",
    icon: Menu,
  },
  {
    labelKey: "nav.students",
    href: "/students",
    icon: User,
  },
  {
    labelKey: "nav.teachers",
    href: "/teachers",
    icon: User,
  },
  {
    labelKey: "nav.parents",
    href: "/parents",
    icon: Home,
  },
  {
    labelKey: "nav.academicManagement",
    href: "#",
    icon: Book1,
    submenu: [
      {
        labelKey: "nav.classes",
        href: "/academic/classes",
        icon: Clipboard,
      },
      {
        labelKey: "nav.timetable",
        href: "/academic/timetable",
        icon: Clipboard,
      },
      {
        labelKey: "nav.subjects",
        href: "/academic/subjects",
        icon: Book,
      },
      {
        labelKey: "nav.results",
        href: "/results",
        icon: Data,
      },
    ],
  },
  {
    labelKey: "nav.attendance",
    href: "/attendance",
    icon: Clipboard,
  },
  {
    labelKey: "nav.cbt",
    href: "/cbt",
    icon: Data,
  },
  {
    labelKey: "nav.library",
    href: "/library",
    icon: Book,
  },
  {
    labelKey: "nav.promotions",
    href: "/promotions",
    icon: TrendUp,
  },
  {
    labelKey: "nav.finance",
    href: "/finance",
    icon: TrendUp,
  },
  {
    labelKey: "nav.messaging",
    href: "/messaging",
    icon: MessageSquare,
  },
  {
    labelKey: "nav.settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { t } = useLanguage();
  const navItems = getNavItems(t);

  const toggleSubmenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  const isActive = (href: string) => {
    if (href === "#") return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card hover:bg-secondary transition-colors border border-border"
      >
        {isOpen ? (
          <CloseCircle color="black" size={24} />
        ) : (
          <Menu size={24} color="black" />
        )}
      </button>

      {/* Sidebar - Light mode with subtle shadows and rounded cards */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40 shadow-sm ${
          isOpen ? "w-64" : "w-20"
        } overflow-y-auto`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-center">
          <div className="text-center">
            {isOpen ? (
              <div>
                <h1 className="text-xl font-bold text-primary">CoreSkool</h1>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                CS
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const label = t(item.labelKey);
            return (
              <div key={item.labelKey}>
                {item.submenu ? (
                  <button
                    onClick={() => toggleSubmenu(item.labelKey)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                      expandedMenu === item.labelKey
                        ? "bg-secondary text-primary"
                        : "text-black hover:bg-secondary"
                    }`}
                  >
                    <Icon
                      color={expandedMenu === item.labelKey ? "white" : "black"}
                      size={20}
                      className={
                        expandedMenu === item.labelKey
                          ? "text-white"
                          : "text-black"
                      }
                      {...(expandedMenu === item.labelKey && {
                        color: "white",
                      })}
                    />
                    <span className="flex-1 text-left text-sm font-medium">
                      {label}
                    </span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Icon
                      color={isActive(item.href) ? "white" : "black"}
                      size={20}
                      {...(isActive(item.href) && { color: "white" })}
                    />
                    {isOpen && (
                      <span className="text-sm font-medium">{label}</span>
                    )}
                  </Link>
                )}

                {/* Submenu */}
                {item.submenu && expandedMenu === item.labelKey && isOpen && (
                  <div className="mt-2 ml-4 space-y-1 border-l border-border pl-4">
                    {item.submenu.map((subitem) => {
                      const SubIcon = subitem.icon;
                      const subLabel = t(subitem.labelKey);
                      return (
                        <Link
                          key={subitem.labelKey}
                          href={subitem.href}
                          className={`flex items-center gap-3 px-4 py-2 rounded text-sm transition-all ${
                            isActive(subitem.href)
                              ? "bg-secondary text-primary font-medium"
                              : "text-black hover:bg-secondary"
                          }`}
                        >
                          <SubIcon
                            color={isActive(subitem.href) ? "white" : "black"}
                            size={20}
                            {...(isActive(subitem.href) && { color: "white" })}
                          />
                          <span>{subLabel}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
