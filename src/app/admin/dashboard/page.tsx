import { getAdminRentalOrders } from "@/actions/admin";
import { DashboardClient } from "@/components/admin/DashboardClient";

export default async function AdminDashboardPage() {
    const { success, data, error } = await getAdminRentalOrders();

    if (!success) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-red-600">Error loading orders</h2>
                    <p className="text-slate-500">{error}</p>
                </div>
            </div>
        );
    }

    return <DashboardClient orders={data || []} />;
}
