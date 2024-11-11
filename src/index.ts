require('dotenv').config();
import { WebSocket, WebSocketServer } from "ws";
import { UserManager } from "./User/UserManager";
import { SubscriptionManager } from "./Subscriptions/SubscriptionManager";
import { AliveWebSocket } from "./User/types";
import { KafkaManager } from "./Kafka/KafkaManager";
import { getPgVersion } from "./Db/Db";
import { heartbeat } from './utils/ws';
import { getTotalCounts } from './postgress/queries';
import cron from "node-cron"

const WS_PORT = 5000;
const wss = new WebSocketServer({ port: WS_PORT });

let history = {
  totalUsers: 0,
  totalVotes: 0,
  totalSessions: 0,
}

//Initialize Kafka
KafkaManager.getInstance()
//Initialize Kafka
getPgVersion();

wss.on("connection", (ws, request) => {
  const origin = request.headers.origin;

  if (origin !== 'https://estimatee.vercel.app') {
    ws.close(1008, 'Forbidden: Invalid Origin');
    return;
}

  const aliveWs = ws as AliveWebSocket;
  aliveWs.isAlive = true;

  // When the server receives a pong, call the heartbeat function
  aliveWs.on('pong', function() {
    heartbeat.call(aliveWs); // Call heartbeat to mark the connection as alive
  });

  aliveWs.on("ping", () => {
    console.log("PING received from client");
  });
 
  UserManager.getInstance().addUser(aliveWs);
  //Send live data
  const liveData = SubscriptionManager.getInstance().sendLiveData()
  ws.send(liveData)
  ws.send(JSON.stringify({
    type:"historyData",
    data:history
  }))
});

// Ping clients  every 5 seconds to check if they are still alive
const interval = setInterval(function ping() {
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

cron.schedule('*/10 * * * *', async() => {
  try {
    const data = await getTotalCounts()
    history ={...data}
    console.log("Called cron",history)
  } catch (error) {
    console.log("Error")
  }
});

console.log(`WebSocket server started on port ${WS_PORT} 🚀`);
