"use client";

import { useState } from "react";
import { SearchNormal, Notification, Logout, User } from "iconsax-react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import EditProfileModal from "./edit-profile-modal";

export default function TopNav() {
  const [notifications, setNotifications] = useState(3);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const userName = user?.name || "Admin User";
  const userEmail = user?.email || "admin@coreskool.edu";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 bg-card border-b border-border z-40 shadow-sm">
      <div className="px-4 py-4 md:px-8 flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <SearchNormal
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
              color="gray"
            />
            <Input
              type="text"
              placeholder="Search students, teachers..."
              className="pl-10 bg-secondary border-border placeholder:text-muted-foreground focus:bg-secondary"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Language Switcher */}
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

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors border border-blue-50">
            <Notification size={20} className="text-foreground" color="blue" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={
                      user?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`
                    }
                    alt={userName}
                  />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">
                  {userName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-4 py-3">
                <p className="font-medium text-sm">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={() => setIsProfileModalOpen(true)}
              >
                <User size={16} color="black" />
                <span>{t("common.profile")}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-destructive"
                onClick={() => logout()}
              >
                <Logout size={16} color="red" />
                <span>{t("common.logout")}</span>
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
