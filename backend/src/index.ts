import express, { Request, Response } from "express"
import { WebSocketServer } from "ws"
import morgan from "morgan"
import router from "./routes/router.js";
import ApiError from "./utils/error.js";

const app = express()
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/v1",router);

app.use((err: any, req: Request, res: Response, next: Function) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error("Unexpected Error:", err);
  return res.status(500).json({ message: "Internal Server Error" });
});

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