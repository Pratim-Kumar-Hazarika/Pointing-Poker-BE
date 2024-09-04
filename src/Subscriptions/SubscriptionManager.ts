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

    public subscribe(userId:string,subscriptionId:string){
        if(this.subscriptions.get(userId)?.includes(subscriptionId)){
            return;
        }

        this.subscriptions.set(userId,(this.subscriptions.get(userId) || []).concat(subscriptionId));
        this.reverseSubscriptions.set(subscriptionId,(this.reverseSubscriptions.get(subscriptionId) || []).concat(userId));

        if(this.reverseSubscriptions.get(subscriptionId)?.length===1){
            this.redisClient.subscribe(subscriptionId,this.redisCallBackHandler)
        }

    }

    public unsubscribe(userId:string,subscriptionId:string){
        const subscriptions = this.subscriptions.get(userId);
        if(subscriptions){
            this.subscriptions.set(userId,subscriptions.filter(s=> s!==subscriptionId))
        }
        const reverseSubscriptions = this.reverseSubscriptions.get(subscriptionId);
        if(reverseSubscriptions){
            this.reverseSubscriptions.set(subscriptionId, reverseSubscriptions.filter(s=> s!==userId))

            if(this.reverseSubscriptions.get(subscriptionId)?.length ===0){
                this.reverseSubscriptions.delete(subscriptionId)
                this.redisClient.unsubscribe(subscriptionId)
            }
        }

    }

    private redisCallBackHandler(message:string,channelId:string){
        const parsedMessage = JSON.parse(message);
        this.reverseSubscriptions.get(channelId)?.forEach( s => UserManager.getInstance().getUser(s)?.emit(parsedMessage))
    }

    public userLeft(userId:string){
        this.subscriptions.get(userId)?.forEach(s =>this.unsubscribe(userId,s))
    }
}