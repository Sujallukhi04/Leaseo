import { auth } from "@/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Package, Calendar, ArrowLeft, User, MapPin } from "lucide-react";
import { VendorOrderActions } from "@/components/vendor/VendorOrderActions";

export default async function VendorOrdersPage() {
    const session = await auth();

    // TODO: Add strict role check if needed
    if (!session?.user?.id) {
        return <div className="p-8">Please log in.</div>;
    }

    // Fetch all items belonging to this vendor
    const vendorItems = await db.rentalOrderItem.findMany({
        where: {
            product: {
                vendorId: session.user.id
            }
        },
        include: {
            order: {
                include: {
                    customer: true,
                    address: true
                }
            },
            product: {
                include: {
                    images: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Group items by Order
    type GroupedOrder = {
        order: typeof vendorItems[0]['order'];
        items: typeof vendorItems;
    };

    const groupedOrders: Record<string, GroupedOrder> = {};

    vendorItems.forEach((item: any) => {
        if (!groupedOrders[item.orderId]) {
            groupedOrders[item.orderId] = {
                order: item.order,
                items: []
            };
        }
        groupedOrders[item.orderId].items.push(item);
    });

    const ordersList = Object.values(groupedOrders).sort((a, b) =>
        new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime()
    );

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                <div className="flex items-center gap-4">
                    <Link href="/vendor/dashboard">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Vendor Orders</h1>
                </div>

                {ordersList.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <div className="flex flex-col items-center gap-2">
                            <Package className="h-12 w-12 text-muted-foreground" />
                            <h3 className="font-semibold text-lg">No Orders Yet</h3>
                            <p className="text-muted-foreground">When customers order your products, they will appear here.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {ordersList.map(({ order, items }) => (
                            <Card key={order.id} className="overflow-hidden border-l-4 border-l-primary">
                                <CardHeader className="bg-muted/40 py-4">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Order Number</p>
                                            <p className="font-bold font-mono text-lg">{order.orderNumber}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Date</p>
                                            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Customer</p>
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3 text-muted-foreground" />
                                                <span className="font-medium">{order.customer.firstName || order.customer.name || "Guest"}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <VendorOrderActions orderId={order.id} currentStatus={order.status} />
                                                <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Items Requested</h4>
                                        {items.map((item: any) => (
                                            <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-4 rounded-lg border bg-card/50 hover:bg-muted/20 transition-colors">
                                                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
                                                    {item.product.images[0] ? (
                                                        <Image
                                                            src={item.product.images[0].url}
                                                            alt={item.product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-xs">No Image</div>
                                                    )}
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="font-bold text-lg">{item.product.name}</h5>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>{new Date(item.rentalStartDate).toLocaleDateString()} - {new Date(item.rentalEndDate).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-lg">Rs {Number(item.totalPrice).toLocaleString()}</p>
                                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t text-sm">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-muted-foreground text-xs">Unit Price</span>
                                                            <span className="font-medium">Rs {Number(item.unitPrice).toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-muted-foreground text-xs">Rental Type</span>
                                                            <span className="font-medium">{item.periodType}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Address Section if available */}
                                        {order.address && (
                                            <div className="mt-6 pt-6 border-t">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                                    <div className="text-sm">
                                                        <p className="font-semibold mb-1">Delivery Address</p>
                                                        <p>{order.address.addressLine1}</p>
                                                        {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                                                        <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                                                        <p>{order.address.country}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
