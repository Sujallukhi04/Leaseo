import { CustomerNavbar } from "@/components/customer/CustomerNavbar";
import AddressListClient from "@/components/customer/AddressListClient";
import { auth } from "@/auth";
import { getAddresses } from "@/actions/customer/address";
import { redirect } from "next/navigation";

export default async function AddressesPage() {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        redirect("/");
    }

    const addresses = await getAddresses(user.id);

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            <CustomerNavbar />
            <div className="max-w-4xl mx-auto p-6 pt-10">
                <AddressListClient userId={user.id} addresses={addresses} />
            </div>
        </div>
    );
}
