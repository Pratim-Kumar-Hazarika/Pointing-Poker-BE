import { WebSocketServer } from "ws";
import { UserManager } from "./User/UserManager";


const PORT = 5000
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws,request) => {
    const origin = request.headers.origin;
    console.log("ORIGIN",{origin})
    if (origin !== 'https://estimatee.vercel.app') {
        ws.close(1008, 'Forbidden: Invalid Origin');
        return;
    }

    UserManager.getInstance().addUser(ws);
});

console.log(`WebSocket server started on port ${PORT} 🚀`);