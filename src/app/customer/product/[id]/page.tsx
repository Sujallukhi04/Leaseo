import { getProductById } from "@/data/products";
import { CustomerNavbar } from "@/components/customer/CustomerNavbar";
import { ProductDetailClient } from "@/components/customer/ProductDetailClient";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    const primaryImage = product.images.find((img: any) => img.isPrimary)?.url || (product.images.length > 0 ? product.images[0].url : "");

    const serializedProduct = {
        ...product,
        costPrice: Number(product.costPrice),
        basePrice: Number(product.basePrice),
        securityDeposit: Number(product.securityDeposit),
        rentalPricing: product.rentalPricing.map((rp: any) => ({
            ...rp,
            price: Number(rp.price)
        }))
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <CustomerNavbar />

            <main className="flex-1 container mx-auto px-6 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/customer/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
                        <Home className="w-3 h-3" /> Home
                    </Link>
                    <ChevronRight className="w-3 h-3" />
                    <span>Products</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-foreground font-medium">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left: Images */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-muted/30 rounded-2xl overflow-hidden border">
                            {primaryImage ? (
                                <Image
                                    src={primaryImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    No Image Available
                                </div>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {product.images.map((img: any) => (
                                    <div key={img.id} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border cursor-pointer hover:border-primary transition-colors bg-muted/30">
                                        <Image src={img.url} alt={product.name} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Details (Client Component) */}
                    <div>
                        <ProductDetailClient product={serializedProduct} />

                        {/* Vendor Info */}
                        {product.vendor && (
                            <div className="mt-8 pt-8 border-t flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {product.vendor.companyName?.[0] || product.vendor.firstName?.[0] || "V"}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Provided by</p>
                                    <h4 className="font-semibold">{product.vendor.companyName || `${product.vendor.firstName} ${product.vendor.lastName}`}</h4>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
