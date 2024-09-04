import { RedisClientType,createClient } from "redis";

import { UserManager } from "../User/UserManager";

export class SubscriptionManager{
    private static instance: SubscriptionManager
    private redisClient: RedisClientType;

    private subscriptions: Map<string,string[]> = new Map();
    private reverseSubscriptions: Map<string,string[]> = new Map();


    private constructor(){
        this.redisClient = createClient();
        this.redisClient.connect();
    }

    public static getInstance(){
        if(!this.instance){
             this.instance = new SubscriptionManager()
        }
        return this.instance;
    }

    public subscribe(userId:string,subscriptionId:string){}

    public unsubscribe(userId:string,subscriptionId:string){}

    private redisCallBackHandler(message:string,channelId:string){
        const parsedMessage = JSON.parse(message);
        this.reverseSubscriptions.get(channelId)?.forEach( s => UserManager.getInstance().getUser(s)?.emit(parsedMessage))
    }

    public userLeft(userId:string){
        this.subscriptions.get(userId)?.forEach(s =>this.unsubscribe(userId,s))
    }
}