import { Router } from "express";
import userRouter from "./user.js";

const router: Router = Router();

interface RouterInterface {
    router: Router,
    path: string
}

const allPath: RouterInterface[] = [
    {
        router: userRouter,
        path: "/user"
    }
]

allPath.forEach((x) => {
    router.use(x.path, x.router);
})

export default router;