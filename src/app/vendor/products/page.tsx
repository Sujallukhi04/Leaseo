import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import Link from "next/link";
import { ProductClientActions } from "@/components/vendor/product-client-actions";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function VendorProductsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return <div className="p-8">Please log in.</div>;
    }

    const products = await db.product.findMany({
        where: {
            vendorId: session.user.id,
        },
        include: {
            category: true,
            images: {
                where: {
                    isPrimary: true,
                },
                take: 1,
            },
            inventory: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                <Link href="/vendor/products/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            {products.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">No products found</h3>
                        <p className="text-muted-foreground mb-4">
                            Get started by adding your first product for rent.
                        </p>
                        <Link href="/vendor/products/new">
                            <Button>Add New Product</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Base Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Inventory</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                                    No Img
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{product.sku}</TableCell>
                                    <TableCell>{product.category?.name || "Uncategorized"}</TableCell>
                                    <TableCell>₹{Number(product.basePrice).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.isPublished ? "default" : "secondary"}>
                                            {product.isPublished ? "Published" : "Draft"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{product.quantity} in stock</TableCell>
                                    <TableCell className="text-right">
                                        <ProductClientActions productId={product.id} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
