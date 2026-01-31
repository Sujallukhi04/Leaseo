import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/auth/login");
    }

    // Strict Role Check for /customer routes (if we want to prevent vendors viewing customer pages, usually vendors can also be customers, but let's see logic)
    // Usually Vendors can buy too. If not, uncomment below.
    /*
    if (session.user.role !== "CUSTOMER") {
       // Optional: Redirect vendors to vendor dashboard if they shouldn't shop?
       // redirect("/vendor/dashboard");
    }
    */

    return <>{children}</>;
}
