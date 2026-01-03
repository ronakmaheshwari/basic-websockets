import * as z from "zod";
const signupValidation = z.object({
    name: z.string().min(3, { error: "Your name must have more than 3 letters" }).max(20, { error: "Your name must have less than 20 letters" }),
    email: z.email({ error: "Invalid email address" }),
    password: z.string().min(4).max(64)
});
const loginValidation = z.object({
    email: z.email({ error: "Invalid email address" }),
    password: z.string().min(4).max(64)
});
export { signupValidation, loginValidation };
//# sourceMappingURL=zod.js.map