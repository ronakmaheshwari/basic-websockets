import express, { Request, Response } from "express"
import { WebSocketServer } from "ws"

const app = express()
app.use("/api/v1",)

const server = app.listen(3000, () => {
  console.log("HTTP + WS server running on port 3000");
});

const wss = new WebSocketServer({server: server})

wss.on("connection", function connection(ws,req){
    const ip = req.socket.remoteAddress;

    ws.on("error", console.error);

    setInterval(()=>{
        ws.send("The solana value is "+Math.random())
    },5000)

    ws.onopen = () =>{
        ws.send("You can send messages now");
    }

    ws.on("message", function message(data,isBinary) {

        if(data.toString()=== "ping"){
            wss.clients.forEach((x)=>{
                if(x.readyState === WebSocket.OPEN){
                    x.send("pong")
                }
            })
        }

        wss.clients.forEach(function each(client){
            if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(data, { binary: isBinary });
            }
        })
        
    })
   
    ws.on("ping", () =>{
        ws.send("pong");
        console.log(`Received ping from ${ip}`);
    })

    ws.send("Hello! Connection was accepted")
})