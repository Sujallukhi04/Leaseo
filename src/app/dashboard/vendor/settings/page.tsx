import { db } from "@/lib/db";
import { currentUser } from "@/hook/use-current-user";
import { Button } from "@/components/ui/button";

export default async function VendorSettingsPage() {
  const user = await currentUser();
  const profile = await db.vendorProfile.findUnique({ where: { userId: user?.id } });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Business Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Company Name</label>
          <p className="text-lg font-semibold">{profile?.businessName}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">GSTIN (Mandatory)</label>
          <p className="text-lg font-semibold">{profile?.gstNumber || "Not Set"}</p>
        </div>
        <div className="pt-4 border-t">
          <Button variant="secondary">Change Password</Button>
        </div>
      </div>
    </div>
  );
}