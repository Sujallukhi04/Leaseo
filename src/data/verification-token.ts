import { db } from "@/lib/db";

export const getVerifationTokenByEmail = async (email: string) => {
  try {
    const verifationToken = await db.token.findFirst({
      where: {
        email,
        type: "EmailVerification",
      },
    });

    return verifationToken;
  } catch (e) {
    return null;
  }
};

export const getVerifationTokenByToken = async (token: string) => {
  try {
    const verifationToken = await db.token.findFirst({
      where: {
        token,
        type: "EmailVerification",
      },
    });

    return verifationToken;
  } catch (e) {
    return null;
  }
};
