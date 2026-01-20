"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, LogOut, Globe } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditProfileModal from "./edit-profile-modal";

export function Topbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [notificationCount] = useState(3);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="sticky top-0 z-20 bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg bg-secondary text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </motion.div>
        </div>

        <div className="flex items-center gap-4 ml-6">
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Bell size={20} className="text-foreground" />
            {notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
              >
                {notificationCount}
              </motion.span>
            )}
          </motion.button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {user?.avatar || user?.name?.substring(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground">
                  {user?.name}
                </span>
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t("common.profile")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                {t("common.profile")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut size={16} className="mr-2" />
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
    </div>
  );
}
