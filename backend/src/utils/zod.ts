import * as z from "zod";

const signupValidation = z.object({
    name: z.string()
      .min(3, { message: "Your name must have more than 3 letters" })
      .max(20, { message: "Your name must have less than 20 letters" }),
    email: z.string()
      .email({ message: "Invalid email address" }),
    password: z.string()
      .min(4, { message: "Password must be at least 4 characters" })
      .max(64, { message: "Password must be at most 64 characters" })
});

const loginValidation = z.object({
    email: z.string()
      .email({ message: "Invalid email address" }),
    password: z.string()
      .min(4, { message: "Password must be at least 4 characters" })
      .max(64, { message: "Password must be at most 64 characters" })
});

export type SignupType = z.infer<typeof signupValidation>;
export type LoginType = z.infer<typeof loginValidation>;

export { signupValidation, loginValidation };