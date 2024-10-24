import { WebSocket } from "ws";
import { IncomingMessage, MESSAGE_TYPES, OutgoingMessage } from './types'
import { SubscriptionManager } from "../Subscriptions/SubscriptionManager";
import { UserManager } from "./UserManager";

export class User{
    private id:string;
    private ws:WebSocket;

    constructor(id:string, ws:WebSocket){
        this.id = id;
        this.ws = ws;
        this.addEventListener()
    }

    private subscriptions:string[] = [];

    public subscribe(subscription:string){
        this.subscriptions.push(subscription);
    }

    public unsubscribe(subscription:string){
        this.subscriptions = this.subscriptions.filter(x => x!== subscription);
    }

    emit(message:any){
        this.ws.send(message);
    }

    private addEventListener(){
        this.ws.on('message', (message:string) =>{
            const parsedMessage:IncomingMessage = JSON.parse(message);
            console.log("Parsed Message",parsedMessage)
            if(parsedMessage.method ===MESSAGE_TYPES.SUBSCRIBE ){

                parsedMessage.params.forEach(s=>SubscriptionManager.getInstance().subscribe(this.id, s,parsedMessage.username, parsedMessage.moderatorId));
            }
             if(parsedMessage.method === MESSAGE_TYPES.UNSUBSCRIBE){
                parsedMessage.params.forEach(s=>SubscriptionManager.getInstance().unsubscribe(this.id,s));
            }
            if(parsedMessage.method === MESSAGE_TYPES.SEND_MESSAGE){

                SubscriptionManager.getInstance().redisPublishHandler(parsedMessage.data.channelId,JSON.stringify(parsedMessage.data),this.id) 
            }

            if(parsedMessage.method === MESSAGE_TYPES.HEART){
                this.ws.send(JSON.stringify({
                    type:"BEAT"
                }))
            }
        });
    }
}