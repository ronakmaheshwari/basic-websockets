import jwt from "jsonwebtoken";
import ApiError from "./error.js";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw ApiError.internal("[JWT]: JWT_SECRET is not set");
}
export const signJWT = (userId, roomId) => {
    return jwt.sign({ userId, ...(roomId && { roomId }) }, JWT_SECRET, { expiresIn: "1d" });
};
export const verifyJWT = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch {
        throw ApiError.unauthorized("Invalid or expired token");
    }
};
