import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ApiError from "./error.js";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw ApiError.internal(`[JWT]: ENV Variable ${JWT_SECRET} is not set!`);
}
const signJWT = (userId, roomId) => {
    return jwt.sign({ userId: userId, ...(roomId && { roomId: roomId }) }, JWT_SECRET, { expiresIn: "30m" });
};
const verifyJWT = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
export { signJWT, verifyJWT };
//# sourceMappingURL=jwt.js.map