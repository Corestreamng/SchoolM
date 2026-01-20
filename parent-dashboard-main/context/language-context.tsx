"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

import { translations } from "@/lib/translations";

const _translations: Record<Language, Record<string, string>> = {
  en: {
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.view": "View",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.close": "Close",
    "common.submit": "Submit",
    "common.name": "Name",
    "common.email": "Email",
    "common.phone": "Phone",
    "common.address": "Address",
    "common.password": "Password",
    "common.confirmPassword": "Confirm Password",
    "common.currentPassword": "Current Password",
    "common.newPassword": "New Password",
    "common.changePassword": "Change Password",
    "common.profile": "Profile",
    "common.settings": "Settings",
    "common.logout": "Logout",
    "common.language": "Language",
    "common.english": "English",
    "common.arabic": "Arabic",
    "profile.editProfile": "Edit Profile",
    "profile.updateProfile": "Update Profile",
    "profile.profileUpdated": "Profile updated successfully",
    "profile.passwordChanged": "Password changed successfully",
    "profile.updateFailed": "Failed to update profile",
    "profile.passwordMismatch": "Passwords do not match",
    "profile.passwordTooShort": "Password must be at least 8 characters",
    "profile.invalidCurrentPassword": "Current password is incorrect",
  },
  ar: {
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.edit": "تعديل",
    "common.delete": "حذف",
    "common.view": "عرض",
    "common.search": "بحث",
    "common.loading": "جاري التحميل...",
    "common.error": "خطأ",
    "common.success": "نجح",
    "common.close": "إغلاق",
    "common.submit": "إرسال",
    "common.name": "الاسم",
    "common.email": "البريد الإلكتروني",
    "common.phone": "الهاتف",
    "common.address": "العنوان",
    "common.password": "كلمة المرور",
    "common.confirmPassword": "تأكيد كلمة المرور",
    "common.currentPassword": "كلمة المرور الحالية",
    "common.newPassword": "كلمة المرور الجديدة",
    "common.changePassword": "تغيير كلمة المرور",
    "common.profile": "الملف الشخصي",
    "common.settings": "الإعدادات",
    "common.logout": "تسجيل الخروج",
    "common.language": "اللغة",
    "common.english": "الإنجليزية",
    "common.arabic": "العربية",
    "profile.editProfile": "تعديل الملف الشخصي",
    "profile.updateProfile": "تحديث الملف الشخصي",
    "profile.profileUpdated": "تم تحديث الملف الشخصي بنجاح",
    "profile.passwordChanged": "تم تغيير كلمة المرور بنجاح",
    "profile.updateFailed": "فشل تحديث الملف الشخصي",
    "profile.passwordMismatch": "كلمات المرور غير متطابقة",
    "profile.passwordTooShort": "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
    "profile.invalidCurrentPassword": "كلمة المرور الحالية غير صحيحة",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return (
      (translations as Record<Language, Record<string, string>>)[language][
        key
      ] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
