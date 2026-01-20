"use client";

import { AuthGuard } from "@/components/auth-guard";
import Sidebar from "@/components/sidebar";
import TopNav from "@/components/top-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Lock,
  Bell,
  Globe,
  Building,
  Save,
  Upload,
  Eye,
  EyeOff,
  Shield,
  Monitor,
  Smartphone,
  LogOut,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showSessionsDialog, setShowSessionsDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [settings, setSettings] = useState({
    schoolName: "CoreSkool",
    schoolEmail: "admin@coreskool.edu",
    schoolPhone: "+234 800 000 0000",
    schoolAddress: "123 Education Avenue, Lagos, Nigeria",
    academicYear: "2024/2025",
    schoolWebsite: "https://coreskool.edu",
    schoolLogo: "",
    emailNotifications: true,
    smsNotifications: true,
    systemNotifications: true,
    paymentNotifications: true,
    attendanceNotifications: true,
    gradeNotifications: true,
    currency: "NGN",
    timezone: "Africa/Lagos",
    theme: "system",
    dateFormat: "DD/MM/YYYY",
    language: "en",
  });

  const activeSessions = [
    {
      id: 1,
      device: "Chrome on Windows",
      location: "Lagos, Nigeria",
      lastActive: "2 hours ago",
      current: true,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "Lagos, Nigeria",
      lastActive: "1 day ago",
      current: false,
    },
  ];

  const handleSave = async (section?: string) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Settings saved",
        description: section
          ? `${section} settings have been updated successfully.`
          : "Your settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handle2FAToggle = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTwoFactorEnabled(!twoFactorEnabled);
      toast({
        title: twoFactorEnabled ? "2FA disabled" : "2FA enabled",
        description: twoFactorEnabled
          ? "Two-factor authentication has been disabled."
          : "Two-factor authentication has been enabled successfully.",
      });
      setShow2FADialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update 2FA settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutSession = async (sessionId: number) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Session terminated",
        description: "The selected session has been logged out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <TopNav />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8 space-y-6 max-w-5xl">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-2">
                  Manage school information and preferences
                </p>
              </div>

              <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="bg-muted/50 grid w-full grid-cols-4">
                  <TabsTrigger value="general" className="gap-2">
                    <Building size={16} />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="gap-2">
                    <Bell size={16} />
                    Notifications
                  </TabsTrigger>
                  <TabsTrigger value="security" className="gap-2">
                    <Lock size={16} />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="gap-2">
                    <Globe size={16} />
                    Preferences
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle>School Information</CardTitle>
                      <CardDescription>
                        Update your school details and branding
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* School Logo Upload */}
                      <div className="space-y-2">
                        <Label>School Logo</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50">
                            {settings.schoolLogo ? (
                              <img
                                src={settings.schoolLogo}
                                alt="School Logo"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Building className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Button
                              variant="outline"
                              className="gap-2"
                              type="button"
                            >
                              <Upload size={16} />
                              Upload Logo
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                              Recommended: 200x200px, PNG or JPG
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="schoolName">School Name</Label>
                          <Input
                            id="schoolName"
                            value={settings.schoolName}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                schoolName: e.target.value,
                              })
                            }
                            placeholder="Enter school name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="academicYear">
                            Current Academic Year
                          </Label>
                          <Input
                            id="academicYear"
                            value={settings.academicYear}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                academicYear: e.target.value,
                              })
                            }
                            placeholder="e.g., 2024/2025"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schoolEmail">School Email</Label>
                        <Input
                          id="schoolEmail"
                          type="email"
                          value={settings.schoolEmail}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              schoolEmail: e.target.value,
                            })
                          }
                          placeholder="admin@school.edu"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schoolPhone">School Phone</Label>
                        <Input
                          id="schoolPhone"
                          value={settings.schoolPhone}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              schoolPhone: e.target.value,
                            })
                          }
                          placeholder="+234 800 000 0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schoolWebsite">School Website</Label>
                        <Input
                          id="schoolWebsite"
                          type="url"
                          value={settings.schoolWebsite}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              schoolWebsite: e.target.value,
                            })
                          }
                          placeholder="https://school.edu"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schoolAddress">School Address</Label>
                        <Textarea
                          id="schoolAddress"
                          value={settings.schoolAddress}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              schoolAddress: e.target.value,
                            })
                          }
                          placeholder="Enter full school address"
                          rows={3}
                        />
                      </div>

                      <Separator />

                      <Button
                        onClick={() => handleSave("General")}
                        className="gap-2"
                        disabled={isSaving}
                      >
                        <Save size={16} />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>
                        Choose how you want to receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <Label className="text-base font-medium">
                                Email Notifications
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Receive important updates via email
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                emailNotifications: checked,
                              })
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <Smartphone className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <Label className="text-base font-medium">
                                SMS Notifications
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Receive alerts via SMS
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.smsNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                smsNotifications: checked,
                              })
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <Monitor className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <Label className="text-base font-medium">
                                System Notifications
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                In-app notifications and alerts
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.systemNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                systemNotifications: checked,
                              })
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <Label className="text-base font-medium">
                                Payment Notifications
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Get notified about payment updates
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.paymentNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                paymentNotifications: checked,
                              })
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <Label className="text-base font-medium">
                                Attendance Notifications
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Receive attendance alerts and reports
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.attendanceNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                attendanceNotifications: checked,
                              })
                            }
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                              <Label className="text-base font-medium">
                                Grade Notifications
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                Get notified when grades are published
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.gradeNotifications}
                            onCheckedChange={(checked) =>
                              setSettings({
                                ...settings,
                                gradeNotifications: checked,
                              })
                            }
                          />
                        </div>
                      </div>

                      <Separator />

                      <Button
                        onClick={() => handleSave("Notification")}
                        className="gap-2"
                        disabled={isSaving}
                      >
                        <Save size={16} />
                        {isSaving ? "Saving..." : "Save Preferences"}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>
                        Manage your account security and authentication
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Change Password */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-base font-medium">
                            Change Password
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Update your login password to keep your account
                            secure
                          </p>
                        </div>
                        <Dialog
                          open={showPasswordDialog}
                          onOpenChange={setShowPasswordDialog}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                              <Lock size={16} />
                              Change Password
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Change Password</DialogTitle>
                              <DialogDescription>
                                Enter your current password and choose a new
                                one.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="currentPassword">
                                  Current Password
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="currentPassword"
                                    type={
                                      showPasswords.current
                                        ? "text"
                                        : "password"
                                    }
                                    value={passwordData.currentPassword}
                                    onChange={(e) =>
                                      setPasswordData({
                                        ...passwordData,
                                        currentPassword: e.target.value,
                                      })
                                    }
                                    placeholder="Enter current password"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() =>
                                      setShowPasswords({
                                        ...showPasswords,
                                        current: !showPasswords.current,
                                      })
                                    }
                                  >
                                    {showPasswords.current ? (
                                      <EyeOff size={16} />
                                    ) : (
                                      <Eye size={16} />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="newPassword">
                                  New Password
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="newPassword"
                                    type={
                                      showPasswords.new ? "text" : "password"
                                    }
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                      setPasswordData({
                                        ...passwordData,
                                        newPassword: e.target.value,
                                      })
                                    }
                                    placeholder="Enter new password (min. 8 characters)"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() =>
                                      setShowPasswords({
                                        ...showPasswords,
                                        new: !showPasswords.new,
                                      })
                                    }
                                  >
                                    {showPasswords.new ? (
                                      <EyeOff size={16} />
                                    ) : (
                                      <Eye size={16} />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                  Confirm New Password
                                </Label>
                                <div className="relative">
                                  <Input
                                    id="confirmPassword"
                                    type={
                                      showPasswords.confirm
                                        ? "text"
                                        : "password"
                                    }
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                      setPasswordData({
                                        ...passwordData,
                                        confirmPassword: e.target.value,
                                      })
                                    }
                                    placeholder="Confirm new password"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3"
                                    onClick={() =>
                                      setShowPasswords({
                                        ...showPasswords,
                                        confirm: !showPasswords.confirm,
                                      })
                                    }
                                  >
                                    {showPasswords.confirm ? (
                                      <EyeOff size={16} />
                                    ) : (
                                      <Eye size={16} />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setShowPasswordDialog(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handlePasswordChange}
                                disabled={isSaving}
                              >
                                {isSaving ? "Updating..." : "Update Password"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <Separator />

                      {/* Two-Factor Authentication */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <Label className="text-base font-medium flex items-center gap-2">
                              <Shield size={18} />
                              Two-Factor Authentication
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Badge
                            variant={twoFactorEnabled ? "default" : "outline"}
                            className="gap-1"
                          >
                            {twoFactorEnabled ? (
                              <>
                                <CheckCircle2 size={12} />
                                Enabled
                              </>
                            ) : (
                              <>
                                <XCircle size={12} />
                                Disabled
                              </>
                            )}
                          </Badge>
                        </div>
                        <Dialog
                          open={show2FADialog}
                          onOpenChange={setShow2FADialog}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                              {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {twoFactorEnabled ? "Disable" : "Enable"}{" "}
                                Two-Factor Authentication
                              </DialogTitle>
                              <DialogDescription>
                                {twoFactorEnabled
                                  ? "Are you sure you want to disable two-factor authentication? This will make your account less secure."
                                  : "Scan the QR code with your authenticator app to enable two-factor authentication."}
                              </DialogDescription>
                            </DialogHeader>
                            {!twoFactorEnabled && (
                              <div className="py-4 flex flex-col items-center gap-4">
                                <div className="w-48 h-48 border-2 border-border rounded-lg flex items-center justify-center bg-muted/50">
                                  <div className="text-center text-muted-foreground">
                                    <Shield
                                      size={48}
                                      className="mx-auto mb-2"
                                    />
                                    <p className="text-sm">
                                      QR Code Placeholder
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                  Use an authenticator app like Google
                                  Authenticator or Authy
                                </p>
                              </div>
                            )}
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setShow2FADialog(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handle2FAToggle}
                                disabled={isSaving}
                                variant={
                                  twoFactorEnabled ? "destructive" : "default"
                                }
                              >
                                {isSaving
                                  ? "Updating..."
                                  : twoFactorEnabled
                                  ? "Disable 2FA"
                                  : "Enable 2FA"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <Separator />

                      {/* Active Sessions */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-base font-medium">
                            Active Sessions
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Manage your active login sessions across devices
                          </p>
                        </div>
                        <Dialog
                          open={showSessionsDialog}
                          onOpenChange={setShowSessionsDialog}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                              <Monitor size={16} />
                              View Sessions ({activeSessions.length})
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Active Sessions</DialogTitle>
                              <DialogDescription>
                                These are the devices currently logged into your
                                account.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
                              {activeSessions.map((session) => (
                                <div
                                  key={session.id}
                                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                      <Monitor
                                        size={20}
                                        className="text-muted-foreground"
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">
                                        {session.device}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {session.location} •{" "}
                                        {session.lastActive}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {session.current && (
                                      <Badge
                                        variant="default"
                                        className="text-xs"
                                      >
                                        Current
                                      </Badge>
                                    )}
                                    {!session.current && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() =>
                                          handleLogoutSession(session.id)
                                        }
                                      >
                                        <LogOut size={14} />
                                        Logout
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setShowSessionsDialog(false)}
                              >
                                Close
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle>System Preferences</CardTitle>
                      <CardDescription>
                        Customize your system settings and regional preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select
                            value={settings.currency}
                            onValueChange={(value) =>
                              setSettings({ ...settings, currency: value })
                            }
                          >
                            <SelectTrigger id="currency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NGN">
                                Nigerian Naira (NGN)
                              </SelectItem>
                              <SelectItem value="USD">
                                US Dollar (USD)
                              </SelectItem>
                              <SelectItem value="GBP">
                                British Pound (GBP)
                              </SelectItem>
                              <SelectItem value="EUR">Euro (EUR)</SelectItem>
                              <SelectItem value="GHS">
                                Ghanaian Cedi (GHS)
                              </SelectItem>
                              <SelectItem value="KES">
                                Kenyan Shilling (KES)
                              </SelectItem>
                              <SelectItem value="ZAR">
                                South African Rand (ZAR)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <Select
                            value={settings.timezone}
                            onValueChange={(value) =>
                              setSettings({ ...settings, timezone: value })
                            }
                          >
                            <SelectTrigger id="timezone">
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Africa/Lagos">
                                Africa/Lagos (WAT)
                              </SelectItem>
                              <SelectItem value="Africa/Accra">
                                Africa/Accra (GMT)
                              </SelectItem>
                              <SelectItem value="Africa/Nairobi">
                                Africa/Nairobi (EAT)
                              </SelectItem>
                              <SelectItem value="Africa/Johannesburg">
                                Africa/Johannesburg (SAST)
                              </SelectItem>
                              <SelectItem value="Europe/London">
                                Europe/London (GMT)
                              </SelectItem>
                              <SelectItem value="America/New_York">
                                America/New_York (EST)
                              </SelectItem>
                              <SelectItem value="America/Los_Angeles">
                                America/Los_Angeles (PST)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dateFormat">Date Format</Label>
                          <Select
                            value={settings.dateFormat}
                            onValueChange={(value) =>
                              setSettings({ ...settings, dateFormat: value })
                            }
                          >
                            <SelectTrigger id="dateFormat">
                              <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DD/MM/YYYY">
                                DD/MM/YYYY
                              </SelectItem>
                              <SelectItem value="MM/DD/YYYY">
                                MM/DD/YYYY
                              </SelectItem>
                              <SelectItem value="YYYY-MM-DD">
                                YYYY-MM-DD
                              </SelectItem>
                              <SelectItem value="DD-MM-YYYY">
                                DD-MM-YYYY
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <Select
                            value={settings.language}
                            onValueChange={(value) =>
                              setSettings({ ...settings, language: value })
                            }
                          >
                            <SelectTrigger id="language">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                              <SelectItem value="pt">Português</SelectItem>
                              <SelectItem value="ar">العربية</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select
                          value={settings.theme}
                          onValueChange={(value) =>
                            setSettings({ ...settings, theme: value })
                          }
                        >
                          <SelectTrigger id="theme">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          System theme will match your device settings
                        </p>
                      </div>

                      <Separator />

                      <Button
                        onClick={() => handleSave("Preference")}
                        className="gap-2"
                        disabled={isSaving}
                      >
                        <Save size={16} />
                        {isSaving ? "Saving..." : "Save Preferences"}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
