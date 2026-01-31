import { VendorNavbar } from "@/components/vendor/Navbar";
import { AuthGate } from "@/components/Providers/AuthGate";
import { UserRole } from "@prisma/client";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate allowedRole={UserRole.VENDOR}>
      <div className="min-h-screen bg-zinc-950 text-white">
        <VendorNavbar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </AuthGate>
  );
}
