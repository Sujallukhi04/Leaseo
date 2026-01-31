import { v4 as uuidv4 } from "uuid";
import { db } from "./db";
import { getVerifationTokenByEmail } from "@/data/verification-token";
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();

  //expire the token in 1hr
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerifationTokenByEmail(email);

  if (existingToken) {
    await db.token.delete({
      where: {
        id: existingToken.id,
        type: "EmailVerification",
      },
    });
  }

  const verficationToken = await db.token.create({
    data: {
      email,
      token,
      expires,
      type: "EmailVerification",
    },
  });

  return verficationToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await db.token.delete({
      where: {
        id: existingToken.id,
        type: "PasswordReset",
      },
    });
  }

  const passwordResetToken = await db.token.create({
    data: {
      email,
      token,
      expires,
      type: "PasswordReset",
    },
  });

  return passwordResetToken;
};
