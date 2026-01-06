import { Router } from "express";
import userRouter from "./user.js";
import roomRouter from "./rooms.js";
const router = Router();
const allPath = [
    {
        router: userRouter,
        path: "/user"
    },
    {
        router: roomRouter,
        path: "/room"
    }
];
allPath.forEach((x) => {
    router.use(x.path, x.router);
});
export default router;
