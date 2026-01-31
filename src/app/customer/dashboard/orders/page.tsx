import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CustomerNavbar } from "@/components/customer/CustomerNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Package, Calendar, ChevronRight } from "lucide-react";

export default async function OrdersPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return <div className="p-8">Please log in to view orders.</div>;
    }

    const orders = await db.rentalOrder.findMany({
        where: {
            customerId: session.user.id
        },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="min-h-screen bg-background pb-12">
            <CustomerNavbar />

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex items-center gap-3 mb-8">
                    <Package className="h-8 w-8 text-primary" />
                    <h1 className="text-3xl font-bold">My Orders</h1>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 border rounded-xl bg-muted/20 border-dashed">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No orders yet</h3>
                        <p className="text-muted-foreground mb-6">Looks like you haven't placed any orders yet.</p>
                        <Link href="/customer/dashboard">
                            <Button>Start Shopping</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                                <CardHeader className="bg-muted/40 flex flex-row items-center justify-between py-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Order Placed</p>
                                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Total</p>
                                        <p className="font-medium">Rs {Number(order.totalAmount).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Order #</p>
                                        <p className="font-medium">{order.orderNumber}</p>
                                    </div>
                                    <div>
                                        <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex gap-6 items-center">
                                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
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
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-lg">{item.product.name}</h4>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(item.rentalStartDate).toLocaleDateString()} - {new Date(item.rentalEndDate).toLocaleDateString()}
                                                        </span>
                                                        <span>Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Button variant="outline" size="sm">View Product</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
