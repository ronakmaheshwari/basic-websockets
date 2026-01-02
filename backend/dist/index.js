import express from "express";
import { WebSocketServer } from "ws";
const app = express();
const server = app.listen(3000, () => {
    console.log("HTTP + WS server running on port 3000");
});
const wss = new WebSocketServer({ server: server });
wss.on("connection", function connection(ws, req) {
    const ip = req.socket.remoteAddress;
    console.log(`Server got hit by ${ip}`);
    ws.on("error", console.error);
    ws.on("message", function message(data, isBinary) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data, { binary: isBinary });
            }
        });
    });
    ws.send("Hello! Connection was accepted");
});
const ws = new WebSocket("ws://localhost:3000");
ws.onmessage = (msg) => console.log(msg.data);
ws.onopen = () => ws.send("Hello from client");
//# sourceMappingURL=index.js.map