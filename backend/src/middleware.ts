import dotenv from "dotenv"
import ApiError from "./utils/error.js"
import { NextFunction, Request, Response } from "express"
import { verifyJWT } from "./utils/jwt.js"

dotenv.config()

declare global {
    namespace Express {
        interface Request {
            userId?: string,
            roomId?: string,
            token?: string
        }
    }
}

export default function userMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith("Bearer ")) {
      return next(ApiError.unauthorized("Missing or invalid authorization header"))
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyJWT(token)

    req.userId = decoded.userId
    if (decoded.roomId) req.roomId = decoded.roomId
    req.token = token

    next()
  } catch (error) {
    next(error)
  }
}