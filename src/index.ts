require('dotenv').config();
import express from 'express';
import { WebSocket, WebSocketServer } from "ws";
import { UserManager } from "./User/UserManager";
import { SubscriptionManager } from "./Subscriptions/SubscriptionManager";
import { AliveWebSocket } from "./User/types";
import { KafkaManager } from "./Kafka/KafkaManager";
import { getPgVersion } from "./Db/Db";
import { heartbeat } from './utils/ws';
import { getTotalCounts } from './postgress/queries';


const WS_PORT = 5001;
const HTTP_PORT =5003
const app = express();
const wss = new WebSocketServer({ port: WS_PORT });

app.get('/', async (req, res) => {
  const origin = req.headers.origin;
   if (origin !== 'https://estimatee.vercel.app') {
    res.json({
      message: "Hire me 🚀. My website: <a href='https://prratim.com' target='_blank'>prratim.com</a>. My Email: <a href='mailto:prratimhazarika@gmail.com'>prratimhazarika@gmail.com</a>"
    });
    return;
  }
  try {
    const data = await getTotalCounts()
    res.json({
    status:200,
    data:data
  })
  } catch (error) {
    res.json({
      status:400,
      error:'error'
    })
  }
});


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
    // console.log("PING received from client");
  });
 
  UserManager.getInstance().addUser(aliveWs);
  //Send live data
  const liveData = SubscriptionManager.getInstance().sendLiveData()
  ws.send(liveData)
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


//Initialize Kafka
KafkaManager.getInstance()
//Initialize Kafka
getPgVersion();

// Clear interval on server close
wss.on('close', function close() {
  clearInterval(interval);
});

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`HTTP server started on port ${HTTP_PORT} 🚀`);
});
console.log(`WebSocket server started on port ${WS_PORT} 🚀`);
