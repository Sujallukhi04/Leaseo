"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Save, Settings, X, Info } from "lucide-react";
import {
    createProduct,
    updateProduct,
    getCategories,
    getAttributes,
    createAttribute,
    addAttributeValue,
    generateVariants,
    ProductAttributeData,
} from "@/actions/vendor";
import { RentalPeriodType } from "@prisma/client";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { Switch } from "@/components/ui/switch";

type RentalPricing = {
    id: string;
    periodType: RentalPeriodType;
    duration: number;
    price: number;
};

type AttributeLine = {
    id: string;
    attributeId: string;
    attributeName: string;
    selectedValues: { id: string; value: string }[];
};

interface VendorProductFormProps {
    initialData?: any; // Using any for flexibility with backend types, but prefer strong typing if possible
    isEditMode?: boolean;
}

export function VendorProductForm({ initialData, isEditMode = false }: VendorProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [attributes, setAttributes] = useState<ProductAttributeData[]>([]);

    // Form state
    // If initialData is provided, populate state, otherwise defaults
    const [name, setName] = useState(initialData?.name || "");
    const [sku, setSku] = useState(initialData?.sku || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
    const [categoryId, setCategoryId] = useState(initialData?.category?.id || initialData?.categoryId || "");
    const [costPrice, setCostPrice] = useState(initialData?.costPrice?.toString() || "");
    const [basePrice, setBasePrice] = useState(initialData?.basePrice?.toString() || "");
    const [securityDeposit, setSecurityDeposit] = useState(initialData?.securityDeposit?.toString() || "");
    const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || "0");
    const [minRentalPeriod, setMinRentalPeriod] = useState(initialData?.minRentalPeriod?.toString() || "1");
    const [maxRentalPeriod, setMaxRentalPeriod] = useState(initialData?.maxRentalPeriod?.toString() || "");
    const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);
    const [productType, setProductType] = useState<"goods" | "service">("goods"); // Not in initialData typing explicitly in example

    // Handle complex nested initial data
    const initialRentalPricing = initialData?.rentalPricing?.map((rp: any) => ({
        id: rp.id || crypto.randomUUID(),
        periodType: rp.periodType,
        duration: rp.duration,
        price: rp.price
    })) || [];
    const [rentalPricing, setRentalPricing] = useState<RentalPricing[]>(initialRentalPricing);

    const initialImages = initialData?.images?.map((img: any) => ({
        url: img.url,
        isPrimary: img.isPrimary
    })) || [];
    const [images, setImages] = useState<{ url: string; publicId?: string }[]>(initialImages);

    // Attribute state
    // For edit mode, we might need to parse variants back to attribute lines if that logic exists, 
    // but for now keeping it simple as per original "New Product" complexity.
    // Re-generating variants on edit might be complex so typically attributes are locked or managed differently.
    // I will assume for MVP/Standardization we keep the Attribute UI active primarily for Creation or simpler editing.
    const [attributeLines, setAttributeLines] = useState<AttributeLine[]>([]);
    const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
    const [selectedAttributeLine, setSelectedAttributeLine] = useState<AttributeLine | null>(null);

    // Fetch common data
    useEffect(() => {
        const fetchData = async () => {
            const [categoriesResult, attributesResult] = await Promise.all([
                getCategories(),
                getAttributes(),
            ]);
            if (categoriesResult.success && categoriesResult.data) {
                setCategories(categoriesResult.data);
            }
            if (attributesResult.success && attributesResult.data) {
                setAttributes(attributesResult.data);
            }
        };
        fetchData();
    }, []);

    // Generate SKU from name (Only for NEW products)
    useEffect(() => {
        if (!isEditMode && name && !sku) {
            const generatedSku =
                name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) +
                "-" +
                Date.now().toString().slice(-4);
            setSku(generatedSku);
        }
    }, [name, isEditMode, sku]);

    // -- Handlers (Same as original NewProductPage) --
    const addRentalPricing = () => {
        setRentalPricing([
            ...rentalPricing,
            {
                id: crypto.randomUUID(),
                periodType: "DAILY",
                duration: 1,
                price: parseFloat(basePrice) || 0,
            },
        ]);
    };

    const removeRentalPricing = (id: string) => {
        setRentalPricing(rentalPricing.filter((rp) => rp.id !== id));
    };

    const updateRentalPricing = (id: string, updates: Partial<RentalPricing>) => {
        setRentalPricing(
            rentalPricing.map((rp) => (rp.id === id ? { ...rp, ...updates } : rp)),
        );
    };

    const addAttributeLine = () => {
        setAttributeLines([
            ...attributeLines,
            {
                id: crypto.randomUUID(),
                attributeId: "",
                attributeName: "",
                selectedValues: [],
            },
        ]);
    };

    const removeAttributeLine = (id: string) => {
        setAttributeLines(attributeLines.filter((line) => line.id !== id));
    };

    const updateAttributeLine = (id: string, attributeId: string) => {
        const attr = attributes.find((a) => a.id === attributeId);
        setAttributeLines(
            attributeLines.map((line) =>
                line.id === id
                    ? {
                        ...line,
                        attributeId,
                        attributeName: attr?.name || "",
                        selectedValues: [],
                    }
                    : line,
            ),
        );
    };

    const openConfigureDialog = (line: AttributeLine) => {
        setSelectedAttributeLine(line);
        setConfigureDialogOpen(true);
    };

    const toggleValueSelection = (valueId: string, value: string) => {
        if (!selectedAttributeLine) return;

        const isSelected = selectedAttributeLine.selectedValues.some(
            (v) => v.id === valueId,
        );

        const updatedValues = isSelected
            ? selectedAttributeLine.selectedValues.filter((v) => v.id !== valueId)
            : [...selectedAttributeLine.selectedValues, { id: valueId, value }];

        setSelectedAttributeLine({
            ...selectedAttributeLine,
            selectedValues: updatedValues,
        });
    };

    const saveConfigureDialog = () => {
        if (!selectedAttributeLine) return;
        setAttributeLines(
            attributeLines.map((line) =>
                line.id === selectedAttributeLine.id ? selectedAttributeLine : line,
            ),
        );
        setConfigureDialogOpen(false);
        setSelectedAttributeLine(null);
    };

    const getAvailableAttributes = () => {
        const usedAttributeIds = attributeLines.map((line) => line.attributeId);
        return attributes.filter((attr) => !usedAttributeIds.includes(attr.id));
    };

    // -- Submit --
    const handleSubmit = async () => {
        if (!name.trim()) return toast.error("Product name is required");
        if (!sku.trim()) return toast.error("SKU is required");
        if (!basePrice || parseFloat(basePrice) <= 0) return toast.error("Valid sales price is required");

        setLoading(true);
        try {
            const payload = {
                name: name.trim(),
                sku: sku.trim(),
                description: description.trim() || undefined,
                shortDescription: shortDescription.trim() || undefined,
                categoryId: categoryId || undefined,
                costPrice: parseFloat(costPrice) || 0,
                basePrice: parseFloat(basePrice),
                securityDeposit: parseFloat(securityDeposit) || 0,
                quantity: parseInt(quantity) || 0,
                minRentalPeriod: parseInt(minRentalPeriod) || 1,
                maxRentalPeriod: maxRentalPeriod ? parseInt(maxRentalPeriod) : undefined,
                isPublished,
                images: images.length > 0 ? images.map((img, index) => ({
                    url: img.url,
                    isPrimary: index === 0,
                })) : undefined,
                rentalPricing: rentalPricing.length > 0 ? rentalPricing.map((rp) => ({
                    periodType: rp.periodType,
                    duration: rp.duration,
                    price: rp.price,
                })) : undefined,
            };

            if (isEditMode) {
                // Update Logic
                const result = await updateProduct(initialData.id, payload);
                if (result.success) {
                    toast.success("Product updated successfully");
                    router.push("/vendor/products");
                } else {
                    toast.error(result.error || "Failed to update product");
                }
            } else {
                // Create Logic
                const result = await createProduct(payload);
                if (result.success && result.data) {
                    // Logic for Variants generation
                    const validAttributeLines = attributeLines.filter(
                        (line) => line.attributeId && line.selectedValues.length > 0,
                    );
                    if (validAttributeLines.length > 0) {
                        const attributeValueGroups = validAttributeLines.map((line) => ({
                            attributeId: line.attributeId,
                            valueIds: line.selectedValues.map((v) => v.id),
                        }));
                        const variantResult = await generateVariants(result.data.id, attributeValueGroups);
                        if (variantResult.success) {
                            toast.success(`Product created with ${variantResult.data?.count} variants`);
                        } else {
                            toast.warning("Product created, but variants generation had issues");
                        }
                    } else {
                        toast.success("Product created successfully");
                    }
                    router.push("/vendor/products");
                } else {
                    toast.error(result.error || "Failed to create product");
                }
            }
        } catch (error) {
            toast.error("Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 z-10 bg-white dark:bg-slate-900 pb-4 pt-4 px-2 -mx-2 border-b border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
                {/* We can make this header sticky if needed, but styling locally for now */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/vendor/products">
                            <ArrowLeft className="h-5 w-5 text-slate-500" />
                        </Link>
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {isEditMode ? `Edit ${initialData?.name || 'Product'}` : "New Product"}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {isEditMode ? "Manage product details and pricing" : "Add a new product to your catalog"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <Label htmlFor="publish-mode" className="text-xs font-medium px-2 cursor-pointer">
                            {isPublished ? "Published" : "Draft"}
                        </Label>
                        <Switch id="publish-mode" checked={isPublished} onCheckedChange={setIsPublished} />
                    </div>
                    <Button variant="outline" asChild className="hidden sm:flex">
                        <Link href="/vendor/products">Cancel</Link>
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="min-w-[120px] bg-sky-500 hover:bg-sky-600 text-white">
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? "Saving..." : "Save Product"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Info */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Professional DSLR Camera Kit"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="sku"
                                        placeholder="PROD-001"
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value.toUpperCase())}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label>Product Type</Label>
                                <div className="flex gap-4">
                                    <div className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${productType === 'goods' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/10' : 'border-slate-200 dark:border-slate-700'}`} onClick={() => setProductType('goods')}>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${productType === 'goods' ? 'border-sky-500' : 'border-slate-400'}`}>
                                            {productType === 'goods' && <div className="w-2 h-2 rounded-full bg-sky-500" />}
                                        </div>
                                        <span className="text-sm font-medium">Physical Goods</span>
                                    </div>
                                    <div className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${productType === 'service' ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/10' : 'border-slate-200 dark:border-slate-700'}`} onClick={() => setProductType('service')}>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${productType === 'service' ? 'border-sky-500' : 'border-slate-400'}`}>
                                            {productType === 'service' && <div className="w-2 h-2 rounded-full bg-sky-500" />}
                                        </div>
                                        <span className="text-sm font-medium">Service</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="shortDesc">Short Description</Label>
                                <Input
                                    id="shortDesc"
                                    placeholder="Brief summary for list views..."
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="desc">Full Description</Label>
                                <textarea
                                    id="desc"
                                    className="flex min-h-[150px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Detailed product information..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>


                    {/* Attributes Section (Only show if creating new product for simplicity in this V1 version) */}
                    {!isEditMode && (
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Attributes & Variants</CardTitle>
                                <Button variant="outline" size="sm" onClick={addAttributeLine} disabled={getAvailableAttributes().length === 0 && attributeLines.length > 0}>
                                    <Plus className="w-4 h-4 mr-2" /> Add Attribute
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {/* Attribute Line Logic reused from original, styled better */}
                                <div className="space-y-4">
                                    {attributeLines.map(line => (
                                        <div key={line.id} className="flex gap-4 items-start p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                                            <div className="w-1/3">
                                                <Select value={line.attributeId} onValueChange={(val) => updateAttributeLine(line.id, val)}>
                                                    <SelectTrigger><SelectValue placeholder="Attribute" /></SelectTrigger>
                                                    <SelectContent>
                                                        {attributes.map(a => (
                                                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex-1 flex flex-wrap gap-2 min-h-[40px] items-center p-2 rounded border border-dashed border-slate-300 dark:border-slate-700">
                                                {line.selectedValues.length === 0 && <span className="text-sm text-slate-400">No values selected</span>}
                                                {line.selectedValues.map(v => (
                                                    <Badge key={v.id} variant="secondary">{v.value}</Badge>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openConfigureDialog(line)} disabled={!line.attributeId}>
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeAttributeLine(line.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {attributeLines.length === 0 && (
                                        <div className="text-center py-6 text-sm text-slate-500">
                                            Add attributes like "Color" or "Size" to generate variants.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Pricing & Images */}
                <div className="space-y-8">
                    {/* Images */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Images</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ImageUpload
                                value={images}
                                onChange={setImages}
                                maxImages={5}
                                folder="products"
                            />
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Base Price (Per Day)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Cost Price</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={costPrice}
                                        onChange={(e) => setCostPrice(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Security Deposit</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={securityDeposit}
                                        onChange={(e) => setSecurityDeposit(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory & Rental Rules */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle>Inventory & Rules</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Available Quantity</Label>
                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Min. Rental (Days)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={minRentalPeriod}
                                        onChange={(e) => setMinRentalPeriod(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max. Rental (Days)</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="Unlimited"
                                        value={maxRentalPeriod}
                                        onChange={(e) => setMaxRentalPeriod(e.target.value)}
                                        className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Configure Value Dialog */}
            <Dialog open={configureDialogOpen} onOpenChange={setConfigureDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select Values for {selectedAttributeLine?.attributeName}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {selectedAttributeLine && (
                            <div className="flex flex-wrap gap-2">
                                {attributes.find(a => a.id === selectedAttributeLine.attributeId)?.values.map(val => (
                                    <Badge
                                        key={val.id}
                                        variant={selectedAttributeLine.selectedValues.some(v => v.id === val.id) ? "default" : "outline"}
                                        className="cursor-pointer text-sm py-1 px-3"
                                        onClick={() => toggleValueSelection(val.id, val.value)}
                                    >
                                        {val.value}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setConfigureDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveConfigureDialog}>Done</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
