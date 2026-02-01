"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Package,
    LayoutGrid,
    List,
    Eye,
    EyeOff,
    Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { VendorProduct, toggleProductPublish, deleteProduct } from "@/actions/vendor";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface VendorProductListProps {
    initialProducts: VendorProduct[];
    categories: { id: string; name: string }[];
}

export function VendorProductList({ initialProducts, categories }: VendorProductListProps) {
    const [products, setProducts] = useState(initialProducts);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Delete State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.sku || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = categoryFilter === "all" || product.category?.id === categoryFilter;

        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "published" && product.isPublished) ||
            (statusFilter === "draft" && !product.isPublished);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const handleTogglePublish = async (productId: string) => {
        try {
            const result = await toggleProductPublish(productId);
            if (result.success) {
                setProducts(products.map(p =>
                    p.id === productId ? { ...p, isPublished: !p.isPublished } : p
                ));
                toast.success("Product status updated");
            } else {
                toast.error(result.error || "Failed to update product");
            }
        } catch (error) {
            toast.error("Failed to update product");
        }
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        try {
            const result = await deleteProduct(productToDelete);
            if (result.success) {
                setProducts(products.filter(p => p.id !== productToDelete));
                toast.success("Product deleted");
                setDeleteDialogOpen(false);
            } else {
                toast.error(result.error || "Failed to delete product");
            }
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10 transition-colors duration-300">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Products</h1>

                    <div className="relative w-80 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-100 dark:bg-slate-800 border-none h-10 w-full focus-visible:ring-sky-500 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Mobile Search */}
                    <div className="relative flex-1 md:hidden">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-slate-100 dark:bg-slate-800 border-none h-10 w-full"
                        />
                    </div>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] h-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hidden sm:flex">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-md p-1 border border-slate-200 dark:border-slate-700 h-10 items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 px-2 rounded-sm", viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-slate-200 dark:hover:bg-slate-700")}
                            onClick={() => setViewMode("list")}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 px-2 rounded-sm", viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm" : "hover:bg-slate-200 dark:hover:bg-slate-700")}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Settings Button Removed */}

                    <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white gap-2 h-10">
                        <Link href="/vendor/products/new">
                            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Product</span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 scroll-smooth">
                {viewMode === "list" ? (
                    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Product</th>
                                        <th className="px-6 py-4 font-medium">Category</th>
                                        <th className="px-6 py-4 font-medium">SKU</th>
                                        <th className="px-6 py-4 font-medium text-right">Price</th>
                                        <th className="px-6 py-4 font-medium text-center">Stock</th>
                                        <th className="px-6 py-4 font-medium text-center">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Package className="w-8 h-8 opacity-50" />
                                                    <p>No products found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-md bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-300 dark:border-slate-700">
                                                            {product.images?.[0]?.url ? (
                                                                <img
                                                                    src={product.images[0].url}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                                    <Package className="w-5 h-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900 dark:text-slate-100">{product.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                    {product.category?.name || "Uncategorized"}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                    {product.sku}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-100">
                                                    ₹{product.basePrice.toLocaleString()}<span className="text-xs text-slate-500">/day</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${product.quantity > 0
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                        }`}>
                                                        {product.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant={product.isPublished ? "default" : "secondary"} className={product.isPublished ? "bg-sky-500 hover:bg-sky-600" : ""}>
                                                        {product.isPublished ? "Published" : "Draft"}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem asChild className="focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer">
                                                                <Link href={`/vendor/products/${product.id}`}>
                                                                    <Pencil className="w-4 h-4 mr-2" /> Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleTogglePublish(product.id)} className="focus:bg-slate-100 dark:focus:bg-slate-800 cursor-pointer">
                                                                {product.isPublished ? (
                                                                    <>
                                                                        <EyeOff className="w-4 h-4 mr-2" /> Unpublish
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Eye className="w-4 h-4 mr-2" /> Publish
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer"
                                                                onClick={() => {
                                                                    setProductToDelete(product.id);
                                                                    setDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group hover:border-sky-500/50 transition-all duration-300">
                                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                                    {product.images?.[0]?.url ? (
                                        <img
                                            src={product.images[0].url}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <Package className="w-12 h-12 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Badge variant={product.isPublished ? "default" : "secondary"} className={product.isPublished ? "bg-sky-500" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}>
                                            {product.isPublished ? "Published" : "Draft"}
                                        </Badge>
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button size="icon" variant="secondary" className="rounded-full" asChild>
                                            <Link href={`/vendor/products/${product.id}`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button size="icon" variant="destructive" className="rounded-full" onClick={() => {
                                            setProductToDelete(product.id);
                                            setDeleteDialogOpen(true);
                                        }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="mb-2">
                                        <h3 className="font-semibold text-slate-900 dark:text-white truncate" title={product.name}>{product.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{product.category?.name || "Uncategorized"}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                                            ₹{product.basePrice.toLocaleString()}
                                            <span className="text-sm font-normal text-slate-500 ml-1">/day</span>
                                        </div>
                                        <div className={`text-sm font-medium ${product.quantity > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                                            {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">
                            Are you sure you want to delete this product? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
