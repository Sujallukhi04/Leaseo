import { redirect } from "next/navigation";

export default function VendorDashboardPage() {
  redirect("/dashboard/vendor/products");
}
