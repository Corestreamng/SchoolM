"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/context/language-context";
import apiClient from "@/lib/api-client";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileModal({
  open,
  onOpenChange,
}: EditProfileModalProps) {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user && open) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user, open]);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.put("/profile", formData);
      toast.success(t("profile.profileUpdated"));
      if (setUser && response.data) {
        setUser({ ...user, ...response.data });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t("profile.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("profile.passwordMismatch"));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error(t("profile.passwordTooShort"));
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.put("/change-password", {
        current_password: passwordData.currentPassword,
        password: passwordData.newPassword,
        password_confirmation: passwordData.confirmPassword,
      });
      toast.success(t("profile.passwordChanged"));
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || t("profile.invalidCurrentPassword")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>{t("profile.editProfile")}</DialogTitle>
            <DialogDescription>{t("profile.updateProfile")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("common.name")} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("common.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("common.phone")}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t("common.address")}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(true)}
                className="w-full"
              >
                {t("common.changePassword")}
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleUpdateProfile} disabled={isLoading}>
              {isLoading ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("common.changePassword")}</DialogTitle>
            <DialogDescription>{t("common.currentPassword")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                {t("common.currentPassword")} *
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t("common.newPassword")} *</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("common.confirmPassword")} *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleChangePassword} disabled={isLoading}>
              {isLoading ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
