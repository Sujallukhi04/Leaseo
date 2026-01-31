import { CustomerNavbar } from "@/components/customer/CustomerNavbar";
import ProfilePageClient from "@/components/customer/ProfilePage";

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-muted/30">
            <CustomerNavbar />
            <div className="py-8">
                <ProfilePageClient />
            </div>
        </div>
    );
}
