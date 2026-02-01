import { ProtectedLayout } from "@/components/ProtectedLayout";
import { VendorNavbar } from "@/components/vendor/VendorNavbar";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout requiredRole={["VENDOR", "ADMIN"]}>
      <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <VendorNavbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
          {children}
        </main>
      </div>
    </ProtectedLayout>
  );
}
