import { WebSocket } from "ws";
import { IncomingMessage, MESSAGE_TYPES, OutgoingMessage } from "./types";

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

    emit(message:OutgoingMessage){
        this.ws.send(JSON.stringify(message));
    }

    private addEventListener(){
        this.ws.on('message', (message:string) =>{
            const parsedMessage:IncomingMessage = JSON.parse(message);
            if(parsedMessage.method ===MESSAGE_TYPES.SUBSCRIBE ){
                    ///redis subscribe
            }

            if(parsedMessage.method === MESSAGE_TYPES.UNSUBSCRIBE){
                ///redis unsubscribe
            }

            if(parsedMessage.method ===MESSAGE_TYPES.SEND_MESSAGE){
                   ///send messages
            }
        });
    }
}