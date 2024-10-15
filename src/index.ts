import { WebSocketServer } from "ws";
import { UserManager } from "./User/UserManager";


const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws,request) => {
    const origin = request.headers.origin;
    console.log("ORIGIN",{origin})
    if (origin !== 'https://estimatee.vercel.app' && origin !== 'http://localhost:3000') {
        ws.close(1008, 'Forbidden: Invalid Origin');
        return;
    }
    console.log("called,user-->>")

    UserManager.getInstance().addUser(ws);
});
setInterval(()=>{
    console.log("Running....")
},5000)


console.log("WebSocket server started on port 8080 🚀");