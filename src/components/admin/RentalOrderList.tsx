"use client";

// Colors aligned with sidebar & kanban
const STATUS_STYLES: Record<string, string> = {
    DRAFT: "bg-purple-600 text-purple-100", // Quotation
    CONFIRMED: "bg-orange-500 text-orange-50", // Sale order
    IN_PROGRESS: "bg-green-600 text-green-50", // Confirmed (Active)
    COMPLETED: "bg-blue-500 text-blue-50", // Invoiced
    CANCELLED: "bg-red-500 text-red-50", // Cancelled
};

const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Quotation",
    CONFIRMED: "Sale order",
    IN_PROGRESS: "Confirmed",
    COMPLETED: "Invoiced",
    CANCELLED: "Cancelled",
};

interface RentalOrderListProps {
    orders: any[];
    onSelectOrder: (order: any) => void;
}

export function RentalOrderList({ orders, onSelectOrder }: RentalOrderListProps) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm font-sans">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-300">
                        <tr>
                            <th scope="col" className="p-4 w-4">
                                <div className="flex items-center">
                                    <input type="checkbox" className="w-4 h-4 text-sky-600 bg-slate-100 border-slate-300 rounded focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-slate-800 dark:focus:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600" />
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3 font-semibold">Order Reference</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Order Date</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Customer Name</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Product</th>
                            <th scope="col" className="px-6 py-3 font-semibold">Total</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-right">Rental Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                onClick={() => onSelectOrder(order)}
                                className="bg-white border-b dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                            >
                                <td className="w-4 p-4">
                                    <div className="flex items-center">
                                        <input type="checkbox" className="w-4 h-4 text-sky-600 bg-slate-100 border-slate-300 rounded focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-slate-800 dark:focus:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white font-mono">
                                    {order.orderNumber}
                                </td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                    Jan 22
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                    {order.customer.firstName} {order.customer.lastName}
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                    {order.items[0]?.product?.name}
                                    {order.items.length > 1 && <span className="text-xs text-slate-400 ml-1">+{order.items.length - 1}</span>}
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                    ${Number(order.totalAmount).toFixed(0)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={
                                        `inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-semibold min-w-[80px] ${STATUS_STYLES[order.status] || "bg-slate-100 text-slate-800"}`
                                    }>
                                        {STATUS_LABELS[order.status] || order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr className="bg-white dark:bg-slate-900">
                                <td colSpan={7} className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
