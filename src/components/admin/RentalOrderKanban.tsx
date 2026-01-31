import { useMemo } from "react";
// import { formatDistanceToNow } from "date-fns";
import { DollarSign } from "lucide-react";

// Colors aligned with sidebar
const STATUS_STYLES: Record<string, string> = {
    DRAFT: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    CONFIRMED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    IN_PROGRESS: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
    DRAFT: "Quotation",
    CONFIRMED: "Sale order",
    IN_PROGRESS: "Confirmed",
    COMPLETED: "Invoiced",
    CANCELLED: "Cancelled",
};

interface RentalOrderKanbanProps {
    orders: any[];
    onSelectOrder: (order: any) => void;
}

export function RentalOrderKanban({ orders, onSelectOrder }: RentalOrderKanbanProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {orders.map((order) => (
                <div
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="cursor-pointer border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-4 flex flex-col justify-between h-[180px] shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
                >
                    {/* Top Row: Customer & Price */}
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Customer</p>
                            <h3 className="text-slate-900 dark:text-white font-medium text-lg truncate max-w-[120px]" title={`${order.customer.firstName} ${order.customer.lastName || ""}`}>
                                {order.customer.firstName} {order.customer.lastName || ""}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-500 text-xs font-mono mt-1">{order.orderNumber}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">Total</p>
                            <div className="text-slate-900 dark:text-white font-bold text-lg">
                                ${Number(order.totalAmount).toFixed(0)}
                            </div>
                        </div>
                    </div>

                    {/* Middle: Product Info */}
                    <div className="mt-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{order.items[0]?.product?.name}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            Rental Duration: {order.items[0]?.periodDuration} Days
                        </div>
                    </div>

                    {/* Bottom: Status Tag */}
                    <div className="flex justify-end mt-auto pt-2">
                        <span className={
                            `px-2.5 py-0.5 rounded-md text-xs font-medium border border-transparent ${STATUS_STYLES[order.status] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"}`
                        }>
                            {STATUS_LABELS[order.status] || order.status}
                        </span>
                    </div>
                </div>
            ))}

            {orders.length === 0 && (
                <div className="col-span-full h-64 flex items-center justify-center text-slate-500">
                    No orders found matching functionality.
                </div>
            )}
        </div>
    );
}
