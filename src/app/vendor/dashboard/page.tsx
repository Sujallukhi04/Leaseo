import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function VendorDashboard() {
    const session = await auth();

    if (!session?.user?.id) {
        return <div className="p-8">Please log in.</div>;
    }

    // Fetch stats
    const productsCount = await db.product.count({
        where: { vendorId: session.user.id }
    });

    const orderItems = await db.rentalOrderItem.findMany({
        where: { product: { vendorId: session.user.id } },
        select: { orderId: true }
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeOrdersCount = new Set(orderItems.map((i: any) => i.orderId)).size;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
                <Link href="/vendor/dashboard/orders">
                    <Button variant="outline">View All Orders</Button>
                </Link>
            </div>
            <p>Welcome to your vendor dashboard.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-card border rounded-xl shadow-sm">
                    <h3 className="font-semibold text-lg">Total Products</h3>
                    <p className="text-3xl font-bold mt-2">{productsCount}</p>
                </div>
                <Link href="/vendor/dashboard/orders">
                    <div className="p-6 bg-card border rounded-xl shadow-sm hover:border-primary transition-colors cursor-pointer">
                        <h3 className="font-semibold text-lg">Active Orders</h3>
                        <p className="text-3xl font-bold mt-2">{activeOrdersCount}</p>
                    </div>
                </Link>
                <div className="p-6 bg-card border rounded-xl shadow-sm">
                    <h3 className="font-semibold text-lg">Revenue</h3>
                    <p className="text-3xl font-bold mt-2">₹0.00</p>
                </div>
            </div>

            <div className="mt-8">
                <Button>Add New Product</Button>
            </div>
        </div>
    );
}
