"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  FileText,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import {
  getVendorDashboardStats,
  getVendorRecentOrders,
  VendorStats,
  VendorOrder,
} from "@/actions/vendor";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-500 dark:bg-slate-700",
  CONFIRMED: "bg-sky-500",
  IN_PROGRESS: "bg-orange-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Quotation",
  CONFIRMED: "Sale Order",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          getVendorDashboardStats(),
          getVendorRecentOrders(5),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
        if (ordersRes.success && ordersRes.data) {
          setRecentOrders(ordersRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Welcome back! Here&apos;s your business overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-sky-500 hover:bg-sky-600 text-white">
            <Link href="/vendor/orders/new">
              <ShoppingCart className="mr-2 h-4 w-4" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats?.totalRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-slate-500">
              <TrendingUp className="inline h-3 w-3 mr-1 text-emerald-500" />
              From all completed orders
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-slate-500">
              <span className="text-orange-500">
                {stats?.pendingOrders || 0}
              </span>{" "}
              pending orders
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Products</CardTitle>
            <Package className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalProducts || 0}
            </div>
            <p className="text-xs text-slate-500">
              Active products in catalog
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Customers</CardTitle>
            <Users className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalCustomers || 0}
            </div>
            <p className="text-xs text-slate-500">
              Unique customers served
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Active Rentals
            </CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeRentals || 0}
            </div>
            <p className="text-xs text-slate-500">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Draft Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.draftInvoices || 0}
            </div>
            <p className="text-xs text-slate-500">Pending to send</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Overdue Invoices
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats?.overdueInvoices || 0}
            </div>
            <p className="text-xs text-slate-500">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-sky-500 hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link href="/vendor/orders">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <p>No orders yet</p>
              <p className="text-sm">
                Orders will appear here when customers place them.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">{order.orderNumber}</span>
                        <Badge
                          className={`${statusColors[order.status]} text-white border-none`}
                        >
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {order.customer.firstName} {order.customer.lastName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-slate-900 dark:text-white">
                        ₹{order.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" asChild className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                      <Link href={`/vendor/orders/${order.id}`}>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-sky-500 transition-colors cursor-pointer group">
          <Link href="/vendor/products/new">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-sky-500/10 p-3 group-hover:bg-sky-500/20 transition-colors">
                <Package className="h-6 w-6 text-sky-500" />
              </div>
              <div>
                <p className="font-medium">Add Product</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Create a new rental product
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-sky-500 transition-colors cursor-pointer group">
          <Link href="/vendor/orders/new">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-blue-500/10 p-3 group-hover:bg-blue-500/20 transition-colors">
                <ShoppingCart className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Create Order</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  New rental order
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-sky-500 transition-colors cursor-pointer group">
          <Link href="/vendor/invoices">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-emerald-500/10 p-3 group-hover:bg-emerald-500/20 transition-colors">
                <FileText className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="font-medium">Manage Invoices</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  View and create invoices
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-sky-500 transition-colors cursor-pointer group">
          <Link href="/vendor/customers">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-orange-500/10 p-3 group-hover:bg-orange-500/20 transition-colors">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="font-medium">View Customers</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Customer management
                </p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
