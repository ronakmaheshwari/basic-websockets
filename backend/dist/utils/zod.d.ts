import * as z from "zod";
declare const signupValidation: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
declare const loginValidation: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export type SignupType = z.infer<typeof signupValidation>;
export type LoginType = z.infer<typeof loginValidation>;
export { signupValidation, loginValidation };
//# sourceMappingURL=zod.d.ts.map