"use client";

import { useState, useMemo } from "react";
import {
    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon,
    TrendingUp,
    Users,
    CreditCard,
    Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { VendorOrder } from "@/actions/vendor";

interface VendorReportsClientProps {
    orders: VendorOrder[];
}

export function VendorReportsClient({ orders }: VendorReportsClientProps) {
    const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
    const [timeRange, setTimeRange] = useState("all");

    // --- Data Processing for Reports ---
    const stats = useMemo(() => {
        // Filter by time range if needed (omitted for brevity, implementing 'all' logic first)
        const filteredOrders = timeRange === 'all' ? orders : orders; // Add logic if needed

        const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const totalOrders = filteredOrders.length;
        const activeOrders = filteredOrders.filter(o => ['IN_PROGRESS', 'CONFIRMED'].includes(o.status)).length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            totalRevenue,
            totalOrders,
            activeOrders,
            averageOrderValue
        };
    }, [orders, timeRange]);

    const chartData = useMemo(() => {
        // Group by Month (using createdAt)
        const groups: Record<string, number> = {};

        // Sort orders by date first
        const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        sortedOrders.forEach(order => {
            const date = new Date(order.createdAt);
            const key = format(date, "MMM yyyy"); // e.g., "Jan 2024"
            groups[key] = (groups[key] || 0) + Number(order.totalAmount);
        });

        // Convert to array
        return Object.entries(groups).map(([name, value]) => ({ name, value }));
    }, [orders]);

    const statusData = useMemo(() => {
        const counts: Record<string, number> = {};
        orders.forEach(o => {
            counts[o.status] = (counts[o.status] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [orders]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Custom Tooltip for Dark Mode compatibility
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-md text-white">
                    <p className="font-semibold">{label}</p>
                    <p className="text-sky-400">
                        {payload[0].name === 'value' ? 'Revenue' : payload[0].name}:
                        {typeof payload[0].value === 'number'
                            ? (payload[0].name === 'value' || payload[0].name === 'Revenue' ? ` ₹${payload[0].value.toLocaleString()}` : ` ${payload[0].value}`)
                            : payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans p-6 space-y-6 overflow-y-auto duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 bg-white dark:bg-slate-900 sticky top-0 z-10 transition-colors duration-300 p-6 -mx-6 -mt-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reports</h1>
                    <p className="text-slate-500 dark:text-slate-400">Overview of your rental business performance</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Time Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">Based on {timeRange} orders</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-sky-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalOrders}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">All time included</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Rentals</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeOrders}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">Currently ongoing</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Order Value</CardTitle>
                        <Users className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">₹{stats.averageOrderValue.toFixed(0)}</div>
                        <p className="text-xs text-slate-500 dark:text-slate-500">Per transaction</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart Section */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col flex-1 min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Overview</h2>
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setChartType('bar')}
                            className={`h-8 w-9 rounded-none ${chartType === 'bar' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                        >
                            <BarChart3 className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-full bg-slate-200 dark:bg-slate-700" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setChartType('line')}
                            className={`h-8 w-9 rounded-none ${chartType === 'line' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                        >
                            <LineChartIcon className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-full bg-slate-200 dark:bg-slate-700" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setChartType('pie')}
                            className={`h-8 w-9 rounded-none ${chartType === 'pie' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                        >
                            <PieChartIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 w-full min-h-[300px]">
                    {chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400">
                            No data available for charts
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'bar' ? (
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                    <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.1 }} />
                                    <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            ) : chartType === 'line' ? (
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                                    <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: "#0ea5e9" }} />
                                </LineChart>
                            ) : (
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            )}
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
