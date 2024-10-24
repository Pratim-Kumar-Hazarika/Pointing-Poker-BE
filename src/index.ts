require('dotenv').config();
import { WebSocket, WebSocketServer } from "ws";
import { UserManager } from "./User/UserManager";
import { SubscriptionManager } from "./Subscriptions/SubscriptionManager";
import { AliveWebSocket } from "./User/types";

const PORT = Number(process.env.WS_PORT ) || 5000;
const wss = new WebSocketServer({ port: PORT });

function heartbeat(this: AliveWebSocket) {
  this.isAlive = true;
}

wss.on("connection", (ws, request) => {
  const origin = request.headers.origin;

//   if (origin !== 'https://estimatee.vercel.app') {
//     ws.close(1008, 'Forbidden: Invalid Origin');
//     return;
// }

  const aliveWs = ws as AliveWebSocket;
  // Mark the WebSocket as alive when the connection is established
  aliveWs.isAlive = true;

  // When the server receives a pong, call the heartbeat function
  aliveWs.on('pong', function() {
    console.log("Received PONG from client");
    heartbeat.call(aliveWs); // Call heartbeat to mark the connection as alive
  });

  aliveWs.on("ping", () => {
    console.log("PING received from client");
  });

  UserManager.getInstance().addUser(aliveWs);

  //Send live data
  const liveData = SubscriptionManager.getInstance().sendLiveData()
  console.log(liveData)
  ws.send(liveData)
});

// Ping clients  every 5 seconds to check if they are still alive
const interval = setInterval(function ping() {
  console.log("Sending PING to clients");
  console.log("Wsss.clients",wss.clients.size)

  wss.clients.forEach(function each(ws: WebSocket) {
    const aliveWs = ws as AliveWebSocket;
    
    // If the client hasn't responded to the last ping, terminate the connection
    if (aliveWs.isAlive === false) return aliveWs.terminate();

    // Mark the connection as not alive and send a ping
    aliveWs.isAlive = false;
    aliveWs.ping();
  });
}, 5000);


// Clear interval on server close
wss.on('close', function close() {
  clearInterval(interval);
});

console.log(`WebSocket server started on port ${PORT} 🚀`);
