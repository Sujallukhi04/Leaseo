"use server";

import { getUserByEmail } from "@/data/user";
import { RegisterSchema } from "@/lib";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/token";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

export const Register = async (values: z.infer<typeof RegisterSchema>) => {
  const validation = RegisterSchema.safeParse(values);

  if (validation.error) return { error: "Error!", success: "" };

  console.log("Register data", validation.data);

  const { email, password, firstName, lastName } = validation.data;

  const name = `${firstName} ${lastName}`;

  const existinguser = await getUserByEmail(email);

  if (existinguser) return { error: "User already exist!", success: "" };

  const hashedPassord = await bcrypt.hash(password, 10);

  // Generate a unique coupon code for the new user
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  const userCouponCode = `WELCOME-${randomSuffix}10`;

  const user = await db.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassord,
      // Store the code assigned to them so we can show it in dashboard
      couponCode: userCouponCode
    },
  });

  // Create the actual Coupon record so it works
  await db.coupon.create({
    data: {
      code: userCouponCode,
      description: "Welcome Discount for New User",
      discountType: "PERCENTAGE",
      discountValue: 10,
      validFrom: new Date(),
      validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year validity
      usageLimit: 1, // One time use
      isActive: true,
      allowedUserId: user.id // Strict binding
    }
  });

  const verificationToken = await generateVerificationToken(email);

  try {
    if (existinguser) return { error: "User already exist!", success: "" };
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
      name
    );
  } catch (error) {
    console.error("Error while sending Verification Mail:", error);
    return { error: "Failed to send verification email. Check server logs.", success: "" };
  }
  return { success: "Confirmation email sent!" };
};
