import { Request, Response, Router } from "express";
import ApiError from "../utils/error.js";
import userMiddleware from "../middleware.js";
import { signJWT } from "../utils/jwt.js";
import { createRoomValidation, joinRoomValidation } from "../utils/zod.js";
import { formatZodErrors } from "./user.js";

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

    for(let i = 0;i<total;i++){
        randomLetters += letters.charAt(Math.floor(Math.random()*letters.length));
    }
    return randomLetters;
} 

roomRouter.get("/",userMiddleware,async(req: Request, res: Response, next) => {
  try {
    const userId = req.userId;
    if(!userId){
      throw ApiError.unauthorized;
    }
    const findRoom = await prisma?.participant.findMany({
      where:{
        userId: userId
      },
      select:{
        room: true
      }
    })
    res.status(200).json({
      message: "All the rooms that user joined successfully fetched",
      data: findRoom
    })
  } catch (error) {
    console.log("[JOIN ERROR]: Error took place at joining a room", error)
    next(ApiError.internal);
  }
})


roomRouter.get("/:id/leave",userMiddleware,async(req: Request, res: Response, next) => {
  try {
    const userId = req.userId;
    const roomId = req.params.id;
    if(!userId){
      throw ApiError.unauthorized;
    }
    const findRoom = await prisma?.room.findUnique({
      where:{
        roomCode: roomId
      }
    })
    if(!findRoom){
      throw ApiError.notFound("Invalid Room Code was provided")
    }
    if(findRoom.expiresAt < new Date()){
      throw ApiError.notFound("The room is already expired")
    }

    const removal = await prisma?.$transaction(async(x) => {
      await x.participant.delete({
        where: {
          roomId_userId: {
            userId: userId,
            roomId: findRoom.id
          }
        }
      })
      await x.message.deleteMany({
        where:{
          senderId: userId,
          roomId: roomId
        }
      })
    });
    
    res.status(200).json({
      message: "User successfully left the room",
      data: removal
    })
  } catch (error) {
    console.log("[LEAVE ERROR]: Error took place while leaving a room", error)
    next(ApiError.internal);
  }
})

roomRouter.get("/details",userMiddleware,async(req: Request, res: Response, next)=> {
  try {
    const userId = req.userId;
    const roomId = req.roomId;
    if(!userId || !roomId){
      return res.status(401).json({
        message: "Unauthorized user tried to access"
      })
    }
    const findData = await prisma?.room.findUnique({
      where: {
        id: roomId,
        participants: {
          some: {
            userId: userId
          }
        }
      },
      select: {
        title: true,
        maxUsers: true,
        roomAdmin: true,
        roomCode: true,
        participants: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
    });
    const countUsers = await prisma?.participant.count({
      where:{
        roomId: roomId,
        userId: userId
      },
    })
    const data = {
      ...findData,
      countUsers
    }
    res.status(200).json({
      message: "Details were successfully fetched",
      data: data
    })
  } catch (error) {
    console.log("[ROOM DETAILS ERROR]: Error took place at getting details a room", error)
    res.status(500).json({
      message: "Internal Error occured"
    })
  }
})

roomRouter.post("/create",userMiddleware,async(req: Request, res: Response, next)=> {
    try {
        const userId = req.userId;
        if (!userId) {
            throw ApiError.unauthorized("User not authenticated")
        }
        const parsed = createRoomValidation.safeParse(req.body);
        if(!parsed.success){
          const messages = formatZodErrors(parsed.error.flatten().fieldErrors);
          return next(ApiError.badRequest(`Invalid data was provided: ${messages}`));
        }
        const {title,max} = parsed.data;
        const findUser = await prisma?.user.findUnique({
            where:{
                id: userId
            }
        })
        if(!findUser){
            throw ApiError.unauthorized("Invalid User was found")
        }
        const code = randomCode(6);
        const expiresAt = new Date(Date.now() + 10 * 60 * 10000)
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
    const userId = req.userId
    if(!userId){
      throw ApiError.unauthorized;
    }
    const parsed = joinRoomValidation.safeParse(req.body);
    if(!parsed.success){
      const messages = formatZodErrors(parsed.error.flatten().fieldErrors);
      return next(ApiError.badRequest(`Invalid data was provided: ${messages}`));
    }
    const {roomCode} = parsed.data;
    const findRoom = await prisma?.room.findUnique({
      where:{
        roomCode
      },
      include:{
        participants: true
      }
    })
    if(!findRoom){
      throw ApiError.notFound("Invalid Room code was provided");
    }

    if(findRoom.expiresAt < new Date()){
      throw ApiError.notFound("Room that you provided was already expired")
    }

    if(findRoom.participants.length >= findRoom.maxUsers){
      throw ApiError.conflict("Maximum users in the room already reached")
    }

    const alreadyExists = findRoom.participants.some(x => x.userId === userId);
    if(alreadyExists){
      throw ApiError.conflict("User is already in the room");
    }

    await prisma?.participant.create({
      data:{
        userId: userId,
        roomId: findRoom.id
      }
    })
    const token = signJWT(userId,findRoom.id);
    res.status(200).json({
      message: "User successfully joined the room",
      token: token
    })
  } catch (error) {
    console.log("[JOIN ERROR]: Error took place at joining a room", error)
    next(ApiError.internal);
  }
})

export default roomRouter;