import { WebSocketServer } from "ws";
import { UserManager } from "./User/UserManager";


const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
    UserManager.getInstance().addUser(ws);
});



console.log("WebSocket server started on port 8080 🚀");