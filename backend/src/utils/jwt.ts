import jwt from "jsonwebtoken"
import ApiError from "./error.js"

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw ApiError.internal("[JWT]: JWT_SECRET is not set")
}

export interface JWTPayload {
  userId: string
  roomId?: string
}

export const signJWT = (userId: string, roomId?: string) => {
  return jwt.sign(
    { userId, ...(roomId && { roomId }) },
    JWT_SECRET,
    { expiresIn: "30m" }
  )
}

export const verifyJWT = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    throw ApiError.unauthorized("Invalid or expired token")
  }
}