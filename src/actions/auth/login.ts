"use server";

import { SigninSchema } from "@/lib";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/token";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

export const Signin = async (
  values: z.infer<typeof SigninSchema>,
  callbackUrl?: string | null
) => {
  const validationeddFields = SigninSchema.safeParse(values);

  if (validationeddFields.error) return { error: "Invalid fields!" };

  const { email, password } = validationeddFields.data;

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!existingUser || !existingUser.email || !existingUser.password)
    return { error: "Email does not exist" };

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    try {
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
        existingUser.name
      );
    } catch (error) {
      console.error("Test email failed:", error);
    }

    return { error: "Email not verified. Confirmation email sent!" };
  }

  const check = await bcrypt.compare(password, existingUser.password);

  if (!check) return { error: "Invalid Password" };

  return { success: true, role: (existingUser as any).role };
};
