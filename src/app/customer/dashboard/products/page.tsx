import { CustomerNavbar } from "@/components/customer/CustomerNavbar";
import { FilterSidebar } from "@/components/customer/FilterSidebar";
import { ProductCard } from "@/components/customer/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllProducts } from "@/data/products";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ minPrice?: string, maxPrice?: string }> }) {
    const { minPrice, maxPrice } = await searchParams;
    const products = await getAllProducts({
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <CustomerNavbar />

            <div className="flex flex-1 max-w-7xl mx-auto w-full">
                <FilterSidebar />

                <main className="flex-1 p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">All Products</h1>
                        <p className="text-muted-foreground">Explore our wide range of rental products.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.length === 0 ? (
                            <div className="col-span-full flex justify-center items-center h-64 text-muted-foreground">
                                No products found.
                            </div>
                        ) : (
                            products.map((product: any) => {
                                // Determine price and period to show
                                // Prioritize RentalPricing if exists, otherwise basePrice
                                const primaryPricing = product.rentalPricing && product.rentalPricing[0];
                                let displayPrice = "";
                                let displayPeriod = "";

                                if (primaryPricing) {
                                    displayPrice = `Rs ${primaryPricing.price.toString()}`;
                                    displayPeriod = primaryPricing.periodType.toLowerCase(); // e.g., 'daily', 'monthly'
                                } else {
                                    displayPrice = `Rs ${product.basePrice.toString()}`;
                                    displayPeriod = "day"; // Default assumption
                                }

                                const primaryImage = product.images.find((img: any) => img.isPrimary)?.url || product.images && product.images[0]?.url || "";

                                const vendorName = product.vendor ? (product.vendor.companyName || `${product.vendor.firstName || ''} ${product.vendor.lastName || ''}`.trim()) : "";
                                const categoryName = product.category ? product.category.name : "";

                                return (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        title={product.name}
                                        price={displayPrice}
                                        period={displayPeriod}
                                        status={product.quantity > 0 ? "In Stock" : "Out of Stock"}
                                        image={primaryImage}
                                        vendorName={vendorName}
                                        category={categoryName}
                                    />
                                );
                            })
                        )}
                    </div>

                    {/* Pagination Mockup */}
                    {products.length > 0 && (
                        <div className="flex justify-center items-center gap-2 mt-12">
                            <Button variant="outline" size="icon" disabled>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="default" size="sm" className="w-8 h-8 p-0">1</Button>
                            <Button variant="outline" size="sm" className="w-8 h-8 p-0">2</Button>
                            <span className="text-muted-foreground">...</span>
                            <Button variant="outline" size="icon">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
