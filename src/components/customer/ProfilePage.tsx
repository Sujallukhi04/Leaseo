"use client";

import { useCurrentUserClient } from "@/hook/use-current-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, CreditCard, Heart, Home, KeyRound, MapPin, HelpCircle, Package, LogOut } from "lucide-react";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { updateProfile } from "@/actions/customer/update-profile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function ProfilePageClient() {
    const { user, status } = useCurrentUserClient();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Edit State
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        image: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phone: user.phone || "",
                image: user.image || "",
            });
        }
    }, [user]);

    const handleUpdate = () => {
        if (!user?.id) return;

        startTransition(async () => {
            const res = await updateProfile(user.id, {
                ...formData,
                email: user.email, // Not changing email for now
            });

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Profile updated!");
                setIsOpen(false);
                router.refresh();
            }
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // In a real app, upload to S3/Cloudinary here.
                // For now, we'll try to use the base64 string if it's small enough, 
                // or mocking the upload.
                // Warning: Large base64 strings in DB is bad. 
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const menuItems = [
        { icon: Home, label: "My Rentals", desc: "2 active, 5 past", href: "/customer/dashboard/rentals" },
        { icon: CreditCard, label: "Payments / Billing", desc: "Manage methods & invoices", href: "/customer/dashboard/billing" },
        { icon: MapPin, label: "Addresses", desc: "Shipping & billing locations", href: "/customer/addresses" },
        { icon: Heart, label: "Saved Items / Wishlist", desc: "Properties you love", href: "/customer/dashboard/wishlist" },
        { icon: KeyRound, label: "Security", desc: "Change password & 2FA", href: "/customer/dashboard/security" },
        { icon: HelpCircle, label: "Help & Support", desc: "FAQs & contact", href: "/customer/dashboard/support" },
    ];

    if (status === "loading") return <div className="p-8">Loading...</div>;
    if (!user) return <div className="p-8">Please log in to view profile.</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">

            {/* Profile Header Card */}
            <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar Section */}
                    <div className="relative group">
                        <Avatar className="h-32 w-32 border-4 border-white/10 shadow-lg">
                            <AvatarImage src={formData.image || user.image || undefined} alt={user.name || "User"} className="object-cover" />
                            <AvatarFallback className="text-4xl text-black">{user.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <label
                            htmlFor="profile-upload"
                            className="absolute bottom-2 right-2 bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors shadow-md border border-gray-600"
                        >
                            <Camera className="h-4 w-4 text-white" />
                            <input type="file" id="profile-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>

                    {/* Info Section */}
                    <div className="text-center md:text-left flex-1 space-y-2">
                        <h1 className="text-3xl font-bold">
                            {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.name || "User"}
                        </h1>
                        <p className="text-gray-300">{user.email}</p>
                        {formData.phone && <p className="text-gray-400 text-sm">{formData.phone}</p>}

                        <div className="pt-2">
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="secondary" size="sm" className="gap-2">
                                        Edit Profile
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Edit Profile</DialogTitle>
                                        <DialogDescription>
                                            Make changes to your profile here. Click save when you're done.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    value={formData.firstName}
                                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    value={formData.lastName}
                                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                placeholder="+91 98765 43210"
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                                        <Button onClick={handleUpdate} disabled={isPending}>
                                            {isPending ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Menu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item, index) => (
                    <Link href={item.href} key={index}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-none shadow-sm bg-card/50">
                            <CardContent className="flex items-center p-6 gap-4">
                                <div className="bg-primary/10 p-3 rounded-full text-primary">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{item.label}</h3>
                                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                                </div>
                                <div className="ml-auto text-muted-foreground">
                                    {/* Chevron Right equivalent */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50">
                                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Logout Button */}
            <div className="flex justify-center pt-8">
                <Button
                    variant="outline"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 px-8 gap-2"
                    onClick={async () => {
                        await signOut({ callbackUrl: "/auth/login" });
                    }}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
