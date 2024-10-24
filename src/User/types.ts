import { WebSocket } from "ws";

export enum MESSAGE_TYPES {
    SEND_MESSAGE= "SENDMESSAGE",
    SUBSCRIBE ="SUBSCRIBE",
    UNSUBSCRIBE= "UNSUBSCRIBE",
    HEART ="HEART"
}
export type OutgoingMessage = {
    method:MESSAGE_TYPES.SEND_MESSAGE,
    data:{
        channelId:string;
        content:string;
    }
}

export type SubscribeMessage = {
    method: MESSAGE_TYPES.SUBSCRIBE,
    params: string[] /// roomId,    
    username:string;
    moderatorId:string | null;
}

export type UnsubscribeMessage = {
    method: MESSAGE_TYPES.UNSUBSCRIBE,
    params: string[]/// roomId
}

export type AliveMessage = {
    method: MESSAGE_TYPES.HEART,
}
export type IncomingMessage = SubscribeMessage | UnsubscribeMessage | OutgoingMessage | AliveMessage;


// Structure
// {
//     "method": "SUBSCRIBE",
//     "params": ["room1"]
// }
// {
//     "method": "SENDMESSAGE",
//     "data": {
//       "channelId": "room1",
//       "content": "Hey"
//     }
//   }
  
// User Message types : 'total / join ' |'Voted' | 'pending'

// Structures :

const joinUserStructures = {
    "method":"SENDMESSAGE",
    "data":{
        "channelId":"room1",
        "type":"total/joined",
        "users":["pratim","elon"]
    }
}


////To frontend
const votedUserStructures = {
    "method":"SENDMESSAGE",
    "data":{
        "channelId":"room1",
        "type":"voted",
        "users":["pratim","elon"]
    }
}
const pendingUserStructures = {
    "method":"SENDMESSAGE",
    "data":{
        "channelId":"room1",
        "type":"pending",
        "users":["pratim","elon"]
    }
}

const chartDataStructure = {
    "method":"SENDMESSAGE",
    "data":{
        "channelId":"room1",
        "type":"chart",
        "data":[
            {
                "point":'1',
                "totalVotes":134 ,
                "voters":['pratim','elon'] 
            },
            {
                "point":'3',
                "totalVotes":134 ,
                "voters":['pratim','elon'] 
            }
        ]
    }
}
/*
From frontend for moderators
*/

type ModeratorPayload = {
    channelId:string;
    name:string;
    revealEstimates:boolean;
    restimate:boolean;
    newEstimate:{
        title:string;
        newStory:boolean
    }
}

/*
From frontend for participants
*/
type ParticipantPayload = {
    channelId:string
    vote:number
}



const participantPayload ={
    "method": "SENDMESSAGE",
    "data": {
      "channelId": "room1",
      "vote": 1
    }
  
}
const revealVotes = {
    "method": "SENDMESSAGE",
    "data": {
      "channelId": "room1",
      "reveal":true
    }
}
const resetVotes = {
    "method": "SENDMESSAGE",
    "data": {
      "channelId": "room1",
      "reset":true
    }
}
const newEstimation = {
    "method": "SENDMESSAGE",
    "data": {
      "channelId": "room1",
      "newEstimation":true
    }
}
const startEstimation = {
    "method": "SENDMESSAGE",
    "data": {
      "channelId": "room1",
      "title":'Some big titlle'
    }
}
type User = Array<{name:string;id:string}>
export type LiveRoomsData ={
    title:string;
    moderatorId:string | null;
    time:Date
    totalParticipants:User
    voted:User
    pending:User
    chartData:Array<{point:string;voters:User}>
    userVotes :Map<string,number>; 
    chartTemp :Map<number, User> 
    
}


const startEstimationX = {
    "method": "SENDMESSAGE",
    "data": {
      "channelId": "room1",
      "action":"reset" || "reveal"||"start"||"end"
    }
}

const moderatorLeftPayload = {
    "method":"SENDMESSAGE",
    "data": {
        "channelId":"room1",
        "reconnect":true
    }
}

export type IsAlive = {
    isAlive: boolean;
  };
  
  export interface AliveWebSocket extends WebSocket, IsAlive {}