export enum MESSAGE_TYPES {
    SEND_MESSAGE= "SENDMESSAGE",
    SUBSCRIBE ="SUBSCRIBE",
    UNSUBSCRIBE= "UNSUBSCRIBE"
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
    params: string[] /// roomId
}

export type UnsubscribeMessage = {
    method: MESSAGE_TYPES.UNSUBSCRIBE,
    params: string[]/// roomId
}

export type IncomingMessage = SubscribeMessage | UnsubscribeMessage | OutgoingMessage;


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
const revealEstimatesPlayload = {
    "method": "SENDMESSAGE",
    "data": {
      "channelId": "room1",
      "reveal":true
    }
}
const restimatePayload = {
    "method": "SENDMESSAGE",
    "data": {
      "channelId": "room1",
      "restimate":true
    }
}
type User = Array<{name:string;id:string}>
export type LiveRoomsData ={
    totalParticipants:User
    voted:User
    pending:User
    chartData:Array<{point:string;voters:User}>
    userVotes :Map<string,number>; 
    chartTemp :Map<number, User> 

}

