"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, MapPin, Check, User, Building2, FileText, ArrowRight, Truck, ArrowLeft } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addAddress, updateAddress, deleteAddress } from "@/actions/customer/address";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Initial form state
const initialFormState = {
    fullName: "",
    label: "Home",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    deliveryInstructions: "",
    country: "India",
    isDefault: false,
};

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Delhi"
];

export default function AddressListClient({ userId, addresses }: { userId: string, addresses: any[] }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [formData, setFormData] = useState(initialFormState);

    const handleOpenAdd = () => {
        setIsEditing(false);
        setCurrentId(null);
        setFormData(initialFormState);
        setIsOpen(true);
    };

    const handleOpenEdit = (addr: any) => {
        setIsEditing(true);
        setCurrentId(addr.id);
        setFormData({
            fullName: addr.fullName || "",
            label: addr.label || "Home",
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2 || "",
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            deliveryInstructions: addr.deliveryInstructions || "",
            country: addr.country,
            isDefault: addr.isDefault,
        });
        setIsOpen(true);
    };

    const handleSubmit = () => {
        if (!userId) return;

        // Basic Validation
        if (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.state || !formData.postalCode) {
            toast.error("Please fill in all required fields.");
            return;
        }

        startTransition(async () => {
            let res;
            if (isEditing && currentId) {
                res = await updateAddress(userId, currentId, formData);
            } else {
                res = await addAddress(userId, formData);
            }

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(res.success);
                setIsOpen(false);
                router.refresh();
            }
        });
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this address?")) {
            startTransition(async () => {
                const res = await deleteAddress(userId, id);
                if (res.error) toast.error(res.error);
                else {
                    toast.success(res.success);
                    router.refresh();
                }
            });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Saved Addresses</h2>
                <div className="flex items-center gap-2">
                    <Button onClick={handleOpenAdd} className="gap-2 bg-primary">
                        <Plus className="h-4 w-4" /> Add New Address
                    </Button>
                    <Link href="/customer/profile">
                        <Button variant="outline" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Profile
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No addresses saved yet.</p>
                    </div>
                ) : (
                    addresses.map((addr) => (
                        <Card key={addr.id} className={`group relative overflow-hidden transition-all hover:shadow-md ${addr.isDefault ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : ''}`}>
                            {addr.isDefault && (
                                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Default
                                </div>
                            )}
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {addr.label === "Home" ? <User className="h-4 w-4" /> :
                                        addr.label === "Office" ? <Building2 className="h-4 w-4" /> :
                                            <MapPin className="h-4 w-4" />}
                                    {addr.fullName || addr.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-sm text-muted-foreground mb-4">
                                    <p className="flex items-start gap-2">
                                        <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                        <span>
                                            {addr.addressLine1}
                                            {addr.addressLine2 && <br />}
                                            {addr.addressLine2}
                                        </span>
                                    </p>
                                    <p className="pl-5">{addr.city}, {addr.state} - {addr.postalCode}</p>
                                    <p className="pl-5">{addr.country}</p>
                                    {addr.deliveryInstructions && (
                                        <p className="mt-2 text-xs bg-muted p-2 rounded flex gap-2">
                                            <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                                            {addr.deliveryInstructions}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="outline" size="sm" onClick={() => handleOpenEdit(addr)} className="gap-1 h-8">
                                        <Pencil className="h-3 w-3" /> Edit
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(addr.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 h-8">
                                        <Trash2 className="h-3 w-3" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[650px] bg-[#1a1f2e] text-white border-gray-800 p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-xl font-semibold">
                            {isEditing ? "Edit Address" : "Add New Address"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            {isEditing ? "Update your address details below." : ""}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    className="pl-10 bg-[#131722] border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-primary/50"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* City */}
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-gray-300">City</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    id="city"
                                    placeholder="City"
                                    className="pl-10 bg-[#131722] border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-primary/50"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* State (Select) */}
                        <div className="space-y-2">
                            <Label htmlFor="state" className="text-gray-300">State/Province</Label>
                            <Select
                                value={formData.state}
                                onValueChange={(value) => setFormData({ ...formData, state: value })}
                            >
                                <SelectTrigger id="state" className="bg-[#131722] border-gray-700 text-white focus:ring-primary/50">
                                    <div className="flex items-center gap-2">
                                        <ArrowRight className="h-4 w-4 text-gray-500" />
                                        <SelectValue placeholder="Select State" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1f2e] border-gray-700 text-white">
                                    {INDIAN_STATES.map((state) => (
                                        <SelectItem key={state} value={state} className="focus:bg-gray-800 focus:text-white cursor-pointer">
                                            {state}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Street Address */}
                        <div className="space-y-2">
                            <Label htmlFor="addressLine1" className="text-gray-300">Street Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    id="addressLine1"
                                    placeholder="123 Main St"
                                    className="pl-10 bg-[#131722] border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-primary/50"
                                    value={formData.addressLine1}
                                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Zip Code */}
                        <div className="space-y-2">
                            <Label htmlFor="postalCode" className="text-gray-300">Zip/Postal Code</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    id="postalCode"
                                    placeholder="Zip/Postal Code"
                                    className="pl-10 bg-[#131722] border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-primary/50"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Apt, Suite (Address Line 2) */}
                        <div className="space-y-2">
                            <Label htmlFor="addressLine2" className="text-gray-300">Apt, Suite, etc. (Optional)</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    id="addressLine2"
                                    placeholder="Apt, Suite"
                                    className="pl-10 bg-[#131722] border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-primary/50"
                                    value={formData.addressLine2}
                                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Delivery Instructions */}
                        <div className="space-y-2">
                            <Label htmlFor="deliveryInstructions" className="text-gray-300">Delivery Instructions (Optional)</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    id="deliveryInstructions"
                                    placeholder="e.g., Gate code, leave at door"
                                    className="pl-10 bg-[#131722] border-gray-700 text-white placeholder:text-gray-600 focus-visible:ring-primary/50"
                                    value={formData.deliveryInstructions}
                                    onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Default Checkbox */}
                        <div className="col-span-full flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="isDefault"
                                checked={formData.isDefault}
                                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked as boolean })}
                                className="border-gray-500 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                            />
                            <Label htmlFor="isDefault" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300">
                                Set as default address
                            </Label>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-0 sm:justify-end gap-3 bg-[#1a1f2e]">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="bg-gray-700 border-none text-white hover:bg-gray-600 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isPending}
                            className="bg-teal-600 hover:bg-teal-700 text-white border-none"
                        >
                            {isPending ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Save Address
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
