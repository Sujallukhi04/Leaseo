"use client";

import { useTransition, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { updateProfile } from "@/actions/customer/update-profile";
import { changePassword } from "@/actions/auth/change-password";
import { toast } from "sonner";
import { Loader2, Save, User, Lock, Bell, Moon, Sun, Monitor, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    companyName?: string | null;
    gstin?: string | null;
}

export function SettingsPageClient({ user }: { user: UserData }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // General Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        companyName: "",
        gstin: "",
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Notifications State (Mock)
    const [notifications, setNotifications] = useState({
        emailOrderUpdates: true,
        emailPromos: false,
        emailSecurity: true,
        smsRentals: false
    });

    // Auto-fill form data from user prop
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phone: user.phone || "",
                companyName: user.companyName || "",
                gstin: user.gstin || "",
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const onGeneralSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const res = await updateProfile(user.id, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: user.email || "",
                phone: formData.phone,
                companyName: formData.companyName,
                gstin: formData.gstin
            });

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Profile updated successfully");
                router.refresh();
            }
        });
    };

    const onPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const res = await changePassword(passwordData);

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Password changed successfully");
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            }
        });
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h3 className="text-2xl font-bold tracking-tight">Settings</h3>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                {/* --- GENERAL TAB --- */}
                <TabsContent value="general" className="space-y-6">
                    <form onSubmit={onGeneralSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Update your personal details here.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={user.email || ""}
                                        disabled
                                        className="bg-muted"
                                    />
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Contact support to change your email address.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Company Details</CardTitle>
                                <CardDescription>Required for business invoicing.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Company Name</Label>
                                        <Input
                                            id="companyName"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            placeholder="Acme Inc."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gstin">GSTIN / Tax ID</Label>
                                        <Input
                                            id="gstin"
                                            name="gstin"
                                            value={formData.gstin}
                                            onChange={handleChange}
                                            placeholder="22AAAAA0000A1Z5"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end border-t px-6 py-4">
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </TabsContent>

                {/* --- SECURITY TAB --- */}
                <TabsContent value="security" className="space-y-6">
                    <form onSubmit={onPasswordSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>
                                    Update your password to keep your account secure.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end border-t px-6 py-4">
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Password
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>

                    <Card className="border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            <CardDescription>
                                Irreversible actions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-medium">Delete Account</h4>
                                    <p className="text-sm text-muted-foreground">Permanently remove your account and all of its data.</p>
                                </div>
                                <Button variant="destructive">Delete Account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- NOTIFICATIONS TAB --- */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Notifications</CardTitle>
                            <CardDescription>
                                Choose what emails you want to receive.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Order Updates</Label>
                                    <p className="text-sm text-muted-foreground">Receive emails about your order status.</p>
                                </div>
                                <Switch
                                    checked={notifications.emailOrderUpdates}
                                    onCheckedChange={(c) => setNotifications(prev => ({ ...prev, emailOrderUpdates: c }))}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Promotional Emails</Label>
                                    <p className="text-sm text-muted-foreground">Receive emails about new products, features, and discount codes.</p>
                                </div>
                                <Switch
                                    checked={notifications.emailPromos}
                                    onCheckedChange={(c) => setNotifications(prev => ({ ...prev, emailPromos: c }))}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Security Alerts</Label>
                                    <p className="text-sm text-muted-foreground">Receive emails about account activity and security.</p>
                                </div>
                                <Switch
                                    checked={notifications.emailSecurity}
                                    disabled
                                    onCheckedChange={(c) => setNotifications(prev => ({ ...prev, emailSecurity: c }))}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end border-t px-6 py-4">
                            <Button onClick={() => toast.success("Notification preferences saved")} disabled={isPending}>
                                Save Preferences
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
