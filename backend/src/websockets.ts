import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv"
dotenv.config()
import { redis, redisSub } from "./utils/pubsub.js";
import { verifyJWT } from "./utils/jwt.js";
import express from "express"
import db from "./utils/db.js";

//import { server } from "./server.js";

const app = express();

interface AuthedSocket extends WebSocket {
  userId?: string
  roomId?: string
}

enum PayloadEnums {
  AUTH = "AUTH",
  MESSAGE = "MESSAGE"
}

interface PayloadInterface {
    type: PayloadEnums,
    token?: string,
    content?: string
}

const server = app.listen(3001,() => {
    console.log("WS Running on port 3001")
})

const wss = new WebSocketServer({server: server});

(async () => {
  await redisSub.pSubscribe("room:*", (message) => {
    const parse = JSON.parse(message)
    wss.clients.forEach((ws) => {
      const socket = ws as AuthedSocket
      if (socket.roomId === parse.roomId) {
        socket.send(JSON.stringify(parse))
      }
    })
  })
})().catch(console.error)

wss.on("connection",(ws) => {
    const socket = ws as AuthedSocket;
    
    socket.on("message",async(raw) => {
        let payload: PayloadInterface;
        try {
            payload = JSON.parse(raw.toString());
        } catch  {
            return;
        }

        if(payload.type === PayloadEnums.AUTH) {
            try {
                if(!payload.token){
                    socket.close(1008,"No token was provided");
                    return
                }
                const {userId, roomId} = verifyJWT(payload.token);
                if(!userId || !roomId) {
                    socket.close(1008,"Invalid token was provided");
                    return
                }
                socket.userId = userId;
                socket.roomId = roomId;
                const message = await db.message.findMany({
                    where:{
                        roomId: socket.roomId
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    take: 20
                })

                message?.forEach((x) => {
                    socket.send(JSON.stringify({replay: true, ...x}));
                })
                socket.send(JSON.stringify({ type: "AUTH_OK" }))
            } catch {
                socket.close(1008, "Invalid token")
            }
            return
        }

        if (!socket.userId || !socket.roomId) {
            socket.close(1008, "Unauthorized")
            return
        }

        if(payload.type === PayloadEnums.MESSAGE){
            if(!payload.content){
                socket.close(1008,"No content was provided")
                return
            }
            
            const createMessage = await db.message.create({
                data:{
                    senderId: socket.userId,
                    roomId: socket.roomId,
                    content: payload.content
                }
            })

            await redis.publish(
                `room:${socket.roomId}`,
                JSON.stringify(createMessage)
            );
        }

    })

    socket.on("close", async() =>{
        if(!socket.userId || !socket.roomId) return;
        await db.participant.delete({
            where: {
                roomId_userId: {
                    userId: socket.userId,
                    roomId: socket.roomId
                }
            }
        })
    })
})