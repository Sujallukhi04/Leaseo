"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        businessName: "",
        businessEmail: "",
        businessPhone: "",
        gstNumber: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch("/api/vendor/settings");
                if (response.ok) {
                    const data = await response.json();
                    setFormData((prev) => ({
                        ...prev,
                        firstName: data.firstName || "",
                        lastName: data.lastName || "",
                        businessName: data.businessName || "",
                        businessEmail: data.businessEmail || data.email || "",
                        businessPhone: data.businessPhone || data.phone || "",
                        gstNumber: data.gstNumber || "",
                    }));
                }
            } catch (error) {
                toast.error("Failed to fetch settings");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Password Validation
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match");
            setSaving(false);
            return;
        }

        try {
            const response = await fetch("/api/vendor/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg);
            }

            toast.success("Settings updated successfully");

            // Clear password fields on success
            setFormData((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>
            <Separator />

            <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Business Information</h3>
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="businessName">Company / Business Name</Label>
                        <Input
                            id="businessName"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessEmail">Business Email</Label>
                            <Input
                                id="businessEmail"
                                name="businessEmail"
                                type="email"
                                value={formData.businessEmail}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="businessPhone">Phone</Label>
                            <Input
                                id="businessPhone"
                                name="businessPhone"
                                value={formData.businessPhone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gstNumber">GSTIN</Label>
                        <Input
                            id="gstNumber"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={formData.currentPassword}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <Button disabled={saving} type="submit">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </div>
    );
}
