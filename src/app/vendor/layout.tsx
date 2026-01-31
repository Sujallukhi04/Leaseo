import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";

export default async function VendorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    // Strict Role Check for /vendor routes
    if (session.user.role !== "VENDOR") {
        // Redirect non-vendors to customer dashboard
        redirect("/customer/dashboard");
    }

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <VendorSidebar />
            </div>
            <main className="md:pl-72">
                {children}
            </main>
        </div>
    );
}
