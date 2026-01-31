import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const start = Date.now();

        // Fetch User and Vendor Profile in parallel for efficiency
        const [user, vendorProfile] = await Promise.all([
            db.user.findUnique({
                where: { id: session.user.id },
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    companyName: true,
                    gstin: true,
                },
            }),
            db.vendorProfile.findUnique({
                where: { userId: session.user.id },
            }),
        ]);

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const data = {
            ...user,
            ...vendorProfile,
            // Fallback for fields that might be in User but not VendorProfile yet
            businessName: vendorProfile?.businessName || user.companyName || "",
            gstNumber: vendorProfile?.gstNumber || user.gstin || "",
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error("[VENDOR_SETTINGS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        const body = await req.json();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const {
            firstName,
            lastName,
            businessName,
            gstNumber,
            businessEmail,
            businessPhone,
            currentPassword,
            newPassword,
        } = body;

        // Password Update Logic
        if (currentPassword && newPassword) {
            const user = await db.user.findUnique({
                where: { id: session.user.id },
            });

            if (!user || !user.password) {
                return new NextResponse("User not found", { status: 404 });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

            if (!isPasswordValid) {
                return new NextResponse("Invalid current password", { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 12);

            await db.user.update({
                where: { id: session.user.id },
                data: {
                    password: hashedPassword,
                    isPasswordChanged: true,
                },
            });
        }

        // Profile Update Logic
        // Update User table
        await db.user.update({
            where: { id: session.user.id },
            data: {
                firstName,
                lastName,
                companyName: businessName,
                gstin: gstNumber,
            },
        });

        // Update VendorProfile table
        const existingProfile = await db.vendorProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (existingProfile) {
            await db.vendorProfile.update({
                where: { userId: session.user.id },
                data: {
                    businessName,
                    businessEmail,
                    businessPhone,
                    gstNumber,
                },
            });
        } else {
            await db.vendorProfile.create({
                data: {
                    userId: session.user.id,
                    businessName: businessName || "",
                    businessEmail: businessEmail,
                    businessPhone: businessPhone,
                    gstNumber: gstNumber,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[VENDOR_SETTINGS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
