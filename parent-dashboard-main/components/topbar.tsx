"use client";

import { useState } from "react";
import { Notification, SearchNormal1 } from "iconsax-react";
import { Globe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditProfileModal from "./edit-profile-modal";
import Image from "next/image";

export function Topbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const userName = user?.name || "Parent User";
  const userEmail = user?.email || "parent@coreskool.edu";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-20 bg-white border-b border-slate-200 z-20">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <SearchNormal1
            size={20}
            color="#90a1b9"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search..."
            className="pl-10 bg-slate-50 border-slate-200"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-auto">
          <Select
            value={language}
            onValueChange={(value: "en" | "ar") => setLanguage(value)}
          >
            <SelectTrigger className="w-[120px]">
              <Globe size={16} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t("common.english")}</SelectItem>
              <SelectItem value="ar">{t("common.arabic")}</SelectItem>
            </SelectContent>
          </Select>

          <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <Notification size={20} className="text-slate-600" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={userName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-semibold">
                  {userInitials}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">{userEmail}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                {t("common.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem>{t("common.settings")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => logout()}
              >
                {t("common.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <EditProfileModal
        open={isProfileModalOpen}
        onOpenChange={setIsProfileModalOpen}
      />
    </header>
  );
}
