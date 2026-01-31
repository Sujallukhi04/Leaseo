import { getAdminRentalOrders } from "@/actions/admin";
import { ReportsClient } from "@/components/admin/ReportsClient";

export default async function ReportsPage() {
    const { success, data } = await getAdminRentalOrders();
    const orders = success ? data : [];

    return (
        <ReportsClient orders={orders || []} />
    );
}
