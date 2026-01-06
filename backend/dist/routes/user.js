import { Router } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import ApiError from "../utils/error.js";
import { signupValidation, loginValidation } from "../utils/zod.js";
import db from "../utils/db.js";
import { signJWT } from "../utils/jwt.js";
dotenv.config();
const userRouter = Router();
const SaltRound = parseInt(process.env.saltround || "10");
if (!SaltRound) {
    throw ApiError.internal("No saltrounds were provided");
}
export const formatZodErrors = (errors) => Object.entries(errors)
    .map(([field, errs]) => `${field}: ${errs?.join(", ")}`)
    .join("; ");
userRouter.post("/signup", async (req, res, next) => {
    try {
        const parsed = signupValidation.safeParse(req.body);
        if (!parsed.success) {
            const messages = formatZodErrors(parsed.error.flatten().fieldErrors);
            return next(ApiError.badRequest(`Invalid data was provided: ${messages}`));
        }
        const { name, email, password } = parsed.data;
        const emailCheck = await db.user.findUnique({ where: { email } });
        if (emailCheck) {
            return next(ApiError.conflict(`The given email ${email} already exists`));
        }
        const hashedPassword = await bcrypt.hash(password, SaltRound);
        const createUser = await db.user.create({
            data: { name, email, password: hashedPassword },
        });
        const token = signJWT(createUser.id);
        res.status(200).json({
            message: `${createUser.name} successfully created an account`,
            token,
        });
    }
    catch (error) {
        console.error("[SIGNUP ERROR]", error);
        next(ApiError.internal("An unexpected error occurred during signup"));
    }
});
userRouter.post("/login", async (req, res, next) => {
    try {
        const parsed = loginValidation.safeParse(req.body);
        if (!parsed.success) {
            const messages = formatZodErrors(parsed.error.flatten().fieldErrors);
            return next(ApiError.badRequest(`Invalid data was provided: ${messages}`));
        }
        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return next(ApiError.notFound(`The given email ${email} doesn't have an account`));
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return next(ApiError.unauthorized("Invalid password was provided"));
        }
        const token = signJWT(user.id);
        res.status(200).json({
            message: `${user.email} successfully logged-in`,
            token,
        });
    }
    catch (error) {
        console.error("[LOGIN ERROR]", error);
        next(ApiError.internal("An unexpected error occurred during login"));
    }
});
export default userRouter;
