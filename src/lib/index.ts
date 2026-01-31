import * as z from "zod";

const passwordValidation = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$#!%*?&]{8,}$/
);

export const SigninSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "password should be minmum 8 characters" })
    .regex(passwordValidation, {
      message:
        "Password should include digits(0-9),special symbols(@,#,&...),Uppercase (A-Z),lowercase(a-z) letters",
    }),
});

export const RegisterSchema = z
  .object({
    email: z.string().email({ message: "Email field is empty!" }),
    password: z
      .string()
      .min(8, { message: "password should be minmum 8 characters" })
      .regex(passwordValidation, {
        message:
          "Password should include digits(0-9),special symbols(@,#,&...),Uppercase (A-Z),lowercase(a-z) letters",
      }),
    confirmPassword: z
      .string()
      .min(8, { message: "password should be minmum 8 characters" })
      .regex(passwordValidation, {
        message:
          "Password should include digits(0-9),special symbols(@,#,&...),Uppercase (A-Z),lowercase(a-z) letters",
      }),
    firstName: z.string().min(1, {
      message: "First Name is required!",
    }),
    lastName: z.string().min(1, {
      message: "Last Name is required!",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const VendorRegisterSchema = z
  .object({
    email: z.string().email({ message: "Email field is empty!" }),
    password: z
      .string()
      .min(8, { message: "password should be minmum 8 characters" })
      .regex(passwordValidation, {
        message:
          "Password should include digits(0-9),special symbols(@,#,&...),Uppercase (A-Z),lowercase(a-z) letters",
      }),
    confirmPassword: z.string(),
    firstName: z.string().min(1, { message: "First Name is required!" }),
    lastName: z.string().min(1, { message: "Last Name is required!" }),
    businessName: z.string().min(1, { message: "Business Name is required!" }),
    gstNumber: z.string().min(15, { message: "GST Number must be 15 characters" }).max(15, { message: "GST Number must be 15 characters" }),
    // Removed productCategory as it's not in the new VendorProfile schema
    // Added defaults/optional fields could be handled here if we expanded the form, but keeping minimal for now.
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ResetSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
});

export const NewPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Minimum 8 characters" })
    .regex(passwordValidation, {
      message: "Password too weak",
    }),
});

export const ProductSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  basePrice: z.coerce.number().min(0, { message: "Base price must be positive" }),
  costPrice: z.coerce.number().min(0, { message: "Cost price must be positive" }),
  quantity: z.coerce.number().min(0, { message: "Quantity must be positive" }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  images: z.array(z.string()).min(1, { message: "At least one image is required" }),
  isPublished: z.boolean().default(false),
  minRentalPeriod: z.coerce.number().min(1, { message: "Minimum rental period is 1" }).default(1),
  securityDeposit: z.coerce.number().min(0).default(0),
});
