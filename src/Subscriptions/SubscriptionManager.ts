import { RedisClientType, createClient } from "redis";
import { UserManager } from "../User/UserManager";
import { LiveRoomsData } from "../User/types";

export class SubscriptionManager {
    private static instance: SubscriptionManager;
    private redisClient: RedisClientType;
    private publishClient: RedisClientType;

    private subscriptions: Map<string, string[]> = new Map();
    private reverseSubscriptions: Map<string, string[]> = new Map();
    private liveRoomData:Map<string,LiveRoomsData[]> = new Map();

    private constructor() {
        this.redisClient = createClient();
        this.publishClient = createClient();
        // Connect both clients with async/await to ensure connection
        this.connectClients();
    }

    private async connectClients() {
        try {
            await this.redisClient.connect();
            await this.publishClient.connect();  // Ensure publishClient is connected
            console.log("Redis clients connected successfully");
        } catch (error) {
            console.error("Error connecting to Redis:", error);
        }
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new SubscriptionManager();
        }
        return this.instance;
    }

    public subscribe(userId: string, subscription: string) {
        if (this.subscriptions.get(userId)?.includes(subscription)) {
            return;
        }


        this.subscriptions.set(userId, (this.subscriptions.get(userId) || []).concat(subscription));
        this.reverseSubscriptions.set(subscription, (this.reverseSubscriptions.get(subscription) || []).concat(userId));

        let liveRoom = this.liveRoomData.get(subscription);
      
        if(!liveRoom ){
            liveRoom = [{totalParticipants: [],voted: [],pending: [],chartData: [],chartTemp:new Map(),userVotes:new Map()}];
            this.liveRoomData.set(subscription, liveRoom);
        }
        const userExists = liveRoom[0].totalParticipants.find(user=>user.id === userId)
        if(!userExists){
            // Add user to live room
            liveRoom[0].totalParticipants.push({name: `Pratim-${userId}`, id: userId})

        }
        if (this.reverseSubscriptions.get(subscription)?.length === 1) {
            this.redisClient.subscribe(subscription, this.redisCallbackHandler);
        }
        this.sendTotalParticpantsHandler(subscription)
    }
    public async sendTotalParticpantsHandler(channelId:string){
        try {
            if (!this.publishClient.isOpen) {
                await this.publishClient.connect();  
            }
            const liveRoom = this.liveRoomData.get(channelId)
           if(liveRoom){
            this.publishClient.publish(channelId, JSON.stringify({
                type:"totalParticipants",
                data:liveRoom[0].totalParticipants
           }));
        }
        }catch (error) {
            console.error("Error publishing to Redis:", error);
        }
        
    }

    public unsubscribe(userId: string, subscriptionId: string) {
        const subscriptions = this.subscriptions.get(userId);
        let liveRoom = this.liveRoomData.get(subscriptionId);
        if (subscriptions) {
            this.subscriptions.set(userId, subscriptions.filter(s => s !== subscriptionId));
        }

        const reverseSubscriptions = this.reverseSubscriptions.get(subscriptionId);
        if (reverseSubscriptions) {
            this.reverseSubscriptions.set(subscriptionId, reverseSubscriptions.filter(s => s !== userId));

            // Remove user from live room
            if (liveRoom) {
                liveRoom[0].totalParticipants = liveRoom[0].totalParticipants.filter(participant => participant.id !== userId); 
            }
            if(liveRoom){
                console.log("unsubscribe")
                console.log( liveRoom[0].totalParticipants)
            }
            this.sendTotalParticpantsHandler(subscriptionId)
            if (this.reverseSubscriptions.get(subscriptionId)?.length === 0) {
                this.reverseSubscriptions.delete(subscriptionId);
                this.redisClient.unsubscribe(subscriptionId);
            }
          
        }
    }

    public async redisPublishHandler(channelId: string, message: string,userId:string) {
        try {
            if (!this.publishClient.isOpen) {
                await this.publishClient.connect();  // Ensure the client is open before publishing
            }
            // 
            const messageX = JSON.parse(message)
            if(messageX.vote){
                // Engine
                this.liveRoomDataHandler(channelId, message, userId)
            }
            // Check if moderator
            if(messageX.reveal){
                this.revealVotesHandler(channelId)
            }
            if(messageX.restimate){
                this.restimateHandler(channelId)
            }
          
        } catch (error) {
            console.error("Error publishing to Redis:", error);
        }
    }
    private restimateHandler(channelId:string){
        // **Check if moderator
        const liveRoom = this.liveRoomData.get(channelId);
        if(!liveRoom){
            return;

        }
        liveRoom[0].chartData=[]
        this.publishClient.publish(channelId, JSON.stringify(liveRoom[0].chartData));
}
    private revealVotesHandler(channelId:string){
        // **Check if moderator
        const liveRoom = this.liveRoomData.get(channelId);
        if(!liveRoom){
            return;

        }
        liveRoom[0].chartTemp.forEach((voters, point) => {
            liveRoom[0].chartData.push({
              point: point.toString(), 
              voters: voters 
            });
          });
     this.publishClient.publish(channelId, JSON.stringify(liveRoom[0].chartData));
    }
    private liveRoomDataHandler(channelId: string, message: string, userId: string) {        
        const liveRoom = this.liveRoomData.get(channelId);
        if (!liveRoom) {
            return;
        }
    
        const pendingVoters = liveRoom[0].totalParticipants;
        const filterPendingVoters = pendingVoters.filter(user => user.id !== userId);
    
        const votedParticipant = liveRoom[0].totalParticipants.find((user) => user.id === userId);
        const ifInVotedList = liveRoom[0].voted.find((user) => user.id===userId);
        // First Vote
        if(liveRoom[0].voted.length ===0){
            if (votedParticipant) {
                liveRoom[0].voted.push(votedParticipant);
                liveRoom[0].pending.push(...filterPendingVoters)
            }
        }else if(liveRoom[0].voted.length >=1){
            if(votedParticipant){
                if(!ifInVotedList){
                    liveRoom[0].voted.push(votedParticipant)
                }
                liveRoom[0].pending = liveRoom[0].pending.filter(user => user.id!== userId)
            }
        }
        this.publishClient.publish(channelId, JSON.stringify({
            type:"voting",
            pending:liveRoom[0].voted,
            voted:liveRoom[0].pending
        }));
        // *Chart Logic*
       const messageX = JSON.parse(message)
       const voteByUser = messageX.vote 
       if (liveRoom) {
        const previousPoint = liveRoom[0].userVotes.get(userId);
        
        // Set the current vote for the user
        liveRoom[0].userVotes.set(userId, voteByUser);
    
        // Check if the user has voted previously
        let previousPointVoters = liveRoom[0].chartTemp.get(previousPoint ?? Number.MIN_SAFE_INTEGER) || [];
        
        // Case 1: First Vote or Voting Different
        if (previousPoint !== voteByUser) {
            // If the user has voted previously, remove them from the previous point
            if (previousPoint) {
                previousPointVoters = previousPointVoters.filter(user => user.id !== userId);
                liveRoom[0].chartTemp.set(previousPoint, previousPointVoters);  // Update the previous point's voters
            }
    
            // Add the user to the new point's voter list
            let newPointVoters = liveRoom[0].chartTemp.get(voteByUser) || [];
            newPointVoters.push(votedParticipant!);  // Add the current user to the new point
            liveRoom[0].chartTemp.set(voteByUser, newPointVoters);
        }
    }


    }
    

    private redisCallbackHandler = (message: string, channel: string) => {
        console.log("Received message from Redis:", message);
        // const parsedMessage = JSON.parse("hey");
        this.reverseSubscriptions.get(channel)?.forEach(s => UserManager.getInstance().getUser(s)?.emit(message));
    }

    public userLeft(userId: string) {
        this.subscriptions.get(userId)?.forEach(s => this.unsubscribe(userId, s));
    }
}
