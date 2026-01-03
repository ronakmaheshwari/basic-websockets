import { Router } from "express";
import userRouter from "./user.js";
const router = Router();
const allPath = [
    {
        router: userRouter,
        path: "/user"
    }
];
allPath.forEach((x) => {
    router.use(x.path, x.router);
});
export default router;
//# sourceMappingURL=router.js.map