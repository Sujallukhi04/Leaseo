import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SettingsPageClient } from "./settings-client";

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/login");
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            companyName: true,
            gstin: true,
        }
    });

    if (!user) {
        redirect("/auth/login");
    }

    return <SettingsPageClient user={user} />;
}
