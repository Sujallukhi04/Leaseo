import { getCart } from "@/actions/customer/cart";
import { auth } from "@/auth";
import { CheckoutClient } from "@/components/customer/checkout/CheckoutClient";
import { CustomerNavbar } from "@/components/customer/CustomerNavbar";

export default async function CheckoutPage() {
    const session = await auth();
    const { cart } = await getCart();

    return (
        <div className="min-h-screen bg-background">
            <CustomerNavbar />
            <CheckoutClient cart={cart} userId={session?.user?.id} />
        </div>
    );
}
