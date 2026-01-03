import { Request, Response, Router } from "express";
import ApiError from "../utils/error.js";
import { loginValidation, SignupType, signupValidation } from "../utils/zod.js";
import bcrypt from "bcrypt";
import db from "../utils/db.js";
import { signJWT } from "../utils/jwt.js";
import dotenv from "dotenv"
import { fi } from "zod/v4/locales";

dotenv.config()

const userRouter:Router = Router();
const SaltRound = process.env.saltround || "10"

if(!SaltRound){
    throw ApiError.internal(`No Saltrounds were provided ${SaltRound}`);
}

userRouter.post("/signup", async(req: Request, res: Response) => {
    try {
        const parsed = signupValidation.safeParse(req.body);
        if(!parsed.success){
            throw ApiError.badRequest(`Invalid data was provided ${parsed.error.flatten().fieldErrors}`)
        }
        const {name, email, password}: SignupType = parsed.data;
        const emailCheck = await db.user.findUnique({
            where:{
                email
            }
        })

        if(emailCheck){
            throw ApiError.conflict(`The given email ${email} already exists`);
        }

        const hashedPassword =await bcrypt.hash(password,SaltRound);
        const createUser = await db.user.create({
            data:{
                name: name,
                email: email,
                password: hashedPassword
            }
        })
        const token = signJWT(createUser.id);
        res.status(200).json({
            message: `${createUser.name} successfully created an account`,
            token: token
        })

    } catch (error) {
        throw ApiError.internal(`[SIGNUP ERROR]: Error took place ${error}`)
    }
})

userRouter.post("/login",async(req: Request,res: Response) => {
    try {
        const parsed = loginValidation.safeParse(req.body);
        if(!parsed.success){
            throw ApiError.badRequest(`Invalid data was provided ${parsed.error.flatten().fieldErrors}`)
        }
        const {email,password} = parsed.data;
        const findEmail = await db.user.findUnique({
            where:{
                email
            }
        })
        if(!findEmail){
            throw ApiError.notFound(`The given ${email} doesn't have an account`);
        }
        const hashedPassword = await bcrypt.compare(password,findEmail.password);
        if(!hashedPassword){
            throw ApiError.unauthorized("Invalid Password was provided");
        }
        const token = signJWT(findEmail.id);
        res.status(200).json({
            message: `${findEmail.email} successfully logged-in`,
            token: token
        })
    } catch (error) {
        throw ApiError.internal(`[LOGIN ERROR]: Error took place ${error}`)
    }
})

export default userRouter;