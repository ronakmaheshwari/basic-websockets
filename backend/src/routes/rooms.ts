import { Request, Response, Router } from "express";
import ApiError from "../utils/error.js";
import userMiddleware from "../middleware.js";
import { signJWT } from "../utils/jwt.js";

const roomRouter: Router = Router();

export const randomCode = (length: number): String => {
    let randomLetters:string = "RON";
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let total;
    
    if(randomLetters.length < length){
        total = length-randomLetters.length;
    }else{
        total = randomLetters.length - length;
    }

    for(let i = 0;i<=total;i++){
        randomLetters += letters.charAt(Math.floor(Math.random()*letters.length));
    }
    return randomLetters;
} 

roomRouter.post("/create",userMiddleware,async(req: Request, res: Response, next)=> {
    try {
        const userId = req.userId;
        if (!userId) {
            throw ApiError.unauthorized("User not authenticated")
        }
        const {title,max} = req.body
        const findUser = await prisma?.user.findUnique({
            where:{
                id: userId
            }
        })
        if(!findUser){
            throw ApiError.unauthorized("Invalid User was found")
        }
        const code = randomCode(6);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
        const room = await prisma?.$transaction(async (x) => {
            const room = await x?.room.create({
                data:{
                    title: title,
                    roomAdmin: findUser.name,
                    roomCode: code as string,
                    maxUsers: max,
                    expiresAt
                }
            })

            await x.participant.create({
                data: { userId, roomId: room.id }
            })
            return room
        })
 
        const token = signJWT(findUser.id, room?.id);
        res.status(200).json({
            message: "Room was successfully created",
            token: token
        })
    } catch (error) {
        console.error("[CREATE-ROOM ERROR]", error);
        next(ApiError.internal("An unexpected error occurred during room creation"));
    }
})

roomRouter.post("/join", userMiddleware, async (req: Request, res: Response, next) => {
  try {
    const { roomCode } = req.body
    const userId = req.userId!

    const room = await prisma?.room.findUnique({
      where: { roomCode },
      include: { participants: true }
    })

    if (!room) throw ApiError.notFound("Room not found")
    if (room.expiresAt < new Date())
      throw ApiError.badRequest("Room expired")

    if (room.participants.length >= room.maxUsers)
      throw ApiError.badRequest("Room full")

    const exists = room.participants.some(p => p.userId === userId)
    if (exists) throw ApiError.badRequest("Already joined")

    await prisma?.participant.create({
      data: { userId, roomId: room.id }
    })

    res.json({
      token: signJWT(userId, room.id),
      roomId: room.id
    })
  } catch (e) {
    next(e)
  }
})

export default roomRouter;