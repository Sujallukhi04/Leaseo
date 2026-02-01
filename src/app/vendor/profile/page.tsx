"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    User,
    Building2,
    Mail,
    Phone,
    MapPin,
    Save,
    Loader2,
    Camera,
    Globe,
    CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
    updateProfile,
    getProfile,
    getVendorProfile,
    updateVendorProfile,
} from "@/actions/profile";

export default function VendorProfilePage() {
    const { data: session, update: updateSession } = useSession();
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile settings
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        avatar: "",
    });

    // Business settings
    const [business, setBusiness] = useState({
        businessName: "",
        businessEmail: "",
        businessPhone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        gstNumber: "",
        panNumber: "",
        website: "",
        bankName: "",
        bankAccountNo: "",
        bankIfscCode: "",
    });

    // Initialize from session
    useEffect(() => {
        if (session?.user) {
            setProfile({
                firstName: session.user.firstName || "",
                lastName: session.user.lastName || "",
                email: session.user.email || "",
                phone: "",
                avatar: session.user.image || "",
            });
        }
    }, [session]);

    // Load full profile from database
    useEffect(() => {
        const loadProfile = async () => {
            const profileData = await getProfile();
            if (profileData) {
                setProfile((prev) => ({
                    ...prev,
                    phone: profileData.phone || "",
                    avatar: profileData.image || prev.avatar,
                }));
            }

            // Load vendor business profile
            const vendorData = await getVendorProfile();
            if (vendorData) {
                setBusiness({
                    businessName: vendorData.businessName || "",
                    businessEmail: vendorData.businessEmail || "",
                    businessPhone: vendorData.businessPhone || "",
                    addressLine1: vendorData.addressLine1 || "",
                    addressLine2: vendorData.addressLine2 || "",
                    city: vendorData.city || "",
                    state: vendorData.state || "",
                    postalCode: vendorData.postalCode || "",
                    country: vendorData.country || "India",
                    gstNumber: vendorData.gstNumber || "",
                    panNumber: vendorData.panNumber || "",
                    website: vendorData.website || "",
                    bankName: vendorData.bankName || "",
                    bankAccountNo: vendorData.bankAccountNo || "",
                    bankIfscCode: vendorData.bankIfscCode || "",
                });
            }
        };
        loadProfile();
    }, []);

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size should be less than 2MB");
            return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        setUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "avatars");

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Upload failed");
            }

            const result = await response.json();
            const imageUrl = result.data.url;

            // Update profile with new image
            const updateResult = await updateProfile({ image: imageUrl });

            if (updateResult.success) {
                setProfile((prev) => ({ ...prev, avatar: imageUrl }));
                // Update session to reflect new image
                await updateSession({ image: imageUrl });
                toast.success("Profile photo updated");
            } else {
                throw new Error(updateResult.error || "Failed to update profile");
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to upload image");
        } finally {
            setUploadingImage(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const result = await updateProfile({
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone,
            });

            if (result.success) {
                // Update session with new name
                await updateSession({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                });
                toast.success("Profile settings saved");
            } else {
                throw new Error(result.error || "Failed to save profile");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBusiness = async () => {
        setSaving(true);
        try {
            const result = await updateVendorProfile({
                businessName: business.businessName,
                businessEmail: business.businessEmail,
                businessPhone: business.businessPhone,
                addressLine1: business.addressLine1,
                addressLine2: business.addressLine2,
                city: business.city,
                state: business.state,
                postalCode: business.postalCode,
                country: business.country,
                gstNumber: business.gstNumber,
                panNumber: business.panNumber,
                website: business.website,
                bankName: business.bankName,
                bankAccountNo: business.bankAccountNo,
                bankIfscCode: business.bankIfscCode,
            });

            if (result.success) {
                toast.success("Business settings saved");
            } else {
                throw new Error(result.error || "Failed to save business settings");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 pb-4 pt-4 px-2 -mx-2 border-b border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Manage your personal and business information
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-sky-600 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-sky-500 shadow-sm rounded-md h-9">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Personal Information</span>
                        <span className="sm:hidden">Personal</span>
                    </TabsTrigger>
                    <TabsTrigger value="business" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-sky-600 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-sky-500 shadow-sm rounded-md h-9">
                        <Building2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Business Information</span>
                        <span className="sm:hidden">Business</span>
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Update your personal details and profile picture
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={profile.avatar} alt="Profile" />
                                        <AvatarFallback className="text-xl">
                                            {profile.firstName?.[0]}
                                            {profile.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    {uploadingImage && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingImage}
                                    >
                                        {uploadingImage ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Camera className="mr-2 h-4 w-4" />
                                                Change Photo
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        JPG, PNG or GIF. Max 2MB
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Form Fields */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={profile.firstName}
                                        onChange={(e) =>
                                            setProfile((prev) => ({
                                                ...prev,
                                                firstName: e.target.value,
                                            }))
                                        }
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={profile.lastName}
                                        onChange={(e) =>
                                            setProfile((prev) => ({
                                                ...prev,
                                                lastName: e.target.value,
                                            }))
                                        }
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            className="pl-10 h-10"
                                            value={profile.email}
                                            onChange={(e) =>
                                                setProfile((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            className="pl-10 h-10"
                                            value={profile.phone}
                                            onChange={(e) =>
                                                setProfile((prev) => ({
                                                    ...prev,
                                                    phone: e.target.value,
                                                }))
                                            }
                                            placeholder="+91 "
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveProfile} disabled={saving} className="bg-sky-500 hover:bg-sky-600 text-white h-10 px-6">
                                    <Save className="mr-2 h-4 w-4" />
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Business Tab */}
                <TabsContent value="business" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Information</CardTitle>
                            <CardDescription>
                                Update your business details and address
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Business Name</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="businessName"
                                            className="pl-10 h-10"
                                            value={business.businessName}
                                            onChange={(e) =>
                                                setBusiness((prev) => ({
                                                    ...prev,
                                                    businessName: e.target.value,
                                                }))
                                            }
                                            placeholder="Your Business Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gstNumber">GST Number</Label>
                                    <Input
                                        id="gstNumber"
                                        value={business.gstNumber}
                                        onChange={(e) =>
                                            setBusiness((prev) => ({
                                                ...prev,
                                                gstNumber: e.target.value,
                                            }))
                                        }
                                        placeholder="22AAAAA0000A1Z5"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="panNumber">PAN Number</Label>
                                    <Input
                                        id="panNumber"
                                        value={business.panNumber}
                                        onChange={(e) =>
                                            setBusiness((prev) => ({
                                                ...prev,
                                                panNumber: e.target.value,
                                            }))
                                        }
                                        placeholder="AAAAA0000A"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="businessEmail">Business Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="businessEmail"
                                            type="email"
                                            className="pl-10 h-10"
                                            value={business.businessEmail}
                                            onChange={(e) =>
                                                setBusiness((prev) => ({
                                                    ...prev,
                                                    businessEmail: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="businessPhone">Business Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="businessPhone"
                                            type="tel"
                                            className="pl-10 h-10"
                                            value={business.businessPhone}
                                            onChange={(e) =>
                                                setBusiness((prev) => ({
                                                    ...prev,
                                                    businessPhone: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="website">Website</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="website"
                                            type="url"
                                            className="pl-10 h-10"
                                            value={business.website}
                                            onChange={(e) =>
                                                setBusiness((prev) => ({
                                                    ...prev,
                                                    website: e.target.value,
                                                }))
                                            }
                                            placeholder="https://www.example.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <h3 className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Business Address
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="addressLine1">Street Address</Label>
                                    <Input
                                        id="addressLine1"
                                        value={business.addressLine1}
                                        onChange={(e) =>
                                            setBusiness((prev) => ({
                                                ...prev,
                                                addressLine1: e.target.value,
                                            }))
                                        }
                                        placeholder="123 Business Street"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="addressLine2">
                                        Address Line 2 (Optional)
                                    </Label>
                                    <Input
                                        id="addressLine2"
                                        value={business.addressLine2}
                                        onChange={(e) =>
                                            setBusiness((prev) => ({
                                                ...prev,
                                                addressLine2: e.target.value,
                                            }))
                                        }
                                        placeholder="Suite, Floor, Building"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={business.city}
                                        onChange={(e) =>
                                            setBusiness((prev) => ({ ...prev, city: e.target.value }))
                                        }
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        value={business.state}
                                        onChange={(e) =>
                                            setBusiness((prev) => ({
                                                ...prev,
                                                state: e.target.value,
                                            }))
                                        }
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input
                                        id="postalCode"
                                        value={business.postalCode}
                                        onChange={(e) =>
                                            setBusiness((prev) => ({
                                                ...prev,
                                                postalCode: e.target.value,
                                            }))
                                        }
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Select
                                        value={business.country}
                                        onValueChange={(value) =>
                                            setBusiness((prev) => ({ ...prev, country: value }))
                                        }
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="India">India</SelectItem>
                                            <SelectItem value="USA">United States</SelectItem>
                                            <SelectItem value="UK">United Kingdom</SelectItem>
                                            <SelectItem value="Canada">Canada</SelectItem>
                                            <SelectItem value="Australia">Australia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator />

                            <h3 className="text-sm font-medium flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Bank Details
                            </h3>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">Bank Name</Label>
                                    <Input
                                        id="bankName"
                                        value={business.bankName}
                                        onChange={(e) =>
                                            setBusiness((prev) => ({
                                                ...prev,
                                                bankName: e.target.value,
                                            }))
                                        }
                                        placeholder="State Bank of India"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankAccountNo">Account Number</Label>
                                    <Input
                                        id="bankAccountNo"
                                        value={business.bankAccountNo}
                                        onChange={(e) =>
                                            setBusiness((prev) => ({
                                                ...prev,
                                                bankAccountNo: e.target.value,
                                            }))
                                        }
                                        placeholder="1234567890"
                                        className="h-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankIfscCode">IFSC Code</Label>
                                    <Input
                                        id="bankIfscCode"
                                        value={business.bankIfscCode}
                                        onChange={(e) =>
                                            setBusiness((prev) => ({
                                                ...prev,
                                                bankIfscCode: e.target.value,
                                            }))
                                        }
                                        placeholder="SBIN0001234"
                                        className="h-10"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveBusiness} disabled={saving} className="bg-sky-500 hover:bg-sky-600 text-white h-10 px-6">
                                    <Save className="mr-2 h-4 w-4" />
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
