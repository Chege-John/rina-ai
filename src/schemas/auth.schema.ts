import { z, ZodType } from "zod";

export type UserRegistrationProps = {
  type: string;
  fullname: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  otp: string;
};

export const UserRegistrationSchema: ZodType<UserRegistrationProps> = z
  .object({
    type: z.string().min(1),
    fullname: z
      .string()
      .min(4, { message: "Fullname must be at least 4 characters" }),
    email: z.string().email({ message: "Invalid email" }),
    confirmEmail: z.string().email(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(32, { message: "Password must be at most 32 characters" })
      .refine(
        (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ""),
        "Password should contain only alphabets and numbers"
      ),
    confirmPassword: z.string(),
    otp: z.string().min(6, { message: "You must enter a 6 digit code" }),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((schema) => schema.email === schema.confirmEmail, {
    message: "Emails do not match",
    path: ["confirmEmail"],
  });

export type UserLoginProps = {
  email: string;
  password: string;
};

export const UserLoginSchema: ZodType<UserLoginProps> = z.object({
  email: z.string().email({ message: "You did not enter a valid email" }),
  password: z
    .string()
    .min(8, { message: "Your Password must be at least 8 characters" })
    .max(32, { message: "Your Password must be at most 32 characters" }),
});
