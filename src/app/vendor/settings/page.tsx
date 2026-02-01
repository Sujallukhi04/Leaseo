"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "@/actions/profile";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewOrder: true,
    emailOrderStatus: true,
    emailPayment: true,
    emailMarketing: false,
    pushNewOrder: true,
    pushOrderStatus: true,
    pushPayment: true,
  });

  // Password settings
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // TODO: Implement actual save to database
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (result.success) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast.success("Password changed successfully");
      } else {
        toast.error(result.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 pb-4 pt-4 px-2 -mx-2 border-b border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage system preferences and security
        </p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-sky-600 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-sky-500 shadow-sm rounded-md h-9">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-sky-600 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-sky-500 shadow-sm rounded-md h-9">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose which emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Order</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you receive a new order
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNewOrder}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({
                      ...prev,
                      emailNewOrder: checked,
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Status Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when order statuses change
                  </p>
                </div>
                <Switch
                  checked={notifications.emailOrderStatus}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({
                      ...prev,
                      emailOrderStatus: checked,
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Received</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you receive a payment
                  </p>
                </div>
                <Switch
                  checked={notifications.emailPayment}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({
                      ...prev,
                      emailPayment: checked,
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Receive news and updates about RentNow
                  </p>
                </div>
                <Switch
                  checked={notifications.emailMarketing}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({
                      ...prev,
                      emailMarketing: checked,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} disabled={saving} className="bg-sky-500 hover:bg-sky-600 text-white h-10 px-6">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="h-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="h-10"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleChangePassword} disabled={changingPassword} className="bg-sky-500 hover:bg-sky-600 text-white h-10 px-6">
                  <Save className="mr-2 h-4 w-4" />
                  {changingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
