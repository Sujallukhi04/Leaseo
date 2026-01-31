import { db } from "@/lib/db";

export const getPasswordResetTokenByToken = async (token: string) => {
    try {
        const passwordResetToken = await db.token.findFirst({
            where: {
                token,
                type: "PasswordReset",
            },
        });

        return passwordResetToken;
    } catch {
        return null;
    }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
    try {
        const passwordResetToken = await db.token.findFirst({
            where: {
                email,
                type: "PasswordReset",
            },
        });

        return passwordResetToken;
    } catch {
        return null;
    }
};
